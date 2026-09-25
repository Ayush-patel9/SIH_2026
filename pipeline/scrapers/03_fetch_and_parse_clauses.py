import os
import sys
import json
import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
import internetarchive as ia
import httpx
from tqdm import tqdm

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from config.schemas import NormativeReference, ClauseData

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
FULLTEXT_DIR = os.path.join(DATA_DIR, "02_fulltext_corpus")
RAW_DOWNLOADS_DIR = os.path.join(FULLTEXT_DIR, "raw_ia_downloads")
PARSED_CLAUSES_DIR = os.path.join(FULLTEXT_DIR, "parsed_clauses")
GRAPH_DIR = os.path.join(FULLTEXT_DIR, "clause2_normative_graph")
MASTER_CATALOG_FILE = os.path.join(DATA_DIR, "01_master_catalog", "unified_standards.json")
REGULATORY_MATRIX_FILE = os.path.join(DATA_DIR, "03_regulatory_qco", "qco_mapping_matrix.json")

os.makedirs(RAW_DOWNLOADS_DIR, exist_ok=True)
os.makedirs(PARSED_CLAUSES_DIR, exist_ok=True)
os.makedirs(GRAPH_DIR, exist_ok=True)

# List of high-priority benchmark & QCO standards to download and parse deeply
CORE_BENCHMARK_STANDARDS = [
    # Civil & Construction
    "gov.in.is.1786.2008",    # TMT Bars
    "gov.in.is.456.2000",     # Plain and Reinforced Concrete
    "gov.in.is.269.2015",     # Ordinary Portland Cement
    "gov.in.is.1489.1.1991",  # PPC Cement Fly Ash
    "gov.in.is.800.2007",     # General Construction in Steel
    "gov.in.is.1893.1.2016",  # Earthquake Resistant Design of Structures
    "gov.in.is.13920.2016",   # Ductile Design of Reinforced Concrete
    "gov.in.is.383.2016",     # Coarse and Fine Aggregate
    "gov.in.is.516.1959",     # Method of Tests for Strength of Concrete
    "gov.in.is.1199.1959",    # Methods of Sampling and Analysis of Concrete
    "gov.in.is.10262.2019",   # Concrete Mix Proportioning - Guidelines
    "gov.in.is.2062.2011",    # Hot Rolled Medium and High Tensile Structural Steel
    "gov.in.is.1239.1.2004",  # Steel Tubes, Tubulars (Mild Steel)
    "gov.in.is.8329.2000",    # Ductile Iron Pipes
    "gov.in.is.277.2003",     # Galvanized Steel Sheets
    "gov.in.is.303.1989",     # Plywood for General Purposes
    "gov.in.is.710.1976",     # Marine Plywood
    "gov.in.is.2553.1.1990",  # Safety Glass Architectural

    # Electrical & Electronics
    "gov.in.is.694.2010",     # PVC Insulated Cables up to 1100V
    "gov.in.is.7098.1.1988",  # XLPE Insulated Cables
    "gov.in.is.1180.1.2014",  # Outdoor Distribution Transformers
    "gov.in.is.2026.1.2011",  # Power Transformers
    "gov.in.is.3043.1987",    # Code of Practice for Earthing
    "gov.in.is.732.1989",     # Electrical Wiring Installations
    "gov.in.is.13252.1.2010", # Information Technology Equipment - Safety
    "gov.in.is.616.2010",     # Audio, Video and Similar Electronic Apparatus - Safety
    "gov.in.is.16046.2015",   # Secondary Cells and Batteries (Lithium/Nickel)
    "gov.in.is.16102.1.2012", # Self-Ballasted LED Lamps - Safety
    "gov.in.is.10322.5.1.2012", # Fixed General Purpose Luminaires
    "gov.in.is.10322.5.2.2012", # Recessed Luminaires
    "gov.in.is.10322.5.3.2012", # Luminaires for Road and Street Lighting
    "gov.in.is.14286.2010",   # Solar Photovoltaic (PV) Modules

    # Mechanical, Safety, Toys, Consumer
    "gov.in.is.15683.2006",   # Portable Fire Extinguishers
    "gov.in.is.4151.2015",    # Protective Helmets for Two Wheeler Riders
    "gov.in.is.2347.2006",    # Domestic Pressure Cookers
    "gov.in.is.4250.1980",    # Domestic Electric Food Mixers & Grinders
    "gov.in.is.9873.1.2019",  # Safety of Toys (Mechanical & Physical)
    "gov.in.is.9873.2.2017",  # Safety of Toys (Flammability)
    "gov.in.is.9873.3.2017",  # Safety of Toys (Migration of Elements)
    "gov.in.is.15844.2010",   # Sports Footwear
    "gov.in.is.15298.2.2016", # Safety Footwear
    "gov.in.is.17631.2022",   # Work Chairs
    "gov.in.is.17632.2022",   # General Purpose Chairs and Stools
    "gov.in.is.17633.2022",   # Tables and Desks
    "gov.in.is.17634.2022",   # Storage Units (Almirahs / Lockers)
    "gov.in.is.1363.1.2002",  # Hexagon Head Bolts and Nuts (Grade C)
    "gov.in.is.1364.1.2002",  # Hexagon Head Bolts and Nuts (Grade A and B)

    # Chemicals, Water & Testing Standards
    "gov.in.is.10500.2012",   # Drinking Water - Specification
    "gov.in.is.14543.2004",   # Packaged Drinking Water
    "gov.in.is.252.1991",     # Caustic Soda
    "gov.in.is.10151.1982",   # PVC for Safe Use in Food & Water Contact
    "gov.in.is.1608.2005",    # Metallic Materials - Tensile Testing
    "gov.in.is.1599.2012",    # Metallic Materials - Bend Test
    "gov.in.is.228.1.1987",   # Methods of Chemical Analysis of Steels
    "gov.in.is.2770.1.1967",  # Methods of Testing Bond in Reinforced Concrete
    "gov.in.is.1417.2016",    # Gold and Gold Alloys - Fineness and Marking
]

def download_ia_text(identifier: str) -> Optional[str]:
    """Download OCR text (_djvu.txt or .txt) from Internet Archive"""
    clean_id = identifier.strip()
    target_path = os.path.join(RAW_DOWNLOADS_DIR, f"{clean_id}.txt")
    
    if os.path.exists(target_path) and os.path.getsize(target_path) > 100:
        with open(target_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
            
    try:
        item = ia.get_item(clean_id)
        # Find text file
        txt_file = None
        for f in item.files:
            fname = f.get("name", "")
            if fname.endswith("_djvu.txt"):
                txt_file = fname
                break
            elif fname.endswith(".txt") and not fname.endswith("_files.xml"):
                txt_file = fname
                
        if txt_file:
            logger.info(f"Downloading {txt_file} for {clean_id}...")
            url = f"https://archive.org/download/{clean_id}/{txt_file}"
            with httpx.Client(timeout=45.0, follow_redirects=True) as client:
                resp = client.get(url)
                if resp.status_code == 200 and len(resp.text) > 100:
                    with open(target_path, "w", encoding="utf-8") as f:
                        f.write(resp.text)
                    return resp.text
    except Exception as e:
        logger.warning(f"Failed downloading {clean_id} from IA: {e}")
        
    return None

def extract_clause_1_scope(text: str) -> Optional[str]:
    """Extract Clause 1 Scope text using boundary regex patterns"""
    if not text:
        return None
        
    # Regex to capture Clause 1: 1. SCOPE / 1 SCOPE / SCOPE up to Clause 2 (REFERENCES / NORMATIVE REFERENCES / TERMINOLOGY)
    patterns = [
        r"(?:^|\n)\s*(?:1\.?|SECTION\s*1)\s*(?:SCOPE|Scope)\s*[:\-\n](.*?)(?=(?:^|\n)\s*(?:2\.?|SECTION\s*2)\s*(?:REFERENCES|NORMATIVE\s*REFERENCES|TERMINOLOGY|DEFINITIONS|FIELD\s*OF\s*APPLICATION))",
        r"(?:^|\n)\s*1\s+SCOPE\s*\n(.*?)(?=(?:^|\n)\s*2\s+[A-Z\s]+)",
        r"(?:SCOPE|Scope)\s*[:\-\n]\s*(1\.1\s+.*?)(?=(?:^|\n)\s*2\s+[A-Z\s]+|\n\s*2\.\s+)",
        r"(?:^|\n)\s*(1\.1\s+This\s+standard\s+covers.*?)(?=(?:^|\n)\s*2\s+[A-Z\s]+|\n\s*2\.\s+)"
    ]
    
    for pat in patterns:
        m = re.search(pat, text, re.DOTALL | re.IGNORECASE)
        if m:
            scope_text = m.group(1).strip()
            # Clean excessive newlines/OCR spaces
            scope_text = re.sub(r"\n{2,}", "\n", scope_text)
            scope_text = re.sub(r"\s+", " ", scope_text)
            if len(scope_text) > 25:
                return scope_text[:2500] # Cap at 2500 chars
                
    return None

def extract_clause_2_references(text: str) -> List[Dict[str, Any]]:
    """Extract all cited normative references from Clause 2 and entire standard text"""
    references: List[Dict[str, Any]] = []
    if not text:
        return references
        
    # Isolate Clause 2 block if present
    ref_block_pattern = r"(?:^|\n)\s*(?:2\.?|SECTION\s*2)\s*(?:REFERENCES|NORMATIVE\s*REFERENCES|Normative\s*References)\s*[:\-\n](.*?)(?=(?:^|\n)\s*(?:3\.?|SECTION\s*3)\s*(?:TERMINOLOGY|DEFINITIONS|REQUIREMENTS|GENERAL|SYMBOLS))"
    m_block = re.search(ref_block_pattern, text, re.DOTALL | re.IGNORECASE)
    search_target = m_block.group(1) if m_block else text
    
    # Match patterns like "IS 1608 : 2005 Metallic materials - Tensile testing"
    ref_lines = re.findall(r"(?:IS|IS/IEC|IS/ISO)\s*[:\.\-]?\s*(\d+(?:\s*\(Part\s*\d+(?:/Sec\s*\d+)?\))?(?:\s*:\s*\d{4})?)\s*([^\n\r]+)", search_target)
    
    for is_num_raw, title_raw in ref_lines:
        is_clean = f"IS {is_num_raw.strip()}"
        is_clean = re.sub(r"\s*:\s*\d{4}", "", is_clean).strip() # Base IS
        title_clean = title_raw.strip()
        # Clean title text
        title_clean = re.sub(r"^[:\-\–\—\.]\s*", "", title_clean).strip()
        title_clean = re.split(r"(?:IS\s*\d+|Table\s*\d+|Clause\s*\d+)", title_clean)[0].strip()
        
        # Determine relation type based on keywords
        rel_type = "GENERAL_REFERENCE"
        t_low = title_clean.lower()
        if any(k in t_low for k in ["test", "testing", "determination", "method of test", "measurement"]):
            rel_type = "TEST_METHOD"
        elif any(k in t_low for k in ["sampling", "sample", "inspection"]):
            rel_type = "SAMPLING_STANDARD"
        elif any(k in t_low for k in ["chemical", "analysis", "spectrometric"]):
            rel_type = "CHEMICAL_ANALYSIS"
        elif any(k in t_low for k in ["safety", "protection", "flammability", "fire"]):
            rel_type = "SAFETY_REQUIREMENT"
        elif any(k in t_low for k in ["terminology", "vocabulary", "glossary", "definitions"]):
            rel_type = "TERMINOLOGY"
        elif any(k in t_low for k in ["installation", "code of practice", "erection", "laying"]):
            rel_type = "INSTALLATION_CODE"
            
        if not any(r["is_number"] == is_clean for r in references) and len(is_clean) > 3:
            references.append({
                "is_number": is_clean,
                "title": title_clean[:200] if title_clean else None,
                "relation_type": rel_type
            })
            
    # Fallback search across whole standard for direct standard citations
    if not references:
        citations = set(re.findall(r"\bIS\s+(\d{3,5}(?:\s*\(Part\s*\d+\))?)", text))
        for cit in citations:
            is_clean = f"IS {cit.strip()}"
            references.append({
                "is_number": is_clean,
                "title": None,
                "relation_type": "GENERAL_REFERENCE"
            })
            
    return references

def extract_clause_3_terminology(text: str) -> List[str]:
    """Extract defined technical terms from Clause 3 Terminology"""
    terms = []
    if not text:
        return terms
        
    term_block = re.search(r"(?:^|\n)\s*(?:3\.?|SECTION\s*3)\s*(?:TERMINOLOGY|DEFINITIONS)\s*[:\-\n](.*?)(?=(?:^|\n)\s*(?:4\.?|SECTION\s*4))", text, re.DOTALL | re.IGNORECASE)
    if term_block:
        lines = term_block.group(1).split("\n")
        for line in lines:
            # Pattern like 3.1 Characteristic Strength — The value of...
            m = re.search(r"^\s*3\.\d+\s+([A-Za-z\s\(\)\-\/]+?)(?:\s*[\—\-\:]|\s{2,}|\.|$)", line)
            if m:
                term = m.group(1).strip()
                if len(term) > 2 and len(term) < 60 and term not in terms:
                    terms.append(term)
                    
    return terms

def process_single_standard(identifier: str) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
    """Process a single standard: download text, parse clauses, build graph edges"""
    text = download_ia_text(identifier)
    if not text:
        return None, []
        
    parsed_id = identifier.replace("gov.in.is.", "").split(".")
    base_is = f"IS {parsed_id[0]}"
    if len(parsed_id) >= 3 and parsed_id[1].isdigit() and len(parsed_id[1]) <= 2:
        base_is = f"IS {parsed_id[0]} (Part {parsed_id[1]})"
        
    scope = extract_clause_1_scope(text)
    refs = extract_clause_2_references(text)
    terms = extract_clause_3_terminology(text)
    
    clause_record = {
        "is_number": base_is,
        "ia_identifier": identifier,
        "clause_1_scope": scope,
        "clause_2_normative_references": refs,
        "clause_3_terminology": terms,
        "total_chars_parsed": len(text)
    }
    
    # Save individual parsed clause JSON
    out_file = os.path.join(PARSED_CLAUSES_DIR, f"{identifier}.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(clause_record, f, indent=2, ensure_ascii=False)
        
    # Build graph edges
    edges = []
    for ref in refs:
        target_is = ref["is_number"]
        if target_is != base_is:
            edges.append({
                "source": base_is,
                "target": target_is,
                "relationship": "NORMATIVE_REFERENCE",
                "relation_type": ref.get("relation_type", "GENERAL_REFERENCE"),
                "target_title": ref.get("title")
            })
            
    return clause_record, edges

def run_phase_3_and_4_clause_parsing():
    """Execute full-text downloading, clause parsing, and knowledge graph construction"""
    logger.info("=== STARTING PHASES 3 & 4: BULK CLAUSE PARSER & NORMATIVE GRAPH BUILDER ===")
    
    # Gather target standards list
    target_ids = list(CORE_BENCHMARK_STANDARDS)
    
    # Ingest from master catalog if available
    if os.path.exists(MASTER_CATALOG_FILE):
        try:
            with open(MASTER_CATALOG_FILE, "r", encoding="utf-8") as f:
                cat = json.load(f)
            # Add all mandatory QCO standards
            for item in cat:
                if item.get("regulatory_compliance", {}).get("is_mandatory") and item.get("ia_identifier"):
                    if item["ia_identifier"] not in target_ids:
                        target_ids.append(item["ia_identifier"])
        except Exception as e:
            logger.warning(f"Error loading master catalog: {e}")
            
    logger.info(f"Targeting {len(target_ids)} priority & mandatory Indian Standards for deep clause-level extraction.")
    
    all_edges: List[Dict[str, Any]] = []
    parsed_count = 0
    
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_single_standard, ident): ident for ident in target_ids}
        for future in tqdm(as_completed(futures), total=len(futures), desc="Parsing Clauses & Normative Refs"):
            ident = futures[future]
            try:
                rec, edges = future.result()
                if rec:
                    parsed_count += 1
                    all_edges.extend(edges)
            except Exception as e:
                logger.warning(f"Error parsing {ident}: {e}")
                
    # Save unified normative edge list
    graph_edge_file = os.path.join(GRAPH_DIR, "normative_edges.json")
    with open(graph_edge_file, "w", encoding="utf-8") as f:
        json.dump(all_edges, f, indent=2, ensure_ascii=False)
        
    # Create Graph Summary Stats
    source_nodes = set(e["source"] for e in all_edges)
    target_nodes = set(e["target"] for e in all_edges)
    all_nodes = source_nodes.union(target_nodes)
    
    rel_type_counts = {}
    for e in all_edges:
        r = e.get("relation_type", "GENERAL")
        rel_type_counts[r] = rel_type_counts.get(r, 0) + 1
        
    logger.info("=" * 60)
    logger.info(f" CLAUSE & GRAPH EXTRACTION COMPLETE!")
    logger.info(f" Successfully parsed {parsed_count} full standard texts into structured clauses.")
    logger.info(f" Generated {len(all_edges)} Normative Reference Graph Edges connecting {len(all_nodes)} distinct Standards.")
    logger.info(f" Relational edge breakdown: {rel_type_counts}")
    logger.info(f" Graph Edge List saved -> {graph_edge_file}")
    logger.info("=" * 60)

if __name__ == "__main__":
    run_phase_3_and_4_clause_parsing()
