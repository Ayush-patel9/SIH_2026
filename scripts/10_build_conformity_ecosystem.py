import os
import json

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
CONFORMITY_DIR = os.path.join(DATA_DIR, "04_conformity_ecosystem")
os.makedirs(CONFORMITY_DIR, exist_ok=True)

def build_conformity_ecosystem():
    print("Building Conformity Assessment Ecosystem ground truth datasets...")
    
    # 1. Conformity Schemes
    schemes = [
        {
            "scheme_id": "SCHEME_I",
            "scheme_name": "Scheme-I (ISI Mark - Product Certification Scheme)",
            "governing_rules": "BIS (Conformity Assessment) Regulations, 2018 - Scheme I",
            "certification_mark": "Standard Mark (ISI Mark)",
            "grant_type": "Factory Inspection + Third-party Laboratory Testing + Regular Surveillance",
            "applicable_sectors": ["Steel & Iron Products", "Cement", "Electrical Cables & Wires", "LPG Cylinders", "Automotive Tyres", "PVC Pipes", "Footwear", "Chemicals", "Toys"],
            "mandatory_under_qco": True,
            "description": "The manufacturer is granted a licence to use the ISI mark after verification of manufacturing infrastructure, quality control system, testing personnel, and testing of sample in independent BIS/NABL labs."
        },
        {
            "scheme_id": "SCHEME_II",
            "scheme_name": "Scheme-II (CRS - Compulsory Registration Scheme)",
            "governing_rules": "BIS (Conformity Assessment) Regulations, 2018 - Scheme II (Electronics & IT Goods Order)",
            "certification_mark": "Standard Mark (BIS CRS Registration Logo with R-number)",
            "grant_type": "Self-Declaration of Conformity (SDoC) based on BIS-recognized lab test reports",
            "applicable_sectors": ["Laptops & Tablets", "Mobile Phones", "LED Luminaires", "Power Adapters & Inverters", "Smart Watches", "Secondary Lithium Batteries", "CCTV Cameras"],
            "mandatory_under_qco": True,
            "description": "Manufacturers submit test reports from BIS-recognized labs to obtain a unique Registration Number (R-XXXXXXXX) displayed with the CRS mark on the product."
        },
        {
            "scheme_id": "SCHEME_III",
            "scheme_name": "Scheme-III (Certificate of Conformity - CoC)",
            "governing_rules": "BIS (Conformity Assessment) Regulations, 2018 - Scheme III",
            "certification_mark": "Certificate of Conformity",
            "grant_type": "Batch testing or prototype evaluation for specialized lots",
            "applicable_sectors": ["Precision Engineering", "Special Purpose Equipment", "Custom Imports"],
            "mandatory_under_qco": False,
            "description": "Conformity assessment issued for specific production batches or specialized prototype lots."
        },
        {
            "scheme_id": "SCHEME_IV",
            "scheme_name": "Scheme-IV (Hallmarking of Precious Metal Articles)",
            "governing_rules": "BIS (Hallmarking) Regulations, 2018",
            "certification_mark": "BIS Hallmark + 6-digit HUID (Hallmark Unique Identification)",
            "grant_type": "Assaying & Hallmarking Centre (AHC) XRF & Fire Assay Testing",
            "applicable_sectors": ["Gold Jewellery and Artefacts (IS 1417)", "Silver Artefacts (IS 2112)"],
            "mandatory_under_qco": True,
            "description": "Mandatory 6-digit alphanumeric HUID engraved by certified Assaying & Hallmarking Centres verifying exact fineness (e.g. 24K/999, 22K/916, 18K/750, 14K/585)."
        },
        {
            "scheme_id": "SCHEME_X",
            "scheme_name": "Scheme-X (Eco Mark Scheme)",
            "governing_rules": "BIS Eco Mark Scheme Rules",
            "certification_mark": "BIS ECO Logo (Earthen Pot)",
            "grant_type": "Environmental criteria assessment + ISI Mark compliance",
            "applicable_sectors": ["Paints", "Paper", "Plastics", "Cosmetics", "Detergents", "Batteries"],
            "mandatory_under_qco": False,
            "description": "Labelling of environment-friendly products meeting stringent toxicity, biodegradability, and recyclable packaging requirements."
        }
    ]
    
    # 2. BIS Recognized & NABL Accredited Testing Laboratories
    labs = [
        {
            "lab_id": "LAB_NTH_ER",
            "lab_name": "National Test House (Eastern Region), Alipore, Kolkata",
            "organization_type": "Central Government Autonomous Testing Laboratory (DoCA)",
            "nabl_accreditation": "TC-5012 (Chemical, Mechanical, Electrical, Non-Destructive)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "West Bengal",
            "key_capabilities": ["Tensile & Bending Testing of Steel (IS 1786, IS 2062)", "Cement Compressive Testing (IS 1489, IS 269)", "High Voltage Cables (IS 694, IS 1554)", "Paints & Varnishes"]
        },
        {
            "lab_id": "LAB_NTH_WR",
            "lab_name": "National Test House (Western Region), Andheri, Mumbai",
            "organization_type": "Central Government Autonomous Testing Laboratory (DoCA)",
            "nabl_accreditation": "TC-5013 (Chemical, Electrical, Mechanical)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Maharashtra",
            "key_capabilities": ["Chemical Analysis of Metals (IS 228)", "Transformers & Switchgears", "Plastics & Polymers Migration Testing (IS 10151, IS 9845)"]
        },
        {
            "lab_id": "LAB_CPRI_BLR",
            "lab_name": "Central Power Research Institute (CPRI), Bengaluru",
            "organization_type": "Autonomous Society under Ministry of Power",
            "nabl_accreditation": "TC-5432 (High Voltage, Short Circuit, Cables, Switchgear)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Karnataka",
            "key_capabilities": ["Distribution Transformers (IS 1180 Part 1)", "Solar Inverters & Power Conditioning Units (IS 16221)", "LV & HV Cables (IS 7098, IS 694)", "Smart Meters (IS 16444)", "Switchgear (IS/IEC 60947)"]
        },
        {
            "lab_id": "LAB_ERDA_BRD",
            "lab_name": "Electrical Research and Development Association (ERDA), Vadodara",
            "organization_type": "Non-profit Research Association & Testing Lab",
            "nabl_accreditation": "TC-5098 (Electrical, Photometry, Mechanical, Dielectric)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Gujarat",
            "key_capabilities": ["LED Luminaires Photometry & Safety (IS 10322, IS 16102)", "Energy Meters (IS 13779)", "Distribution Transformers (IS 1180)", "Dielectric Fluids & Insulators"]
        },
        {
            "lab_id": "LAB_CIPET_CHN",
            "lab_name": "Central Institute of Petrochemicals Engineering & Technology (CIPET), Chennai",
            "organization_type": "Autonomous Institute under Ministry of Chemicals & Fertilizers",
            "nabl_accreditation": "TC-5145 (Plastics, Polymers, Composites, Packaging)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Tamil Nadu",
            "key_capabilities": ["Polyethylene Materials (IS 7328, IS 10146)", "PVC Food Contact Migration (IS 10151, IS 9845)", "PVC Pipes & Fittings (IS 4985)", "Biodegradable Plastics Testing (IS 17088)"]
        },
        {
            "lab_id": "LAB_STQC_ERTL_DEL",
            "lab_name": "Electronics Regional Test Laboratory (ERTL North) / STQC, New Delhi",
            "organization_type": "Directorate under Ministry of Electronics and IT (MeitY)",
            "nabl_accreditation": "TC-5211 (Electronics Safety, EMC/EMI, Environmental)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Delhi",
            "key_capabilities": ["IT Equipment Safety (IS 13252 Part 1)", "Audio/Video Apparatus Safety (IS 616)", "Lithium Battery Safety (IS 16046 Part 2)", "EMC/EMI Compliance"]
        },
        {
            "lab_id": "LAB_CLRI_CHN",
            "lab_name": "CSIR - Central Leather Research Institute (CLRI), Chennai",
            "organization_type": "CSIR National Laboratory",
            "nabl_accreditation": "TC-5310 (Leather, Footwear, Polymer Soles)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Tamil Nadu",
            "key_capabilities": ["Safety Footwear with Steel Toe Cap (IS 15298 Part 2, IS 11226)", "Canvas & Sports Shoes (IS 3735, IS 15844)", "Leather Flexing & Abrasion Resistance"]
        },
        {
            "lab_id": "LAB_NISE_GUR",
            "lab_name": "National Institute of Solar Energy (NISE), Gurugram",
            "organization_type": "Autonomous Institute under Ministry of New & Renewable Energy (MNRE)",
            "nabl_accreditation": "TC-6014 (Solar PV, Photovoltaic Reliability)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Haryana",
            "key_capabilities": ["Crystalline Silicon Terrestrial PV Modules (IS 14286)", "Photovoltaic Safety Qualification (IS/IEC 61730)", "Solar Inverters (IS 16221)"]
        },
        {
            "lab_id": "LAB_SRI_DEL",
            "lab_name": "Shriram Institute for Industrial Research (SIIR), Delhi",
            "organization_type": "Independent Research & Analytical Testing Lab",
            "nabl_accreditation": "TC-5020 (Chemical, Biological, Mechanical, Materials)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Delhi",
            "key_capabilities": ["Toxic Element Migration in Toys (IS 9873 Part 3)", "Safety of Toys Mechanical (IS 9873 Part 1)", "Drinking Water Testing (IS 10500)", "Food Packaging Migration (IS 9845)"]
        },
        {
            "lab_id": "LAB_ARAI_PUN",
            "lab_name": "Automotive Research Association of India (ARAI), Pune",
            "organization_type": "Autonomous Research Institute under Ministry of Heavy Industries",
            "nabl_accreditation": "TC-5111 (Automotive Safety, Glass, Tyres, Emissions)",
            "bis_recognition_status": "RECOGNIZED_BIS_LAB",
            "state": "Maharashtra",
            "key_capabilities": ["Safety Glass for Land Transport (IS 2553 Part 2)", "Pneumatic Tyres (IS 15633, IS 15636)", "Automotive Components Safety"]
        }
    ]
    
    # 3. Lab Testing Capability Matrix
    capability_matrix = [
        {"is_number": "IS 1786", "domain": "High Strength Deformed Steel Bars", "labs": ["LAB_NTH_ER", "LAB_NTH_WR"], "mandatory_tests": ["Tensile Strength", "Yield Stress", "Elongation", "Bend & Rebend Test", "Chemical Analysis (C, S, P)"]},
        {"is_number": "IS 1180 (Part 1)", "domain": "Outdoor Distribution Transformers", "labs": ["LAB_CPRI_BLR", "LAB_ERDA_BRD"], "mandatory_tests": ["No-load & Load Loss Measurement", "Temperature Rise Test", "Dielectric Breakdown Voltage", "Short-Circuit Test"]},
        {"is_number": "IS 10322 (Part 5/Sec 1)", "domain": "LED Luminaires & Recessed Lights", "labs": ["LAB_ERDA_BRD", "LAB_CPRI_BLR"], "mandatory_tests": ["Photometric Light Output", "Insulation Resistance", "Ingress Protection (IP Rating)", "Thermal Endurance"]},
        {"is_number": "IS 13252 (Part 1)", "domain": "IT Equipment & Adapters (CRS)", "labs": ["LAB_STQC_ERTL_DEL"], "mandatory_tests": ["Electric Shock Protection", "Dielectric Strength", "Creepage & Clearance", "Flammability", "Touch Current"]},
        {"is_number": "IS 616", "domain": "Audio/Video Electronics (CRS)", "labs": ["LAB_STQC_ERTL_DEL"], "mandatory_tests": ["Radiation & Laser Safety", "Fault Condition Testing", "Dielectric Strength", "Fire Enclosure Resistance"]},
        {"is_number": "IS 10151", "domain": "PVC for Food Contact & Drinking Water", "labs": ["LAB_CIPET_CHN", "LAB_NTH_WR", "LAB_SRI_DEL"], "mandatory_tests": ["Residual Vinyl Chloride Monomer (RVCM <= 1 ppm)", "RVCM Migration (<= 10 ppb)", "Overall Migration Limit (<= 60 mg/l)"]},
        {"is_number": "IS 15298 (Part 2)", "domain": "Safety Footwear with Steel Toe", "labs": ["LAB_CLRI_CHN"], "mandatory_tests": ["Toe Cap Impact Resistance (200 Joules)", "Compression Resistance (15 kN)", "Sole Penetration Resistance", "Slip Resistance"]},
        {"is_number": "IS 9873 (Part 1)", "domain": "Safety of Toys (Mechanical)", "labs": ["LAB_SRI_DEL"], "mandatory_tests": ["Small Parts Hazard (Choking Test)", "Sharp Edges & Sharp Points", "Acoustic / Decibel Output", "Drop & Torque Test"]},
        {"is_number": "IS 14286", "domain": "Crystalline Silicon Terrestrial PV Modules", "labs": ["LAB_NISE_GUR", "LAB_CPRI_BLR"], "mandatory_tests": ["Thermal Cycling Test", "Damp Heat Test", "Mechanical Load Test", "Hail Impact Test"]},
        {"is_number": "IS 2553 (Part 2)", "domain": "Safety Glass for Land Transport", "labs": ["LAB_ARAI_PUN"], "mandatory_tests": ["227g Steel Ball Impact Test", "Head-Form Impact Test", "Optical Distortion", "Light Transmittance"]}
    ]
    
    with open(os.path.join(CONFORMITY_DIR, "conformity_schemes.json"), "w", encoding="utf-8") as f:
        json.dump(schemes, f, indent=2)
    with open(os.path.join(CONFORMITY_DIR, "bis_recognized_labs.json"), "w", encoding="utf-8") as f:
        json.dump(labs, f, indent=2)
    with open(os.path.join(CONFORMITY_DIR, "lab_testing_capability_matrix.json"), "w", encoding="utf-8") as f:
        json.dump(capability_matrix, f, indent=2)
        
    print(f"✓ Created conformity_schemes.json ({len(schemes)} schemes)")
    print(f"✓ Created bis_recognized_labs.json ({len(labs)} accredited testing labs)")
    print(f"✓ Created lab_testing_capability_matrix.json ({len(capability_matrix)} standard-to-lab matrices)")

if __name__ == "__main__":
    build_conformity_ecosystem()
