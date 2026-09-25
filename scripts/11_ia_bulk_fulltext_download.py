#!/usr/bin/env python3
"""
Phase 1: Internet Archive Bulk Full-Text Download
Downloads ALL available Indian Standards OCR texts from archive.org
Priority: Mandatory QCO standards first, then by division code
"""

import json, os, re, time, logging, requests
from pathlib import Path
from datetime import datetime

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
QCO_PATH = DATA_DIR / '03_regulatory_qco' / 'qco_mapping_matrix.json'

RAW_DIR.mkdir(parents=True, exist_ok=True)
Path('logs').mkdir(exist_ok=True)

DIVISION_PRIORITY = ['LITD','CHD','CED','MTD','ETD','TXD','FAD','MED','TED','MHD','GEN']
IA_SEARCH_URL = "https://archive.org/advancedsearch.php"
IA_DOWNLOAD_BASE = "https://archive.org/download"
REQUEST_DELAY = 0.35


def load_checkpoint():
    if CHECKPOINT_PATH.exists():
        with open(CHECKPOINT_PATH) as f:
            return json.load(f)
    return {"downloaded": [], "failed": [], "last_run": None}


def save_checkpoint(checkpoint):
    checkpoint["last_run"] = datetime.now().isoformat()
    with open(CHECKPOINT_PATH, 'w') as f:
        json.dump(checkpoint, f, indent=2)


def load_master_catalog():
    with open(CATALOG_PATH) as f:
        return json.load(f)


def normalize_is_number(is_num):
    s = str(is_num).lower().strip()
    s = re.sub(r'\s*:\s*\d{4}.*$', '', s)
    s = re.sub(r'\s*\(.*?\)', '', s)
    return s.strip()


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
        time.sleep(REQUEST_DELAY)
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


def get_txt_file_url(session, identifier):
    files_url = f"https://archive.org/metadata/{identifier}/files"
    try:
        resp = session.get(files_url, timeout=20)
        resp.raise_for_status()
        files = resp.json().get('result', [])
        djvu_txt = None
        plain_txt = None
        for f in files:
            name = f.get('name', '')
            if name.endswith('_djvu.txt'):
                djvu_txt = name; break
            elif name.endswith('.txt') and not djvu_txt:
                plain_txt = name
        chosen = djvu_txt or plain_txt
        if chosen:
            return f"{IA_DOWNLOAD_BASE}/{identifier}/{chosen}"
        return None
    except Exception as e:
        logger.debug(f"Error getting files for {identifier}: {e}")
        return None


def download_standard_text(session, url, output_path):
    try:
        resp = session.get(url, timeout=60, stream=True)
        resp.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        if output_path.stat().st_size < 500:
            output_path.unlink()
            return False
        return True
    except Exception as e:
        logger.debug(f"Download error {url}: {e}")
        if output_path.exists():
            output_path.unlink()
        return False


def build_download_queue(catalog, ia_identifiers, checkpoint):
    already_downloaded = set(checkpoint.get('downloaded', []))
    existing_files = {f.stem for f in RAW_DIR.glob('*.txt')}
    mandatory_queue, division_queues, other_queue = [], {div: [] for div in DIVISION_PRIORITY}, []
    for std in catalog:
        is_num = std.get('is_number', '')
        if not is_num or is_num in already_downloaded:
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
    logger.info(f"Queue: {len(mandatory_queue)} MANDATORY | {sum(len(v) for v in division_queues.values())} by division | {len(other_queue)} other = {len(queue)} total")
    return queue


def update_master_catalog_flags(catalog, downloaded_set):
    updated = 0
    for std in catalog:
        if std.get('is_number', '') in downloaded_set:
            std['fulltext_available'] = True
            updated += 1
    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    logger.info(f"Master catalog updated: {updated} standards marked fulltext_available=True")


def main():
    logger.info("=" * 70)
    logger.info("Phase 1: Internet Archive Bulk Full-Text Download")
    logger.info("=" * 70)
    checkpoint = load_checkpoint()
    catalog = load_master_catalog()

    session = requests.Session()
    session.headers['User-Agent'] = 'SIH2026-Research/1.0 (educational project)'

    # Step 1: Get/cache IA identifier list
    ia_cache_path = DATA_DIR / '02_fulltext_corpus' / 'ia_identifier_cache.json'
    if ia_cache_path.exists():
        logger.info("Loading cached IA identifiers...")
        with open(ia_cache_path) as f:
            ia_identifiers = json.load(f)
        logger.info(f"Loaded {len(ia_identifiers)} cached identifiers")
    else:
        ia_identifiers = get_all_ia_identifiers(session)
        with open(ia_cache_path, 'w') as f:
            json.dump(ia_identifiers, f, indent=2)

    # Step 2: Build priority queue
    queue = build_download_queue(catalog, ia_identifiers, checkpoint)
    if not queue:
        logger.info("No new standards to download. Everything already downloaded!")
        return

    # Step 3: Download
    logger.info(f"\nDownloading {len(queue)} standards (mandatory first)...\n")
    downloaded_this_run, failed_this_run, consecutive_errors = [], [], 0

    for i, (is_num, ia_id, div_code, is_mandatory) in enumerate(queue, 1):
        tag = "MANDATORY" if is_mandatory else div_code
        logger.info(f"[{i}/{len(queue)}] [{tag}] {is_num} → {ia_id}")

        txt_url = get_txt_file_url(session, ia_id)
        time.sleep(REQUEST_DELAY)
        if not txt_url:
            logger.warning(f"  No txt file for {ia_id}")
            failed_this_run.append(is_num); continue

        file_stem = re.sub(r'[^\w]', '_', is_num)
        output_path = RAW_DIR / f"{file_stem}.txt"
        success = download_standard_text(session, txt_url, output_path)
        time.sleep(REQUEST_DELAY)

        if success:
            size_kb = output_path.stat().st_size / 1024
            logger.info(f"  OK {size_kb:.1f}KB -> {output_path.name}")
            downloaded_this_run.append(is_num); consecutive_errors = 0
        else:
            logger.warning(f"  FAIL {is_num}")
            failed_this_run.append(is_num); consecutive_errors += 1

        if i % 50 == 0:
            checkpoint['downloaded'].extend(downloaded_this_run)
            checkpoint['failed'].extend(failed_this_run)
            save_checkpoint(checkpoint)
            update_master_catalog_flags(catalog, set(checkpoint['downloaded']))
            logger.info(f"\n--- Checkpoint at {i}: {len(downloaded_this_run)} downloaded, {len(failed_this_run)} failed ---\n")

        if consecutive_errors >= 10:
            logger.error("10 consecutive failures. Pausing 60s...")
            time.sleep(60); consecutive_errors = 0

    checkpoint['downloaded'].extend(downloaded_this_run)
    checkpoint['failed'].extend(failed_this_run)
    save_checkpoint(checkpoint)
    update_master_catalog_flags(catalog, set(checkpoint['downloaded']))

    logger.info("\n" + "="*70)
    logger.info("PHASE 1 COMPLETE")
    logger.info(f"Downloaded this run: {len(downloaded_this_run)}")
    logger.info(f"Failed this run:     {len(failed_this_run)}")
    logger.info(f"Total in RAW dir:    {len(list(RAW_DIR.glob('*.txt')))}")
    logger.info("NEXT: Run scripts/08_deep_fulltext_and_rag_builder.py")
    logger.info("="*70)


if __name__ == '__main__':
    main()
