#!/usr/bin/env python3
"""
Phase 1: Internet Archive Bulk Full-Text Downloader (High-Speed Concurrent)
Downloads ALL available Indian Standards OCR texts from archive.org
Priority: Mandatory QCO standards first, then prioritized by technical division.
Uses ThreadPoolExecutor for high-speed concurrent network I/O.
"""

import json, os, re, time, logging, requests
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('logs/11_ia_bulk_download.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
RAW_DIR = DATA_DIR / '02_fulltext_corpus' / 'raw_ia_downloads'
CATALOG_PATH = DATA_DIR / '01_master_catalog' / 'unified_standards.json'
CHECKPOINT_PATH = DATA_DIR / '02_fulltext_corpus' / 'ia_download_checkpoint.json'
IA_CACHE_PATH = DATA_DIR / '02_fulltext_corpus' / 'ia_identifier_cache.json'
QCO_PATH = DATA_DIR / '03_regulatory_qco' / 'qco_mapping_matrix.json'

RAW_DIR.mkdir(parents=True, exist_ok=True)
Path('logs').mkdir(exist_ok=True)

DIVISION_PRIORITY = ['LITD','CHD','CED','MTD','ETD','TXD','FAD','MED','TED','MHD','GEN']
IA_SEARCH_URL = "https://archive.org/advancedsearch.php"
IA_DOWNLOAD_BASE = "https://archive.org/download"
MAX_WORKERS = 25  # High-throughput concurrent downloads


def load_checkpoint():
    if CHECKPOINT_PATH.exists():
        try:
            with open(CHECKPOINT_PATH) as f:
                return json.load(f)
        except Exception:
            pass
    return {"downloaded": [], "failed": [], "last_run": None}


def save_checkpoint(checkpoint):
    checkpoint["last_run"] = datetime.now().isoformat()
    with open(CHECKPOINT_PATH, 'w') as f:
        json.dump(checkpoint, f, indent=2)


def load_master_catalog():
    with open(CATALOG_PATH) as f:
        return json.load(f)


def is_number_to_ia_patterns(is_num):
    s = str(is_num).strip()
    base_match = re.match(r'IS\s+(\d+)', s, re.IGNORECASE)
    if not base_match:
        return []
    base_num = base_match.group(1)
    part_match = re.search(r'PART\s*(\d+)', s, re.IGNORECASE)
    part_num = part_match.group(1) if part_match else None
    patterns = []
    if part_num:
        patterns.append(f"gov.in.is.{base_num}.{part_num}")
    patterns.append(f"gov.in.is.{base_num}")
    return patterns


def get_all_ia_identifiers(session):
    """Retrieve ALL gov.in.is.* identifiers from Internet Archive."""
    logger.info("Fetching complete list of gov.in.is.* identifiers from Internet Archive...")
    all_identifiers = {}
    page = 1
    rows = 500
    while True:
        params = {
            'q': 'identifier:gov.in.is*',
            'fl[]': ['identifier','title','year'],
            'rows': rows, 'page': page,
            'output': 'json', 'sort[]': 'identifier asc'
        }
        try:
            resp = session.get(IA_SEARCH_URL, params=params, timeout=30)
            resp.raise_for_status()
            result = resp.json()
        except Exception as e:
            logger.error(f"IA search error page {page}: {e}")
            break
        docs = result.get('response', {}).get('docs', [])
        if not docs:
            break
        for doc in docs:
            ident = doc.get('identifier', '')
            if ident:
                all_identifiers[ident] = {'title': doc.get('title',''), 'year': doc.get('year','')}
        total = result.get('response', {}).get('numFound', 0)
        fetched = page * rows
        logger.info(f"  Page {page}: {min(fetched,total)}/{total} identifiers")
        if fetched >= total:
            break
        page += 1
        time.sleep(0.2)
    logger.info(f"Total IA identifiers found: {len(all_identifiers)}")
    return all_identifiers


def find_best_ia_identifier(is_num, ia_identifiers):
    patterns = is_number_to_ia_patterns(is_num)
    candidates = []
    for pattern in patterns:
        if pattern in ia_identifiers:
            candidates.append((pattern, ia_identifiers[pattern].get('year', '0')))
        for ident in ia_identifiers:
            if ident.startswith(pattern + '.') and ident not in [c[0] for c in candidates]:
                candidates.append((ident, ia_identifiers[ident].get('year', '0')))
    if not candidates:
        return None
    candidates.sort(key=lambda x: str(x[1]), reverse=True)
    return candidates[0][0]


def download_single_item(item_info):
    """
    Worker task: downloads OCR text for a single standard.
    Returns (is_num, success, size_kb, error_msg)
    """
    is_num, ia_id, div_code, is_mandatory = item_info
    file_stem = re.sub(r'[^\w]', '_', is_num)
    output_path = RAW_DIR / f"{file_stem}.txt"

    if output_path.exists() and output_path.stat().st_size > 500:
        return (is_num, True, output_path.stat().st_size / 1024, "already_exists")

    short_name = ia_id[7:] if ia_id.startswith('gov.in.') else ia_id
    candidate_urls = [
        f"{IA_DOWNLOAD_BASE}/{ia_id}/{short_name}_djvu.txt",
        f"{IA_DOWNLOAD_BASE}/{ia_id}/{short_name}.txt",
        f"{IA_DOWNLOAD_BASE}/{ia_id}/{ia_id}_djvu.txt",
        f"{IA_DOWNLOAD_BASE}/{ia_id}/{ia_id}.txt"
    ]

    session = requests.Session()
    session.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'

    # 1. Try fast direct URLs
    for url in candidate_urls:
        try:
            resp = session.get(url, timeout=20, stream=True)
            if resp.status_code == 200:
                with open(output_path, 'wb') as f:
                    for chunk in resp.iter_content(chunk_size=16384):
                        f.write(chunk)
                if output_path.stat().st_size > 500:
                    return (is_num, True, output_path.stat().st_size / 1024, None)
                else:
                    if output_path.exists():
                        output_path.unlink()
        except Exception:
            pass

    # 2. Fallback to metadata files query
    try:
        meta_url = f"https://archive.org/metadata/{ia_id}/files"
        resp = session.get(meta_url, timeout=20)
        if resp.status_code == 200:
            files = resp.json().get('result', [])
            target_name = None
            for f in files:
                fname = f.get('name', '')
                if fname.endswith('_djvu.txt'):
                    target_name = fname
                    break
                elif fname.endswith('.txt') and not target_name:
                    target_name = fname
            if target_name:
                dl_url = f"{IA_DOWNLOAD_BASE}/{ia_id}/{target_name}"
                dl_resp = session.get(dl_url, timeout=30, stream=True)
                if dl_resp.status_code == 200:
                    with open(output_path, 'wb') as f:
                        for chunk in dl_resp.iter_content(chunk_size=16384):
                            f.write(chunk)
                    if output_path.stat().st_size > 500:
                        return (is_num, True, output_path.stat().st_size / 1024, None)
                    else:
                        if output_path.exists():
                            output_path.unlink()
    except Exception as e:
        return (is_num, False, 0, str(e))

    return (is_num, False, 0, "No text file found")


def build_download_queue(catalog, ia_identifiers, checkpoint):
    already_downloaded = set(checkpoint.get('downloaded', []))
    existing_files = {f.stem for f in RAW_DIR.glob('*.txt') if f.stat().st_size > 500}
    mandatory_queue, division_queues, other_queue = [], {div: [] for div in DIVISION_PRIORITY}, []
    
    for std in catalog:
        is_num = std.get('is_number', '')
        if not is_num:
            continue
        file_stem = re.sub(r'[^\w]', '_', is_num)
        if file_stem in existing_files:
            continue
        ia_id = find_best_ia_identifier(is_num, ia_identifiers)
        if not ia_id:
            continue
        is_mandatory = std.get('regulatory_compliance', {}).get('is_mandatory', False)
        div_code = std.get('technical_committee', {}).get('division_code', 'GEN')
        entry = (is_num, ia_id, div_code, is_mandatory)
        if is_mandatory:
            mandatory_queue.append(entry)
        elif div_code in division_queues:
            division_queues[div_code].append(entry)
        else:
            other_queue.append(entry)

    queue = mandatory_queue
    for div in DIVISION_PRIORITY:
        queue.extend(division_queues.get(div, []))
    queue.extend(other_queue)
    logger.info(f"Queue Built: {len(mandatory_queue)} MANDATORY | {sum(len(v) for v in division_queues.values())} by division | {len(other_queue)} other = {len(queue)} total to process")
    return queue


def update_master_catalog_flags(catalog, downloaded_set):
    updated = 0
    # Division to ICS mapping default
    div_map = {
        "LITD": ["35.020", "31.020"],
        "CED": ["91.010", "93.010"],
        "ETD": ["29.020", "27.010"],
        "MTD": ["77.020", "77.140"],
        "CHD": ["71.020", "83.080"],
        "TXD": ["59.020", "61.020"],
        "FAD": ["67.020", "65.020"],
        "MED": ["21.020", "25.020"],
        "TED": ["43.020", "43.040"],
        "MHD": ["11.020", "11.040"],
        "GEN": ["01.040", "03.120"]
    }
    for std in catalog:
        if std.get('is_number', '') in downloaded_set:
            std['fulltext_available'] = True
            updated += 1
        if not std.get('ics_codes') or len(std.get('ics_codes')) == 0:
            div = std.get('technical_committee', {}).get('division_code', 'GEN')
            std['ics_codes'] = div_map.get(div, ["01.120"])
        if std.get('amendments') is None:
            std['amendments'] = []
            
    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    logger.info(f"Master catalog updated: {updated} standards marked fulltext_available=True")


def main():
    logger.info("=" * 70)
    logger.info("Phase 1: Internet Archive High-Speed Bulk Full-Text Downloader")
    logger.info(f"Workers: {MAX_WORKERS} concurrent threads")
    logger.info("=" * 70)

    checkpoint = load_checkpoint()
    catalog = load_master_catalog()

    session = requests.Session()
    session.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'

    # Step 1: Get or load cached IA identifiers
    if IA_CACHE_PATH.exists():
        logger.info("Loading cached IA identifiers...")
        with open(IA_CACHE_PATH) as f:
            ia_identifiers = json.load(f)
        logger.info(f"Loaded {len(ia_identifiers)} cached identifiers")
    else:
        ia_identifiers = get_all_ia_identifiers(session)
        with open(IA_CACHE_PATH, 'w') as f:
            json.dump(ia_identifiers, f, indent=2)

    # Step 2: Build priority queue
    queue = build_download_queue(catalog, ia_identifiers, checkpoint)
    if not queue:
        logger.info("All available standards already downloaded!")
        return

    logger.info(f"\nStarting concurrent download of {len(queue)} standards...\n")
    downloaded_set = set(checkpoint.get('downloaded', []))
    failed_set = set(checkpoint.get('failed', []))

    total_items = len(queue)
    completed_count = 0
    success_count = 0
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_item = {executor.submit(download_single_item, item): item for item in queue}

        for future in as_completed(future_to_item):
            completed_count += 1
            item = future_to_item[future]
            is_num, ia_id, div_code, is_mandatory = item
            tag = "MANDATORY" if is_mandatory else div_code

            try:
                is_num_res, success, size_kb, err = future.result()
                if success:
                    success_count += 1
                    downloaded_set.add(is_num_res)
                    if completed_count % 10 == 0 or is_mandatory:
                        elapsed = time.time() - start_time
                        rate = completed_count / elapsed if elapsed > 0 else 0
                        logger.info(f"[{completed_count}/{total_items}] ({rate:.1f}/s) [{tag}] OK {is_num} ({size_kb:.1f} KB)")
                else:
                    failed_set.add(is_num)
                    if completed_count % 20 == 0:
                        logger.warning(f"[{completed_count}/{total_items}] [{tag}] FAIL {is_num}: {err}")
            except Exception as e:
                failed_set.add(is_num)
                logger.error(f"Worker exception for {is_num}: {e}")

            if completed_count % 100 == 0:
                checkpoint['downloaded'] = list(downloaded_set)
                checkpoint['failed'] = list(failed_set)
                save_checkpoint(checkpoint)
                update_master_catalog_flags(catalog, downloaded_set)
                elapsed = time.time() - start_time
                logger.info(f"\n>>> PROGRESS: {completed_count}/{total_items} ({success_count} success, {len(failed_set)} failed) in {elapsed:.1f}s <<<\n")

    # Final save
    checkpoint['downloaded'] = list(downloaded_set)
    checkpoint['failed'] = list(failed_set)
    save_checkpoint(checkpoint)
    update_master_catalog_flags(catalog, downloaded_set)

    logger.info("\n" + "="*70)
    logger.info("PHASE 1 COMPLETE")
    logger.info(f"Total downloaded: {len(downloaded_set)}")
    logger.info(f"Total in raw dir: {len(list(RAW_DIR.glob('*.txt')))}")
    logger.info(f"Elapsed time:     {time.time() - start_time:.1f}s")
    logger.info("="*70)


if __name__ == '__main__':
    main()
