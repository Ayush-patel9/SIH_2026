import os
import sys
import json
import re
import time
import logging
from typing import Dict, Any, List
from concurrent.futures import ThreadPoolExecutor, as_completed
import internetarchive as ia
from tqdm import tqdm

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from config.schemas import UnifiedStandardRecord, TechnicalCommittee, AmendmentRecord, RegulatoryInfo

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
CATALOG_DIR = os.path.join(DATA_DIR, "01_master_catalog")
REGULATORY_DIR = os.path.join(DATA_DIR, "03_regulatory_qco")
CHECKPOINT_FILE = os.path.join(CATALOG_DIR, ".ia_metadata_checkpoint.json")
OUTPUT_MASTER_FILE = os.path.join(CATALOG_DIR, "unified_standards.json")
DIVISION_MAP_FILE = os.path.join(CATALOG_DIR, "division_committees.json")

# Mapping of Division Codes based on subject/committee prefixes
DIVISION_PREFIXES = {
    "CED": ("Civil Engineering Division", ["concrete", "cement", "building", "structural", "timber", "soil", "foundation", "masonry", "pipe", "sanitary", "water supply", "pavement"]),
    "ETD": ("Electrotechnical Division", ["cable", "transformer", "switchgear", "insulator", "battery", "motor", "generator", "wiring", "electrical", "voltage", "lighting"]),
    "MED": ("Mechanical Engineering Division", ["pump", "compressor", "boiler", "valve", "welding", "refrigeration", "pressure vessel", "gear", "engine", "air conditioning"]),
    "LITD": ("Electronics and Information Technology Division", ["electronic", "audio", "video", "information technology", "computer", "semiconductor", "display", "telecommunication", "software"]),
    "CHD": ("Chemical Division", ["chemical", "acid", "paint", "varnish", "rubber", "plastic", "polymer", "adhesive", "fertilizer", "detergent", "soap", "gas"]),
    "MTD": ("Metallurgical Engineering Division", ["steel", "iron", "aluminium", "copper", "alloy", "foundry", "forging", "heat treatment", "metallic", "tensile test"]),
    "TXD": ("Textile Division", ["textile", "cotton", "jute", "silk", "wool", "yarn", "fabric", "garment", "rope", "footwear"]),
    "FAD": ("Food and Agriculture Division", ["food", "grain", "oilseed", "dairy", "beverage", "drinking water", "pesticide", "agricultural", "tea", "coffee", "sugar"]),
    "PGD": ("Production and General Engineering Division", ["fastener", "bolt", "nut", "screw", "drawing", "metrology", "gauge", "hand tool", "bearing", "screw thread"]),
    "TED": ("Transport Engineering Division", ["automotive", "vehicle", "helmet", "tyre", "brake", "railway", "aircraft", "shipbuilding"]),
    "MHD": ("Medical Equipment and Hospital Planning Division", ["medical", "surgical", "hospital", "implant", "diagnostic", "syringe", "glove", "mask", "sterilizer"]),
    "MSD": ("Management and Systems Division", ["quality management", "environmental management", "risk management", "conformity assessment", "statistics"]),
    "AYD": ("Ayush Division", ["ayurveda", "siddha", "unani", "yoga", "herbal", "medicinal plant"]),
    "SSD": ("Services Sector Division", ["banking", "tourism", "education", "security services", "logistics"])
}

def parse_is_identifier(identifier: str) -> Dict[str, Any]:
    """Parse identifier like 'gov.in.is.1786.2008' or 'gov.in.is.13252.1.2010' or 'gov.in.is.sp.16.1980'"""
    parts = identifier.replace("gov.in.is.", "").split(".")
    
    # Check for Special Publications (SP)
    if len(parts) >= 2 and parts[0].lower() == "sp":
        sp_no = parts[1]
        year = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else None
        return {
            "is_number": f"SP {sp_no}",
            "standard_id": f"SP {sp_no}:{year}" if year else f"SP {sp_no}",
            "year_published": year
        }
    
    # Regular standard with parts: [number, (part), year]
    is_num = parts[0]
    part_no = None
    year = None
    
    if len(parts) == 2:
        if parts[1].isdigit() and len(parts[1]) == 4:
            year = int(parts[1])
        else:
            is_num = f"{parts[0]} (Part {parts[1]})"
    elif len(parts) >= 3:
        if parts[1].isdigit() and len(parts[1]) <= 2:
            is_num = f"{parts[0]} (Part {parts[1]})"
        if parts[-1].isdigit() and len(parts[-1]) == 4:
            year = int(parts[-1])
            
    std_id = f"IS {is_num}:{year}" if year else f"IS {is_num}"
    return {
        "is_number": f"IS {is_num}",
        "standard_id": std_id,
        "year_published": year
    }

def infer_division(title: str, subject: Any) -> TechnicalCommittee:
    """Infer the technical division from title and subject keywords"""
    text = (title or "").lower()
    if isinstance(subject, list):
        text += " " + " ".join([str(s).lower() for s in subject])
    elif isinstance(subject, str):
        text += " " + subject.lower()
        
    for div_code, (div_name, keywords) in DIVISION_PREFIXES.items():
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", text):
                return TechnicalCommittee(division_code=div_code, division_name=div_name)
                
    return TechnicalCommittee(division_code="GEN", division_name="General Engineering & Miscellaneous")

def load_qco_matrix() -> Dict[str, Dict[str, Any]]:
    matrix_file = os.path.join(REGULATORY_DIR, "qco_mapping_matrix.json")
    if os.path.exists(matrix_file):
        with open(matrix_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def process_ia_item(item_data: Dict[str, Any], qco_matrix: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Extract and structure metadata for a single IA standard record"""
    identifier = item_data.get("identifier", "")
    parsed_id = parse_is_identifier(identifier)
    
    raw_title = item_data.get("title", "")
    # Clean up standard prefix from title if present
    cleaned_title = re.sub(r"^IS\s*[\d\(\)\s\:\.\-]+", "", raw_title, flags=re.IGNORECASE).strip()
    if not cleaned_title:
        cleaned_title = raw_title
        
    is_num = parsed_id["is_number"]
    std_id = parsed_id["standard_id"]
    year = parsed_id["year_published"]
    
    # Extract amendments and files
    amendments = []
    files_list = item_data.get("files", [])
    has_fulltext = False
    
    for f in files_list:
        fname = f.get("name", "") if isinstance(f, dict) else str(f)
        if fname.endswith(".txt") or fname.endswith("_djvu.txt"):
            has_fulltext = True
        # Check amendment pattern: zIS1786Amd.1:2012.pdf or Amd_1
        amd_match = re.search(r"Amd\.?\s*(\d+)[:\._]?(\d{4})?", fname, re.IGNORECASE)
        if amd_match:
            amd_no = int(amd_match.group(1))
            amd_year = amd_match.group(2) if amd_match.group(2) else None
            if not any(a["amendment_no"] == amd_no for a in amendments):
                amendments.append({
                    "amendment_no": amd_no,
                    "gazette_date": amd_year,
                    "summary": f"Amendment No. {amd_no} ({amd_year})" if amd_year else f"Amendment No. {amd_no}",
                    "filename": fname
                })
                
    # Sort amendments by number
    amendments.sort(key=lambda x: x["amendment_no"])
    
    # Infer technical division
    subject = item_data.get("subject", [])
    committee = infer_division(raw_title, subject)
    
    # Check regulatory QCO matrix
    reg_info = RegulatoryInfo()
    norm_is = is_num.upper()
    if norm_is in qco_matrix:
        q_data = qco_matrix[norm_is]
        reg_info.is_mandatory = True
        reg_info.scheme = q_data.get("scheme")
        reg_info.notifying_ministry = q_data.get("ministry")
        reg_info.qco_order_name = q_data.get("qco_order_name")
        reg_info.qco_gazette_notification = q_data.get("notification_number")
        reg_info.enforcement_date = q_data.get("enforcement_date")
        reg_info.exemption_clauses = q_data.get("exemptions")
    else:
        # Check base IS without part
        base_is = re.sub(r"\s*\(Part\s*\d+\)", "", norm_is).strip()
        if base_is in qco_matrix:
            q_data = qco_matrix[base_is]
            reg_info.is_mandatory = True
            reg_info.scheme = q_data.get("scheme")
            reg_info.notifying_ministry = q_data.get("ministry")
            reg_info.qco_order_name = q_data.get("qco_order_name")
            reg_info.qco_gazette_notification = q_data.get("notification_number")
            reg_info.enforcement_date = q_data.get("enforcement_date")
            reg_info.exemption_clauses = q_data.get("exemptions")
            
    record = {
        "is_number": is_num,
        "standard_id": std_id,
        "year_published": year,
        "reaffirmation_year": None,
        "edition": "Standard Published Edition",
        "title": cleaned_title,
        "full_title": raw_title,
        "status": "ACTIVE",
        "ia_identifier": identifier,
        "technical_committee": {
            "division_code": committee.division_code,
            "division_name": committee.division_name
        },
        "ics_codes": [s for s in (subject if isinstance(subject, list) else [str(subject)]) if re.match(r"^\d{2}\.\d{3}", str(s))],
        "amendments": amendments,
        "regulatory_compliance": reg_info.model_dump(),
        "fulltext_available": has_fulltext,
        "source_ia_url": f"https://archive.org/details/{identifier}"
    }
    
    return record

def harvest_ia_catalog(max_items: int = None, batch_size: int = 500):
    """Harvest metadata for all Indian Standards from Internet Archive"""
    os.makedirs(CATALOG_DIR, exist_ok=True)
    qco_matrix = load_qco_matrix()
    logger.info(f"Loaded QCO Fast-Lookup Matrix with {len(qco_matrix)} standard keys.")
    
    checkpoint_data = {}
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
                checkpoint_data = json.load(f)
            logger.info(f"Resuming from checkpoint with {len(checkpoint_data)} records previously ingested.")
        except Exception as e:
            logger.warning(f"Could not load checkpoint: {e}")
            checkpoint_data = {}

    query = "collection:publicsafetycode AND identifier:gov.in.is.*"
    logger.info(f"Executing Internet Archive search query: '{query}'...")
    search = ia.search_items(query, fields=["identifier", "title", "subject", "date", "year", "files"])
    
    all_records: Dict[str, Dict[str, Any]] = checkpoint_data
    total_found = 0
    buffer = []
    
    try:
        for i, item in enumerate(tqdm(search, desc="Harvesting Standards Catalog")):
            if max_items and i >= max_items:
                break
                
            ident = item.get("identifier")
            if not ident or ident in all_records:
                continue
                
            rec = process_ia_item(item, qco_matrix)
            all_records[ident] = rec
            total_found += 1
            
            # Periodic checkpoint save
            if total_found % batch_size == 0:
                with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
                    json.dump(all_records, f, indent=2, ensure_ascii=False)
                logger.info(f"Checkpoint saved: {len(all_records)} standards catalogued so far.")
    except Exception as e:
        logger.warning(f"Search iteration stopped: {e}. Finalizing {len(all_records)} records...")
            
    # Final save
    records_list = list(all_records.values())
    
    with open(OUTPUT_MASTER_FILE, "w", encoding="utf-8") as f:
        json.dump(records_list, f, indent=2, ensure_ascii=False)
        
    with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_records, f, indent=2, ensure_ascii=False)
        
    # Division stats compilation
    division_stats = {}
    mandatory_count = 0
    for r in records_list:
        div = r["technical_committee"]["division_code"]
        division_stats[div] = division_stats.get(div, 0) + 1
        if r.get("regulatory_compliance", {}).get("is_mandatory"):
            mandatory_count += 1
            
    with open(DIVISION_MAP_FILE, "w", encoding="utf-8") as f:
        json.dump(division_stats, f, indent=2)
        
    logger.info("=" * 60)
    logger.info(f" MASTER CATALOG COMPLETE: Ingested {len(records_list)} Indian Standards!")
    logger.info(f" Statutory Mandatory QCO Standards identified: {mandatory_count}")
    logger.info(f" Division distribution: {division_stats}")
    logger.info(f" Saved to {OUTPUT_MASTER_FILE}")
    logger.info("=" * 60)

if __name__ == "__main__":
    harvest_ia_catalog()
