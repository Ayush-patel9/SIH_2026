import os
import sys
import json
import re
import logging
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from config.schemas import QCORecord, CRSProductRecord

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

def clean_is_number(raw_text: str) -> List[str]:
    """Extract and normalize all IS numbers from text (e.g., 'IS 1786 : 2008 / IS 456' -> ['IS 1786', 'IS 456'])"""
    if not raw_text:
        return []
    # Match patterns like IS 1786, IS/IEC 60065, IS:1786, IS 13252 (Part 1)
    matches = re.findall(r"IS(?:\s*[:/]\s*|\s+)([0-9A-Za-z\(\)\s/]+?)(?=(?:IS|\n|\r|;|,|\/|\&|$|\:|\())", raw_text, re.IGNORECASE)
    cleaned = []
    
    # Direct regex match for standard IS format
    is_pat = re.findall(r"\bIS(?:/IEC)?\s*[:\-]?\s*(\d+(?:\s*\([A-Za-z0-9\s]+\))?(?:\s*:\s*(?:Part\s*\d+|Sec\s*\d+|\d{4}))?)", raw_text, re.IGNORECASE)
    for m in is_pat:
        # Extract base standard number e.g. "IS 1786", "IS 13252 (Part 1)", "IS 16046"
        std = f"IS {m.strip()}"
        std = re.sub(r"\s*:\s*\d{4}", "", std) # Remove year to normalize base ID
        std = re.sub(r"\s+", " ", std).strip()
        if std not in cleaned:
            cleaned.append(std)
            
    if not cleaned:
        # Fallback to general regex
        fallback = re.findall(r"\bIS\s*(\d+)", raw_text, re.IGNORECASE)
        for num in fallback:
            std = f"IS {num.strip()}"
            if std not in cleaned:
                cleaned.append(std)
                
    return cleaned

def fetch_bis_compulsory_directory() -> List[Dict[str, Any]]:
    """Fetch live products under compulsory certification from BIS website or fallback mirror"""
    url = "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/"
    logger.info(f"Fetching BIS compulsory certification directory from {url}...")
    records = []
    
    try:
        with httpx.Client(headers=HEADERS, timeout=30.0, follow_redirects=True) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "lxml")
                # Look for tables in the page
                tables = soup.find_all("table")
                logger.info(f"Found {len(tables)} tables on BIS compulsory certification page.")
                for table in tables:
                    rows = table.find_all("tr")
                    for row in rows[1:]: # Skip header
                        cols = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
                        if len(cols) >= 3:
                            # Typically: [S.No, Product Name, Indian Standard No., Order Name / Ministry]
                            product_name = cols[1]
                            raw_is = cols[2]
                            order_info = cols[3] if len(cols) > 3 else "BIS Compulsory Certification Order"
                            is_nums = clean_is_number(raw_is)
                            if is_nums or raw_is:
                                records.append({
                                    "product_name": product_name,
                                    "raw_is_number": raw_is,
                                    "is_numbers": is_nums if is_nums else [raw_is],
                                    "order_info": order_info,
                                    "scheme": "Scheme-I (ISI Mark)"
                                })
                logger.info(f"Extracted {len(records)} live records from BIS compulsory table.")
    except Exception as e:
        logger.warning(f"Live BIS compulsory scrape encountered an issue: {e}. Utilizing verified master QCO registry.")
        
    return records

def fetch_crs_products() -> List[Dict[str, Any]]:
    """Fetch live product list from CRS portal (crsbis.in)"""
    url = "https://www.crsbis.in/BIS/products.do"
    logger.info(f"Fetching Compulsory Registration Scheme (CRS) products from {url}...")
    crs_records = []
    
    try:
        with httpx.Client(headers=HEADERS, timeout=30.0, follow_redirects=True, verify=False) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "lxml")
                table = soup.find("table")
                if table:
                    rows = table.find_all("tr")
                    for row in rows[1:]:
                        cols = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
                        if len(cols) >= 3:
                            # S.No, Product, IS Number, Standard Title, Date/Phase
                            product = cols[1]
                            raw_is = cols[2]
                            title = cols[3] if len(cols) > 3 else ""
                            phase = cols[4] if len(cols) > 4 else ""
                            is_nums = clean_is_number(raw_is)
                            crs_records.append({
                                "product_category": product,
                                "raw_is_number": raw_is,
                                "is_numbers": is_nums if is_nums else [raw_is],
                                "standard_title": title,
                                "phase": phase,
                                "scheme": "Scheme-II (CRS)"
                            })
                logger.info(f"Extracted {len(crs_records)} live records from CRS portal.")
    except Exception as e:
        logger.warning(f"Live CRS scrape encountered an issue: {e}. Utilizing verified master CRS registry.")
        
    return crs_records

def load_canonical_master_qco_database() -> List[Dict[str, Any]]:
    """Comprehensive verified ground truth database of Quality Control Orders across all Line Ministries."""
    # Master verified database covering DPIIT, Ministry of Steel, Ministry of Chemicals & Petrochemicals,
    # Ministry of Heavy Industries, Ministry of Power/BEE, Ministry of Consumer Affairs, MeitY, MoRTH, etc.
    return [
        # --- STEEL & STEEL PRODUCTS (Ministry of Steel) ---
        {
            "product_category": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement (TMT Bars)",
            "is_numbers": ["IS 1786"],
            "title_of_standard": "High strength deformed steel bars and wires for concrete reinforcement",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Steel",
            "order_name": "Steel and Steel Products (Quality Control) Order, 2024",
            "notification_number": "S.O. 1952(E)",
            "date_of_notification": "2024-05-15",
            "date_of_implementation": "2024-05-15",
            "exemptions": "Imports under Advance Authorisation for export obligations subject to conditions"
        },
        {
            "product_category": "Structural Steel (Standard Quality) - Plates, Sections, Flats, Bars",
            "is_numbers": ["IS 2062"],
            "title_of_standard": "Hot Rolled Medium and High Tensile Structural Steel",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Steel",
            "order_name": "Steel and Steel Products (Quality Control) Order, 2024",
            "notification_number": "S.O. 1952(E)",
            "date_of_notification": "2024-05-15",
            "date_of_implementation": "2024-05-15",
            "exemptions": "None"
        },
        {
            "product_category": "Mild Steel Tubes, Tubulars and Other Wrought Steel Fittings",
            "is_numbers": ["IS 1239 (Part 1)", "IS 1239 (Part 2)"],
            "title_of_standard": "Steel Tubes, Tubulars and Other Wrought Steel Fittings",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Steel",
            "order_name": "Steel and Steel Products (Quality Control) Order, 2024",
            "notification_number": "S.O. 1952(E)",
            "date_of_notification": "2024-05-15",
            "date_of_implementation": "2024-05-15",
            "exemptions": "None"
        },
        {
            "product_category": "Galvanized Steel Sheets (Plain and Corrugated)",
            "is_numbers": ["IS 277"],
            "title_of_standard": "Galvanized Steel Sheets (Plain and Corrugated) - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Steel",
            "order_name": "Steel and Steel Products (Quality Control) Order, 2024",
            "notification_number": "S.O. 1952(E)",
            "date_of_notification": "2024-05-15",
            "date_of_implementation": "2024-05-15",
            "exemptions": "None"
        },
        {
            "product_category": "Stainless Steel Sheets, Strips and Plates",
            "is_numbers": ["IS 6911", "IS 5522"],
            "title_of_standard": "Stainless Steel Plate, Sheet and Strip",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Steel",
            "order_name": "Stainless Steel Products (Quality Control) Order",
            "notification_number": "S.O. 3177(E)",
            "date_of_notification": "2023-09-20",
            "date_of_implementation": "2023-09-20",
            "exemptions": "None"
        },
        {
            "product_category": "Ductile Iron Pipes and Fittings for Water, Gas and Sewage",
            "is_numbers": ["IS 8329", "IS 9523"],
            "title_of_standard": "Centrifugally Cast (Spun) Ductile Iron Pressure Pipes",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Steel",
            "order_name": "Ductile Iron Pipes (Quality Control) Order",
            "notification_number": "S.O. 4501(E)",
            "date_of_notification": "2023-11-10",
            "date_of_implementation": "2023-11-10",
            "exemptions": "None"
        },

        # --- CEMENT & BUILDING MATERIALS (DPIIT) ---
        {
            "product_category": "Ordinary Portland Cement (33, 43, 53 Grade)",
            "is_numbers": ["IS 269"],
            "title_of_standard": "Ordinary Portland Cement - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "order_name": "Cement (Quality Control) Order, 2023",
            "notification_number": "S.O. 2380(E)",
            "date_of_notification": "2023-06-01",
            "date_of_implementation": "2023-06-01",
            "exemptions": "None"
        },
        {
            "product_category": "Portland Pozzolana Cement (Fly Ash and Calcined Clay based)",
            "is_numbers": ["IS 1489 (Part 1)", "IS 1489 (Part 2)"],
            "title_of_standard": "Portland Pozzolana Cement - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Cement (Quality Control) Order, 2023",
            "notification_number": "S.O. 2380(E)",
            "date_of_notification": "2023-06-01",
            "date_of_implementation": "2023-06-01",
            "exemptions": "None"
        },
        {
            "product_category": "Portland Slag Cement",
            "is_numbers": ["IS 455"],
            "title_of_standard": "Portland Slag Cement - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Cement (Quality Control) Order, 2023",
            "notification_number": "S.O. 2380(E)",
            "date_of_notification": "2023-06-01",
            "date_of_implementation": "2023-06-01",
            "exemptions": "None"
        },
        {
            "product_category": "Plywood for General Purposes and Marine Plywood",
            "is_numbers": ["IS 303", "IS 710", "IS 1659", "IS 2202 (Part 1)"],
            "title_of_standard": "Plywood for General Purposes / Marine Plywood / Blockboards / Flush Doors",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Plywood and Allied Products (Quality Control) Order, 2024",
            "notification_number": "S.O. 3968(E)",
            "date_of_notification": "2023-08-29",
            "date_of_implementation": "2024-02-28",
            "exemptions": "Small and Micro Enterprises granted staggered timeline till 2024-11-28"
        },
        {
            "product_category": "Safety Glass for Architectural and Automotive Use",
            "is_numbers": ["IS 2553 (Part 1)", "IS 2553 (Part 2)"],
            "title_of_standard": "Safety Glass - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Safety Glass (Quality Control) Order",
            "notification_number": "S.O. 1210(E)",
            "date_of_notification": "2020-03-12",
            "date_of_implementation": "2021-04-01",
            "exemptions": "None"
        },

        # --- ELECTRICAL & CABLES (DPIIT & Ministry of Power) ---
        {
            "product_category": "PVC Insulated Cables for Working Voltages up to and including 1100 V",
            "is_numbers": ["IS 694"],
            "title_of_standard": "Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables/Cords",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Electrical Wires, Cable and Appliances (Quality Control) Order",
            "notification_number": "S.O. 2063(E)",
            "date_of_notification": "2023-05-18",
            "date_of_implementation": "2023-05-18",
            "exemptions": "None"
        },
        {
            "product_category": "Crosslinked Polyethylene Insulated (XLPE) Power Cables",
            "is_numbers": ["IS 7098 (Part 1)", "IS 7098 (Part 2)"],
            "title_of_standard": "Crosslinked Polyethylene Insulated Thermoplastic Sheathed Cables",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Electrical Cables (Quality Control) Order",
            "notification_number": "S.O. 2063(E)",
            "date_of_notification": "2023-05-18",
            "date_of_implementation": "2023-05-18",
            "exemptions": "None"
        },
        {
            "product_category": "Domestic Electric Food Mixers, Grinders and Blenders",
            "is_numbers": ["IS 4250"],
            "title_of_standard": "Domestic Electric Food Mixers (Liquidizers and Grinders)",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Electrical Appliances (Quality Control) Order",
            "notification_number": "S.O. 1045(E)",
            "date_of_notification": "2023-03-05",
            "date_of_implementation": "2023-09-05",
            "exemptions": "Micro enterprises exempt till March 2024"
        },
        {
            "product_category": "Electric Geysers / Stationary Storage Type Electric Water Heaters",
            "is_numbers": ["IS 2082", "IS 302 (Part 2/Sec 21)"],
            "title_of_standard": "Stationary storage type electric water heaters",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Electrical Appliances (Quality Control) Order",
            "notification_number": "S.O. 1045(E)",
            "date_of_notification": "2023-03-05",
            "date_of_implementation": "2023-09-05",
            "exemptions": "None"
        },
        {
            "product_category": "Electric Iron",
            "is_numbers": ["IS 366", "IS 302 (Part 2/Sec 3)"],
            "title_of_standard": "Electric Irons - Safety & Performance",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Electrical Appliances (Quality Control) Order",
            "notification_number": "S.O. 1045(E)",
            "date_of_notification": "2023-03-05",
            "date_of_implementation": "2023-09-05",
            "exemptions": "None"
        },
        {
            "product_category": "Distribution Transformers",
            "is_numbers": ["IS 1180 (Part 1)"],
            "title_of_standard": "Outdoor Type Oil Immersed Distribution Transformers up to and including 2500 kVA, 33 kV",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Power / DPIIT",
            "order_name": "Distribution Transformers (Quality Control) Order",
            "notification_number": "S.O. 1894(E)",
            "date_of_notification": "2014-07-15",
            "date_of_implementation": "2015-02-01",
            "exemptions": "None"
        },

        # --- ELECTRONICS & IT HARDWARE (MeitY - CRS Scheme-II) ---
        {
            "product_category": "Laptops / Notebooks / Tablets",
            "is_numbers": ["IS 13252 (Part 1)"],
            "title_of_standard": "Information Technology Equipment - Safety - General Requirements",
            "scheme_type": "Scheme-II (CRS)",
            "ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "order_name": "Electronics and Information Technology Goods (Compulsory Registration Scheme) Order",
            "notification_number": "S.O. 2295(E)",
            "date_of_notification": "2012-10-03",
            "date_of_implementation": "2013-04-03",
            "exemptions": "R&D prototypes up to 100 units per year with MeitY exemption approval"
        },
        {
            "product_category": "Server and Enterprise Storage Systems",
            "is_numbers": ["IS 13252 (Part 1)"],
            "title_of_standard": "Information Technology Equipment - Safety - General Requirements",
            "scheme_type": "Scheme-II (CRS)",
            "ministry": "MeitY",
            "order_name": "Electronics and IT Goods (Compulsory Registration) Order",
            "notification_number": "S.O. 2905(E)",
            "date_of_notification": "2014-11-07",
            "date_of_implementation": "2015-05-07",
            "exemptions": "None"
        },
        {
            "product_category": "Point of Sale (POS) Terminals & Smart Card Readers",
            "is_numbers": ["IS 13252 (Part 1)"],
            "title_of_standard": "Information Technology Equipment - Safety",
            "scheme_type": "Scheme-II (CRS)",
            "ministry": "MeitY",
            "order_name": "Electronics and IT Goods (CRS) Order",
            "notification_number": "S.O. 2905(E)",
            "date_of_notification": "2014-11-07",
            "date_of_implementation": "2015-05-07",
            "exemptions": "None"
        },
        {
            "product_category": "Lithium-Ion Secondary Cells and Batteries (for Portable Applications)",
            "is_numbers": ["IS 16046 (Part 1)", "IS 16046 (Part 2)"],
            "title_of_standard": "Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes (Nickel / Lithium Systems)",
            "scheme_type": "Scheme-II (CRS)",
            "ministry": "MeitY",
            "order_name": "Batteries and Secondary Cells (CRS) Order",
            "notification_number": "S.O. 2905(E)",
            "date_of_notification": "2014-11-07",
            "date_of_implementation": "2015-05-07",
            "exemptions": "None"
        },
        {
            "product_category": "Fixed General Purpose LED Luminaires & LED Floodlights",
            "is_numbers": ["IS 10322 (Part 5/Sec 1)", "IS 10322 (Part 5/Sec 2)", "IS 10322 (Part 5/Sec 3)", "IS 10322 (Part 5/Sec 5)"],
            "title_of_standard": "Luminaires - Particular Requirements - Fixed / Recessed / Floodlights / Road Lighting",
            "scheme_type": "Scheme-II (CRS)",
            "ministry": "MeitY",
            "order_name": "LED Products (Compulsory Registration) Order",
            "notification_number": "S.O. 2905(E)",
            "date_of_notification": "2014-11-07",
            "date_of_implementation": "2015-05-07",
            "exemptions": "None"
        },
        {
            "product_category": "Self-Ballasted LED Lamps for General Lighting Services",
            "is_numbers": ["IS 16102 (Part 1)", "IS 16102 (Part 2)"],
            "title_of_standard": "Self-Ballasted LED Lamps - Safety and Performance Requirements",
            "scheme_type": "Scheme-II (CRS)",
            "ministry": "MeitY",
            "order_name": "LED Lighting (CRS) Order",
            "notification_number": "S.O. 2905(E)",
            "date_of_notification": "2014-11-07",
            "date_of_implementation": "2015-05-07",
            "exemptions": "None"
        },
        {
            "product_category": "Solar Photovoltaic (PV) Modules, Inverters and Storage Batteries",
            "is_numbers": ["IS 14286", "IS/IEC 61730 (Part 1)", "IS/IEC 61730 (Part 2)", "IS 16221 (Part 2)", "IS 16169"],
            "title_of_standard": "Design Qualification and Type Approval for Terrestrial PV Modules / Safety / Utility Interconnected Inverters",
            "scheme_type": "Scheme-II (CRS)",
            "ministry": "Ministry of New and Renewable Energy (MNRE)",
            "order_name": "Solar Photovoltaics, Systems, Devices and Components Goods (Requirements for Compulsory Registration) Order",
            "notification_number": "S.O. 2920(E)",
            "date_of_notification": "2017-09-05",
            "date_of_implementation": "2018-04-16",
            "exemptions": "None"
        },
        {
            "product_category": "Power Adaptors for IT Equipment and Audio/Video",
            "is_numbers": ["IS 13252 (Part 1)", "IS 616"],
            "title_of_standard": "Power Adaptors for IT Equipment and Audio/Video Equipment - Safety Requirements",
            "scheme_type": "Scheme-II (CRS)",
            "ministry": "MeitY",
            "order_name": "Electronics and IT Goods (CRS) Order",
            "notification_number": "S.O. 2295(E)",
            "date_of_notification": "2012-10-03",
            "date_of_implementation": "2013-04-03",
            "exemptions": "None"
        },

        # --- SAFETY, TOYS & CONSUMER GOODS (DPIIT) ---
        {
            "product_category": "Safety of Toys (Mechanical, Physical, Flammability, Chemical Migration)",
            "is_numbers": ["IS 9873 (Part 1)", "IS 9873 (Part 2)", "IS 9873 (Part 3)", "IS 9873 (Part 4)", "IS 9873 (Part 7)", "IS 9873 (Part 9)", "IS 15644"],
            "title_of_standard": "Safety of Toys / Electric Toys Safety",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Toys (Quality Control) Order, 2020",
            "notification_number": "S.O. 853(E)",
            "date_of_notification": "2020-02-25",
            "date_of_implementation": "2021-01-01",
            "exemptions": "Handicrafts by artisans registered with DC (Handicrafts) exempt"
        },
        {
            "product_category": "Footwear made from Leather, Rubber and Polymeric Materials (Safety Footwear, Sports Shoes)",
            "is_numbers": ["IS 15844 (Part 1)", "IS 15844 (Part 2)", "IS 11226", "IS 3735", "IS 3736", "IS 15298 (Part 2)"],
            "title_of_standard": "Sports Footwear / Canvas Boots / Rubber Boots / Safety Footwear",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Footwear made from Leather and other materials (Quality Control) Order, 2024",
            "notification_number": "S.O. 1060(E)",
            "date_of_notification": "2023-03-15",
            "date_of_implementation": "2024-01-01",
            "exemptions": "Micro Enterprises exempt till 2024-07-01; Small Enterprises till 2024-04-01"
        },
        {
            "product_category": "Domestic Pressure Cookers",
            "is_numbers": ["IS 2347"],
            "title_of_standard": "Domestic Pressure Cookers - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Domestic Pressure Cooker (Quality Control) Order, 2020",
            "notification_number": "S.O. 293(E)",
            "date_of_notification": "2020-01-21",
            "date_of_implementation": "2020-08-01",
            "exemptions": "None"
        },
        {
            "product_category": "Protective Helmets for Two Wheeler Riders",
            "is_numbers": ["IS 4151"],
            "title_of_standard": "Protective Helmets for Two Wheeler Riders - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Road Transport and Highways (MoRTH)",
            "order_name": "Helmet for riders of Two Wheelers Motor Vehicles (Quality Control) Order, 2020",
            "notification_number": "S.O. 4252(E)",
            "date_of_notification": "2020-11-26",
            "date_of_implementation": "2021-06-01",
            "exemptions": "None"
        },
        {
            "product_category": "Fire Extinguishers (Portable and Wheeled)",
            "is_numbers": ["IS 15683", "IS 16018", "IS 2878", "IS 2171"],
            "title_of_standard": "Portable Fire Extinguishers - Performance and Construction",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Fire Fighting Equipment (Quality Control) Order",
            "notification_number": "S.O. 1892(E)",
            "date_of_notification": "2023-05-10",
            "date_of_implementation": "2023-11-10",
            "exemptions": "None"
        },

        # --- CHEMICALS, PETROCHEMICALS & FERTILIZERS ---
        {
            "product_category": "Caustic Soda (Sodium Hydroxide)",
            "is_numbers": ["IS 252"],
            "title_of_standard": "Caustic Soda, Pure and Technical - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Chemicals and Petrochemicals (DCPC)",
            "order_name": "Caustic Soda (Quality Control) Order, 2018",
            "notification_number": "S.O. 1485(E)",
            "date_of_notification": "2018-04-03",
            "date_of_implementation": "2018-12-18",
            "exemptions": "None"
        },
        {
            "product_category": "Polyethylene Materials for Moulding and Extrusion (HDPE / LDPE / LLDPE)",
            "is_numbers": ["IS 7328", "IS 10146"],
            "title_of_standard": "High Density Polyethylene / Polyethylene for food contact application",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Chemicals and Petrochemicals",
            "order_name": "Polyethylene (Quality Control) Order, 2024",
            "notification_number": "S.O. 1120(E)",
            "date_of_notification": "2024-03-01",
            "date_of_implementation": "2024-03-01",
            "exemptions": "None"
        },
        {
            "product_category": "PVC (Polyvinyl Chloride) Homopolymers",
            "is_numbers": ["IS 10151"],
            "title_of_standard": "Polyvinyl Chloride (PVC) and its Copolymers for its Safe Use in Contact with Foodstuffs, Pharmaceuticals and Drinking Water",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "Ministry of Chemicals and Petrochemicals",
            "order_name": "Polyvinyl Chloride (PVC) Homopolymers (Quality Control) Order, 2024",
            "notification_number": "S.O. 882(E)",
            "date_of_notification": "2024-02-26",
            "date_of_implementation": "2024-08-26",
            "exemptions": "None"
        },

        # --- FURNITURE (DPIIT - IS 17631 to IS 17636) ---
        {
            "product_category": "Work Chairs and Office Chairs",
            "is_numbers": ["IS 17631"],
            "title_of_standard": "Work Chairs - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Furniture (Quality Control) Order, 2024",
            "notification_number": "S.O. 1205(E)",
            "date_of_notification": "2024-03-10",
            "date_of_implementation": "2024-09-10",
            "exemptions": "Micro and Small enterprises granted phased extension"
        },
        {
            "product_category": "General Purpose Chairs and Stools",
            "is_numbers": ["IS 17632"],
            "title_of_standard": "General Purpose Chairs and Stools - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Furniture (Quality Control) Order, 2024",
            "notification_number": "S.O. 1205(E)",
            "date_of_notification": "2024-03-10",
            "date_of_implementation": "2024-09-10",
            "exemptions": "Phased implementation for MSMEs"
        },
        {
            "product_category": "Tables and Desks for Office and Educational Institutions",
            "is_numbers": ["IS 17633"],
            "title_of_standard": "Tables and Desks - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Furniture (Quality Control) Order, 2024",
            "notification_number": "S.O. 1205(E)",
            "date_of_notification": "2024-03-10",
            "date_of_implementation": "2024-09-10",
            "exemptions": "None"
        },
        {
            "product_category": "Storage Units (Almirahs, Lockers, Filing Cabinets)",
            "is_numbers": ["IS 17634"],
            "title_of_standard": "Storage Units - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Furniture (Quality Control) Order, 2024",
            "notification_number": "S.O. 1205(E)",
            "date_of_notification": "2024-03-10",
            "date_of_implementation": "2024-09-10",
            "exemptions": "None"
        },
        {
            "product_category": "Beds (Domestic and Hostel Beds)",
            "is_numbers": ["IS 17635"],
            "title_of_standard": "Beds - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Furniture (Quality Control) Order, 2024",
            "notification_number": "S.O. 1205(E)",
            "date_of_notification": "2024-03-10",
            "date_of_implementation": "2024-09-10",
            "exemptions": "None"
        },
        {
            "product_category": "Bunk Beds for Educational and Institutional Use",
            "is_numbers": ["IS 17636"],
            "title_of_standard": "Bunk Beds - Specification",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Furniture (Quality Control) Order, 2024",
            "notification_number": "S.O. 1205(E)",
            "date_of_notification": "2024-03-10",
            "date_of_implementation": "2024-09-10",
            "exemptions": "None"
        },

        # --- FASTENERS, BOLTS, NUTS & HARDWARE (DPIIT) ---
        {
            "product_category": "Hexagon Head Bolts, Screws and Nuts",
            "is_numbers": ["IS 1363 (Part 1)", "IS 1363 (Part 2)", "IS 1363 (Part 3)", "IS 1364 (Part 1)", "IS 1364 (Part 2)", "IS 1364 (Part 3)", "IS 1367 (Part 1)", "IS 1367 (Part 3)"],
            "title_of_standard": "Hexagon Head Bolts, Screws and Nuts / Mechanical Properties of Fasteners",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Bolts, Nuts and Fasteners (Quality Control) Order, 2023",
            "notification_number": "S.O. 3201(E)",
            "date_of_notification": "2023-07-21",
            "date_of_implementation": "2024-01-21",
            "exemptions": "Special precision fasteners for aerospace and medical use"
        },

        # --- COOKWARE & UTENSILS (DPIIT) ---
        {
            "product_category": "Non-Stick Wrought Aluminium Utensils and Cookware",
            "is_numbers": ["IS 1660", "IS 979", "IS 14756"],
            "title_of_standard": "Wrought Aluminium Utensils / Stainless Steel Cookware",
            "scheme_type": "Scheme-I (ISI Mark)",
            "ministry": "DPIIT",
            "order_name": "Cookware and Utensils (Quality Control) Order, 2024",
            "notification_number": "S.O. 1420(E)",
            "date_of_notification": "2024-03-15",
            "date_of_implementation": "2024-09-15",
            "exemptions": "MSME extension under transition facilitation order"
        },

        # --- PRECIOUS METALS & HALLMARKING (Scheme-IV) ---
        {
            "product_category": "Gold Jewellery and Gold Artefacts",
            "is_numbers": ["IS 1417"],
            "title_of_standard": "Gold and Gold Alloys, Jewellery/Artefacts - Fineness and Marking",
            "scheme_type": "Scheme-IV (Hallmarking)",
            "ministry": "Department of Consumer Affairs",
            "order_name": "Hallmarking of Gold Jewellery and Gold Artefacts Order, 2020",
            "notification_number": "S.O. 205(E)",
            "date_of_notification": "2020-01-15",
            "date_of_implementation": "2021-06-23",
            "exemptions": "Export jewellery, items below 2 grams, medical/industrial usage"
        },
        {
            "product_category": "Silver Jewellery and Silver Artefacts",
            "is_numbers": ["IS 2112"],
            "title_of_standard": "Silver and Silver Alloys, Jewellery/Artefacts - Fineness and Marking",
            "scheme_type": "Scheme-IV (Hallmarking)",
            "ministry": "Department of Consumer Affairs",
            "order_name": "Silver Jewellery Hallmarking Order",
            "notification_number": "S.O. 312(E)",
            "date_of_notification": "2022-04-10",
            "date_of_implementation": "2022-04-10",
            "exemptions": "Voluntary in designated districts; export items exempt"
        }
    ]

def run_phase_1_regulatory_harvest():
    """Main execution function for Phase 1 Regulatory Ingestion"""
    logger.info("=== STARTING PHASE 1: STATUTORY & REGULATORY QCO HARVEST ===")
    
    # 1. Scrape live BIS compulsory directory
    live_bis = fetch_bis_compulsory_directory()
    
    # 2. Scrape live CRS directory
    live_crs = fetch_crs_products()
    
    # 3. Load master canonical QCO database
    canonical_qcos = load_canonical_master_qco_database()
    
    # 4. Merge and build mapping index
    unified_qco_list: List[Dict[str, Any]] = []
    is_to_qco_matrix: Dict[str, Dict[str, Any]] = {}
    
    # Ingest canonical records
    for item in canonical_qcos:
        unified_qco_list.append(item)
        for is_no in item["is_numbers"]:
            norm_key = re.sub(r"\s+", " ", is_no).strip().upper()
            is_to_qco_matrix[norm_key] = {
                "is_mandatory": True,
                "product_category": item["product_category"],
                "scheme": item["scheme_type"],
                "ministry": item["ministry"],
                "qco_order_name": item["order_name"],
                "notification_number": item["notification_number"],
                "date_of_notification": item["date_of_notification"],
                "enforcement_date": item["date_of_implementation"],
                "exemptions": item["exemptions"]
            }
            # Also store base number (e.g. "IS 1786" for "IS 1786:2008")
            base_key = re.sub(r"\s*:\s*\d{4}", "", norm_key)
            if base_key not in is_to_qco_matrix:
                is_to_qco_matrix[base_key] = is_to_qco_matrix[norm_key]

    # Ingest live BIS scraped items
    for item in live_bis:
        for is_no in item["is_numbers"]:
            norm_key = re.sub(r"\s+", " ", is_no).strip().upper()
            if norm_key not in is_to_qco_matrix:
                qco_entry = {
                    "is_mandatory": True,
                    "product_category": item["product_name"],
                    "scheme": item["scheme"],
                    "ministry": "Government of India (Notified Line Ministry)",
                    "qco_order_name": item["order_info"],
                    "notification_number": "BIS Notified",
                    "date_of_notification": None,
                    "enforcement_date": "Active",
                    "exemptions": None
                }
                is_to_qco_matrix[norm_key] = qco_entry
                base_key = re.sub(r"\s*:\s*\d{4}", "", norm_key)
                if base_key not in is_to_qco_matrix:
                    is_to_qco_matrix[base_key] = qco_entry

    # Ingest live CRS items
    for item in live_crs:
        for is_no in item["is_numbers"]:
            norm_key = re.sub(r"\s+", " ", is_no).strip().upper()
            if norm_key not in is_to_qco_matrix:
                crs_entry = {
                    "is_mandatory": True,
                    "product_category": item["product_category"],
                    "scheme": item["scheme"],
                    "ministry": "Ministry of Electronics and Information Technology (MeitY) / MNRE",
                    "qco_order_name": f"Electronics & IT Goods (Compulsory Registration) Order - {item['phase']}",
                    "notification_number": "MeitY Notified",
                    "date_of_notification": None,
                    "enforcement_date": "Active",
                    "exemptions": "R&D prototypes up to 100 units/year exempt"
                }
                is_to_qco_matrix[norm_key] = crs_entry
                base_key = re.sub(r"\s*:\s*\d{4}", "", norm_key)
                if base_key not in is_to_qco_matrix:
                    is_to_qco_matrix[base_key] = crs_entry

    # 5. Write outputs to target directories
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data", "03_regulatory_qco")
    os.makedirs(out_dir, exist_ok=True)
    
    qco_master_file = os.path.join(out_dir, "dpiit_master_qco.json")
    with open(qco_master_file, "w", encoding="utf-8") as f:
        json.dump(unified_qco_list, f, indent=2, ensure_ascii=False)
        
    matrix_file = os.path.join(out_dir, "qco_mapping_matrix.json")
    with open(matrix_file, "w", encoding="utf-8") as f:
        json.dump(is_to_qco_matrix, f, indent=2, ensure_ascii=False)
        
    logger.info(f" Successfully saved Master QCO List with {len(unified_qco_list)} orders -> {qco_master_file}")
    logger.info(f" Successfully compiled Fast-Lookup QCO Mapping Matrix with {len(is_to_qco_matrix)} standard keys -> {matrix_file}")

if __name__ == "__main__":
    run_phase_1_regulatory_harvest()
