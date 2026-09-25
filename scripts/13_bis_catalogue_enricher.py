#!/usr/bin/env python3
"""
Phase 3: BIS Catalogue Metadata Enricher
Adds ICS codes, amendment history, gazette links, degree of equivalence
for all 21,992 standards in the master catalog.

Source: standards.bis.gov.in/website/know-your-standards (per-standard POST)
Rate limit: 1-2 req/sec with exponential backoff
"""

import json, re, time, logging
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('logs/13_bis_enricher.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
CATALOG_PATH = DATA_DIR / '01_master_catalog' / 'unified_standards.json'
ENRICHED_PATH = DATA_DIR / '01_master_catalog' / 'enrichment_cache.json'
CHECKPOINT_PATH = DATA_DIR / '01_master_catalog' / 'enrichment_checkpoint.json'
Path('logs').mkdir(exist_ok=True)

REQUEST_DELAY = 0.7  # ~1.4 req/sec
MAX_RETRIES = 3

# ICS code reference — top-level field codes for semantic routing
ICS_FIELD_MAP = {
    '01': 'Generalities, Terminology, Standardization, Documentation',
    '03': 'Services, Company Organization, Management, Quality',
    '07': 'Mathematics, Natural Sciences',
    '11': 'Health Care Technology',
    '13': 'Environment, Health Protection, Safety',
    '17': 'Metrology and Measurement, Physical Phenomena',
    '19': 'Testing',
    '21': 'Mechanical Systems and Components for General Use',
    '23': 'Fluid Systems and Components for General Use',
    '25': 'Manufacturing Engineering',
    '27': 'Energy and Heat Transfer Engineering',
    '29': 'Electrical Engineering',
    '31': 'Electronics',
    '33': 'Telecommunications, Audio and Video Engineering',
    '35': 'Information Technology, Office Machines',
    '37': 'Image Technology',
    '39': 'Precision Mechanics, Jewellery',
    '43': 'Road Vehicles Engineering',
    '45': 'Railway Engineering',
    '47': 'Shipbuilding and Marine Structures',
    '49': 'Aircraft and Space Vehicle Engineering',
    '53': 'Materials Handling Equipment',
    '55': 'Packaging and Distribution of Goods',
    '59': 'Textile and Leather Technology',
    '61': 'Clothing Industry',
    '65': 'Agriculture',
    '67': 'Food Technology',
    '71': 'Chemical Technology',
    '73': 'Mining and Minerals',
    '75': 'Petroleum and Related Technologies',
    '77': 'Metallurgy',
    '79': 'Wood Technology',
    '81': 'Glass and Ceramics Industries',
    '83': 'Rubber and Plastics Industries',
    '85': 'Paper Technology',
    '87': 'Paint and Colour Industries',
    '91': 'Construction Materials and Building',
    '93': 'Civil Engineering',
    '95': 'Military Engineering',
}

# Division-to-ICS mapping for heuristic enrichment when BIS portal is unavailable
DIVISION_ICS_HEURISTIC = {
    'LITD': ['35', '33', '31'],  # IT, Telecommunications, Electronics
    'ETD':  ['29', '31'],         # Electrical, Electronics
    'CED':  ['91', '93'],         # Construction, Civil Engineering
    'MTD':  ['77'],               # Metallurgy
    'CHD':  ['71', '83', '87'],   # Chemicals, Rubber, Paint
    'TXD':  ['59', '61'],         # Textiles, Clothing
    'FAD':  ['67', '65'],         # Food, Agriculture
    'MED':  ['21', '23', '25'],   # Mechanical
    'TED':  ['27'],               # Energy, Heat Transfer
    'MHD':  ['53'],               # Materials Handling
    'EED':  ['27'],               # Energy/Environment
    'PGD':  ['75', '73'],         # Petroleum, Mining
    'MSD':  ['17'],               # Metrology
    'PCD':  ['19'],               # Testing
    'HMD':  ['49', '43'],         # Vehicles
    'GEN':  ['01'],               # General
}


def load_enrichment_cache():
    if ENRICHED_PATH.exists():
        with open(ENRICHED_PATH) as f:
            return json.load(f)
    return {}


def save_enrichment_cache(cache):
    with open(ENRICHED_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)


def load_checkpoint():
    if CHECKPOINT_PATH.exists():
        with open(CHECKPOINT_PATH) as f:
            return json.load(f)
    return {"enriched": [], "failed": [], "last_run": None}


def save_checkpoint(cp):
    cp["last_run"] = datetime.now().isoformat()
    with open(CHECKPOINT_PATH, 'w') as f:
        json.dump(cp, f, indent=2)


def clean_text(s):
    if not s:
        return ''
    return re.sub(r'\s+', ' ', str(s)).strip()


def parse_bis_standard_page(html_text: str, is_number: str) -> dict:
    """Parse the BIS Know Your Standard page response for a given IS number."""
    soup = BeautifulSoup(html_text, 'html.parser')
    result = {
        'ics_codes': [],
        'amendments': [],
        'year_published': None,
        'degree_of_equivalence': None,
        'superseded_by': None,
        'supersedes': None,
        'gazette_notification': None,
        'technical_committee': None,
        'pages': None,
        'price_group': None,
        'withdrawn_year': None,
    }

    # Look for ICS codes (usually in a table or labelled div)
    full_text = soup.get_text()
    ics_pattern = re.findall(r'\b(\d{2}\.\d{3}(?:\.\d{2})?)\b', full_text)
    if ics_pattern:
        result['ics_codes'] = list(set(ics_pattern))

    # Year published
    year_match = re.search(r'(?:Year|Published|Edition)\s*:?\s*(\d{4})', full_text, re.IGNORECASE)
    if year_match:
        result['year_published'] = int(year_match.group(1))

    # Gazette notification
    gazette_match = re.search(r'SO\s+(\d+\(?E?\)?)\s+dated?\s+([0-9.\-/]+)', full_text, re.IGNORECASE)
    if gazette_match:
        result['gazette_notification'] = f"SO {gazette_match.group(1)} dated {gazette_match.group(2)}"

    # Degree of equivalence
    equiv_match = re.search(r'(Identical|Technically Equivalent|Modified|Not Equivalent)\s+to\s+(IS[O]?|IEC)\s*([\w\-:\s]+)', full_text, re.IGNORECASE)
    if equiv_match:
        result['degree_of_equivalence'] = clean_text(equiv_match.group(0))

    # Amendments
    amend_matches = re.finditer(r'Amendment\s+(?:No\.?\s*)?(\d+)[,\s]+(\d{4})', full_text, re.IGNORECASE)
    amendments = []
    for m in amend_matches:
        amendments.append({'no': int(m.group(1)), 'year': int(m.group(2))})
    if amendments:
        result['amendments'] = sorted(amendments, key=lambda x: x['no'])

    # Technical committee
    tc_match = re.search(r'Technical\s+Committee\s*:?\s*([A-Z]+\s+\d+)', full_text, re.IGNORECASE)
    if tc_match:
        result['technical_committee'] = clean_text(tc_match.group(1))

    # Pages
    pages_match = re.search(r'(\d+)\s+pages?', full_text, re.IGNORECASE)
    if pages_match:
        result['pages'] = int(pages_match.group(1))

    # Supersedes / superseded by
    super_match = re.search(r'Supersedes?\s+(IS[\s\d\(\)]+)', full_text, re.IGNORECASE)
    if super_match:
        result['supersedes'] = clean_text(super_match.group(1))

    super_by_match = re.search(r'Superseded\s+by\s+(IS[\s\d\(\)]+)', full_text, re.IGNORECASE)
    if super_by_match:
        result['superseded_by'] = clean_text(super_by_match.group(1))

    return result


def fetch_bis_enrichment(session, is_number: str) -> dict | None:
    """Fetch enrichment data for one IS number from standards.bis.gov.in."""
    url = "https://standards.bis.gov.in/website/know-your-standards"
    # Clean IS number for query
    clean_num = re.sub(r'IS\s*', '', is_number, flags=re.IGNORECASE).strip()
    clean_num = re.sub(r'\s*\(.*?\)', '', clean_num).strip()
    clean_num = re.sub(r':\d{4}', '', clean_num).strip()

    for attempt in range(MAX_RETRIES):
        try:
            resp = session.get(url, params={'is_number': clean_num}, timeout=20)
            if resp.status_code == 200 and len(resp.text) > 500:
                return parse_bis_standard_page(resp.text, is_number)
            elif resp.status_code == 429:
                wait = 2 ** attempt * 5
                logger.warning(f"  Rate limited. Waiting {wait}s...")
                time.sleep(wait)
            else:
                break
        except Exception as e:
            logger.debug(f"  Error fetching {is_number}: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(2 ** attempt)
    return None


def infer_ics_heuristic(std: dict) -> list:
    """Generate heuristic ICS codes from division and title keywords when portal fails."""
    div = std.get('technical_committee', {}).get('division_code', 'GEN')
    title = std.get('title', '').lower()

    # Get division-based ICS
    codes = DIVISION_ICS_HEURISTIC.get(div, ['01'])

    # Refine by title keywords
    keyword_ics = {
        'cement': ['91.100.10'],
        'concrete': ['91.100.30'],
        'steel': ['77.140'],
        'reinforcement': ['77.140.15'],
        'pipe': ['23.040'],
        'valve': ['23.060'],
        'electrical': ['29.060'],
        'cable': ['29.060.20'],
        'transformer': ['29.180'],
        'it equipment': ['35.160'],
        'information technology': ['35.020'],
        'food': ['67.040'],
        'water': ['13.060'],
        'paint': ['87.040'],
        'rubber': ['83.040'],
        'textile': ['59.080'],
        'fastener': ['21.060'],
        'bolt': ['21.060.10'],
        'nut': ['21.060.20'],
        'safety': ['13.220'],
        'testing': ['19.020'],
    }

    full_codes = list(codes)
    for keyword, ics_list in keyword_ics.items():
        if keyword in title:
            full_codes.extend(ics_list)
            break

    return list(set(full_codes))[:3]  # Return up to 3 ICS codes


def enrich_catalog(catalog: list, enrichment_cache: dict, checkpoint: dict, session) -> list:
    """Main enrichment loop over all standards."""
    already_enriched = set(checkpoint.get('enriched', []))
    failed = set(checkpoint.get('failed', []))
    enriched_this_run = []

    for i, std in enumerate(catalog):
        is_num = std.get('is_number', '')
        if not is_num or is_num in already_enriched:
            continue

        # Check cache first
        if is_num in enrichment_cache:
            enrichment = enrichment_cache[is_num]
        else:
            # Try fetching from BIS portal
            enrichment = fetch_bis_enrichment(session, is_num)
            time.sleep(REQUEST_DELAY)

            if enrichment:
                enrichment_cache[is_num] = enrichment
                logger.debug(f"  [{i}] {is_num}: BIS portal enriched (ICS: {enrichment.get('ics_codes', [])})")
            else:
                # Fall back to heuristic
                heuristic_ics = infer_ics_heuristic(std)
                enrichment = {
                    'ics_codes': heuristic_ics,
                    'amendments': std.get('amendments', []),
                    'source': 'heuristic'
                }
                enrichment_cache[is_num] = enrichment

        # Apply enrichment to standard record
        if enrichment.get('ics_codes'):
            std['ics_codes'] = enrichment['ics_codes']
        if enrichment.get('amendments'):
            if not std.get('amendments'):
                std['amendments'] = enrichment['amendments']
        if enrichment.get('year_published') and not std.get('year_published'):
            std['year_published'] = enrichment['year_published']
        if enrichment.get('gazette_notification'):
            if 'regulatory_compliance' not in std:
                std['regulatory_compliance'] = {}
            std['regulatory_compliance']['gazette_notification'] = enrichment['gazette_notification']
        if enrichment.get('degree_of_equivalence'):
            std['degree_of_equivalence'] = enrichment['degree_of_equivalence']
        if enrichment.get('supersedes'):
            std['supersedes'] = enrichment['supersedes']
        if enrichment.get('superseded_by'):
            std['superseded_by'] = enrichment['superseded_by']

        enriched_this_run.append(is_num)

        if i % 100 == 0 and i > 0:
            logger.info(f"Progress: {i}/{len(catalog)} | Enriched: {len(enriched_this_run)} this run")
            checkpoint['enriched'].extend(enriched_this_run)
            save_checkpoint(checkpoint)
            save_enrichment_cache(enrichment_cache)
            enriched_this_run = []

    return catalog, enriched_this_run


def main():
    logger.info("="*70)
    logger.info("Phase 3: BIS Catalogue Metadata Enricher")
    logger.info("="*70)

    with open(CATALOG_PATH) as f:
        catalog = json.load(f)

    enrichment_cache = load_enrichment_cache()
    checkpoint = load_checkpoint()

    logger.info(f"Catalog size: {len(catalog)} standards")
    logger.info(f"Already enriched: {len(checkpoint.get('enriched', []))}")
    logger.info(f"Cache size: {len(enrichment_cache)}")

    session = requests.Session()
    session.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

    # Run enrichment
    catalog, final_batch = enrich_catalog(catalog, enrichment_cache, checkpoint, session)

    # Save everything
    checkpoint['enriched'].extend(final_batch)
    save_checkpoint(checkpoint)
    save_enrichment_cache(enrichment_cache)

    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    # Stats
    with_ics = sum(1 for s in catalog if s.get('ics_codes'))
    with_amend = sum(1 for s in catalog if s.get('amendments'))
    with_equiv = sum(1 for s in catalog if s.get('degree_of_equivalence'))

    logger.info("\n" + "="*70)
    logger.info("PHASE 3 COMPLETE")
    logger.info(f"  Standards with ICS codes:         {with_ics}/{len(catalog)} ({with_ics/len(catalog)*100:.1f}%)")
    logger.info(f"  Standards with amendments:        {with_amend}/{len(catalog)}")
    logger.info(f"  Standards with ISO/IEC equiv:     {with_equiv}/{len(catalog)}")
    logger.info("="*70)


if __name__ == '__main__':
    main()
