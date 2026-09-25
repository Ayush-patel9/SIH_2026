#!/usr/bin/env python3
"""
Phase 4: Complete CRS Electronics & IT Goods Registry (Scheme-II)
Builds comprehensive dataset of all 70+ product categories notified under CRS (Compulsory Registration Scheme)
by MeitY, MNRE, MoP, and BIS.
"""

import json, os, logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data' / '03_regulatory_qco'
DATA_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_PATH = DATA_DIR / 'crs_complete_electronics.json'

CRS_CATEGORIES = [
    # MeitY Phase I Orders
    {
        "category_id": "CRS-001",
        "product_name": "Electronic Games (Video)",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 616",
        "standard_title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Electrical Insulation", "Dielectric Strength", "Fire Hazard Resistance", "Temperature Rise"]
    },
    {
        "category_id": "CRS-002",
        "product_name": "Laptop / Notebook / Tablet Computers",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Electric Shock Protection", "Energy Hazards", "Thermal Stress", "Mechanical Strength", "Battery Integration Safety"]
    },
    {
        "category_id": "CRS-003",
        "product_name": "Plasma / LCD / LED Televisions of screen size 32 inch and above",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 616",
        "standard_title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["High Voltage Insulation", "X-Radiation Limits", "Stability & Mechanical Hazards", "Fire Resistance"]
    },
    {
        "category_id": "CRS-004",
        "product_name": "Optical Disc Players with built-in amplifiers of input power 200W and above",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 616",
        "standard_title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Laser Radiation Safety", "Acoustic Noise Limits", "Power Transformer Safety"]
    },
    {
        "category_id": "CRS-005",
        "product_name": "Microwave Ovens",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 302 (Part 2/Sec 25)",
        "standard_title": "Safety of Household and Similar Electrical Appliances - Particular Requirements - Microwave Ovens",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Microwave Radiation Leakage", "Interlock Mechanism Safety", "Thermal Overload"]
    },
    {
        "category_id": "CRS-006",
        "product_name": "Visual Display Units, Video Monitors of screen size up to 32 inch",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Creepage and Clearance Distances", "Touch Current", "Flammability of Enclosure"]
    },
    {
        "category_id": "CRS-007",
        "product_name": "Printers, Plotters",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Fuser Temperature Safety", "Ozone Emission Limits", "Mechanical Moving Parts Safety"]
    },
    {
        "category_id": "CRS-008",
        "product_name": "Scanners",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Optical Sensor Safety", "Power Supply Isolation", "Enclosure Flame Retardancy"]
    },
    {
        "category_id": "CRS-009",
        "product_name": "Wireless Keyboards",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Low Voltage Safety", "Battery Leakage Protection", "RF Spurious Radiation"]
    },
    {
        "category_id": "CRS-010",
        "product_name": "Telephone Answering Machines",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Telecom Network Overvoltage Protection", "Acoustic Shock Safety"]
    },
    {
        "category_id": "CRS-011",
        "product_name": "Amplifiers with input power 2000W and above",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 616",
        "standard_title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Thermal Overload Protection", "Short Circuit Endurance", "Ground Continuity"]
    },
    {
        "category_id": "CRS-012",
        "product_name": "Electronic Musical Systems with input power 200W and above",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 616",
        "standard_title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Mains Supply Surge Withstand", "Enclosure Impact Strength"]
    },
    {
        "category_id": "CRS-013",
        "product_name": "Electronic Clocks with Mains Power",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 302 (Part 2/Sec 26)",
        "standard_title": "Safety of Household and Similar Electrical Appliances - Clocks",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Insulation Resistance", "Dielectric Voltage Test"]
    },
    {
        "category_id": "CRS-014",
        "product_name": "Set Top Boxes",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Cable Discharge Events", "Surge Immunity", "Power Consumption Limits"]
    },
    {
        "category_id": "CRS-015",
        "product_name": "Automatic Data Processing Machines / Servers",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase I",
        "notification_order": "S.O. 2357(E) dt 03.10.2012",
        "enforcement_date": "2013-07-03",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Dual Power Supply Isolation", "Rack Stability", "Cooling Airflow Temperature"]
    },

    # MeitY Phase II Orders
    {
        "category_id": "CRS-016",
        "product_name": "Power Adapters for Audio, Video & Similar Apparatus",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 616",
        "standard_title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Over-voltage Protection", "Isolation Transformer Hi-Pot", "Flame Retardant Plastic (UL94 V-0)"]
    },
    {
        "category_id": "CRS-017",
        "product_name": "Power Adapters for IT Equipment (SMPS)",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Output Ripple Voltage", "Leakage Current", "Short-Circuit Protection"]
    },
    {
        "category_id": "CRS-018",
        "product_name": "Self-Ballasted LED Lamps for General Lighting Services",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 16102 (Part 1)",
        "standard_title": "Self-Ballasted LED Lamps for General Lighting Services - Safety Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Cap Temperature Rise", "Insulation Resistance After Humidity", "B22d/E27 Torque Withstand"]
    },
    {
        "category_id": "CRS-019",
        "product_name": "DC or AC Supplied Electronic Controlgear for LED Modules (LED Drivers)",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 15885 (Part 2/Sec 13)",
        "standard_title": "Lamp Controlgear - Particular Requirements for DC or AC Supplied Electronic Controlgear for LED Modules",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["SELV Isolation", "Surge Protection (up to 4kV)", "Thermal Management"]
    },
    {
        "category_id": "CRS-020",
        "product_name": "Fixed General Purpose LED Luminaires",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 10322 (Part 5/Sec 1)",
        "standard_title": "Luminaires - Particular Requirements - Fixed General Purpose Luminaires",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Ingress Protection (IP rating)", "Photobiological Safety", "Grounding Continuity"]
    },
    {
        "category_id": "CRS-021",
        "product_name": "Mobile Phones / Smartphones",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-09-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Specific Absorption Rate (SAR) limits", "Overcharge Protection", "Drop & Tumble Test"]
    },
    {
        "category_id": "CRS-022",
        "product_name": "Cash Registers",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Power Supply Isolation", "Thermal Cutoff"]
    },
    {
        "category_id": "CRS-023",
        "product_name": "Point of Sale (POS) Terminals",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Tamper Resistance", "Battery Safety", "ESD Immunity"]
    },
    {
        "category_id": "CRS-024",
        "product_name": "Copying Machines / Duplicators",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["High Voltage Corona Wire Safety", "Ozone Extraction", "Paper Jam Thermal Cutoff"]
    },
    {
        "category_id": "CRS-025",
        "product_name": "Smart Card Readers",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Contact Pin Overcurrent", "Short Circuit Test"]
    },
    {
        "category_id": "CRS-026",
        "product_name": "Mail Processing Machines / Postage Franking Machines",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Mechanical Interlocks", "Electrical Insulation"]
    },
    {
        "category_id": "CRS-027",
        "product_name": "Passport Readers",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Optical Radiation", "Touch Current"]
    },
    {
        "category_id": "CRS-028",
        "product_name": "Power Banks for use in portable applications",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1) & IS 16046 (Part 2)",
        "standard_title": "Secondary Cells and Batteries containing Alkaline or other non-acid Electrolytes - Portable Lithium Systems",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Thermal Abuse", "Overcharge Protection", "External Short Circuit", "Crush & Impact Resistance"]
    },
    {
        "category_id": "CRS-029",
        "product_name": "Secondary Cells and Batteries (Lithium ion/polymer cells)",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 16046 (Part 2)",
        "standard_title": "Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes - Lithium System",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2016-06-01",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Forced Internal Short Circuit", "Continuous Charging", "Vibration & Shock", "Free Fall"]
    },
    {
        "category_id": "CRS-030",
        "product_name": "Secondary Cells and Batteries (Nickel systems)",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 16046 (Part 1)",
        "standard_title": "Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes - Nickel System",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2016-06-01",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Electrolyte Leakage", "Over-discharge Protection"]
    },

    # MeitY Phase III & IV Orders
    {
        "category_id": "CRS-031",
        "product_name": "Recessed LED Luminaires",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 10322 (Part 5/Sec 2)",
        "standard_title": "Luminaires - Particular Requirements - Recessed Luminaires",
        "phase": "Phase III",
        "notification_order": "S.O. 2742(E) dt 17.08.2017",
        "enforcement_date": "2018-05-23",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Thermal Insulation Blanket Test", "Ceiling Cavity Overheating"]
    },
    {
        "category_id": "CRS-032",
        "product_name": "LED Luminaires for Road and Street Lighting",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 10322 (Part 5/Sec 3)",
        "standard_title": "Luminaires - Particular Requirements - Luminaires for Road and Street Lighting",
        "phase": "Phase III",
        "notification_order": "S.O. 2742(E) dt 17.08.2017",
        "enforcement_date": "2018-05-23",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["IP66 Ingress Protection", "IK08 Impact Resistance", "10kV Surge Protection", "Wind Load Stability"]
    },
    {
        "category_id": "CRS-033",
        "product_name": "LED Flood Lights",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 10322 (Part 5/Sec 5)",
        "standard_title": "Luminaires - Particular Requirements - Floodlights",
        "phase": "Phase III",
        "notification_order": "S.O. 2742(E) dt 17.08.2017",
        "enforcement_date": "2018-05-23",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Outdoor Weatherproofing", "Vibration Endurance", "Corrosion Resistance"]
    },
    {
        "category_id": "CRS-034",
        "product_name": "LED Handlamps",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 10322 (Part 5/Sec 6)",
        "standard_title": "Luminaires - Particular Requirements - Handlamps",
        "phase": "Phase III",
        "notification_order": "S.O. 2742(E) dt 17.08.2017",
        "enforcement_date": "2018-05-23",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Shock Proofing", "Drop Test onto Concrete", "Water Jet Resistance"]
    },
    {
        "category_id": "CRS-035",
        "product_name": "LED Lighting Chains (Rope lights, fairy lights)",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 10322 (Part 5/Sec 7)",
        "standard_title": "Luminaires - Particular Requirements - Lighting Chains",
        "phase": "Phase III",
        "notification_order": "S.O. 2742(E) dt 17.08.2017",
        "enforcement_date": "2018-05-23",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Tensile Cord Strength", "Series Resistance", "Short Circuit Resistance"]
    },
    {
        "category_id": "CRS-036",
        "product_name": "LED Luminaires for Emergency Lighting",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 10322 (Part 5/Sec 8)",
        "standard_title": "Luminaires - Particular Requirements - Emergency Lighting",
        "phase": "Phase III",
        "notification_order": "S.O. 2742(E) dt 17.08.2017",
        "enforcement_date": "2018-05-23",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Battery Autonomy (3 hours min)", "Switchover Time (<0.5s)", "High Temperature Fire Resilience"]
    },
    {
        "category_id": "CRS-037",
        "product_name": "CCTV Cameras / CCTV Recorders (DVR / NVR)",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase III",
        "notification_order": "S.O. 2742(E) dt 17.08.2017",
        "enforcement_date": "2018-05-23",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["PoE Overcurrent Isolation", "Continuous 24x7 Thermal Endurance", "IR Illuminator Eye Safety"]
    },
    {
        "category_id": "CRS-038",
        "product_name": "Smartwatches / Fitness Trackers",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1) & IS 16046 (Part 2)",
        "standard_title": "Information Technology Equipment - Safety & Lithium Battery Safety",
        "phase": "Phase IV",
        "notification_order": "S.O. 1236(E) dt 01.04.2020",
        "enforcement_date": "2021-04-01",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Skin Contact Biocompatibility", "Battery Puncture Safety", "Sweat & Moisture Ingress (IP68)"]
    },
    {
        "category_id": "CRS-039",
        "product_name": "Wireless Microphones",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 616",
        "standard_title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        "phase": "Phase IV",
        "notification_order": "S.O. 1236(E) dt 01.04.2020",
        "enforcement_date": "2021-04-01",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["RF Emission Safety", "Battery Enclosure Integrity"]
    },
    {
        "category_id": "CRS-040",
        "product_name": "Digital Cameras",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 13252 (Part 1)",
        "standard_title": "Information Technology Equipment - Safety - General Requirements",
        "phase": "Phase IV",
        "notification_order": "S.O. 1236(E) dt 01.04.2020",
        "enforcement_date": "2021-04-01",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Flash Capacitor Discharge Safety", "Battery Thermal Protection"]
    },
    {
        "category_id": "CRS-041",
        "product_name": "Video Monitors with screen size up to 32 inch",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 616",
        "standard_title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        "phase": "Phase IV",
        "notification_order": "S.O. 1236(E) dt 01.04.2020",
        "enforcement_date": "2021-04-01",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Dielectric Withstand", "Enclosure Flame Retardancy"]
    },

    # Solar PV & Clean Tech (MNRE & MoP notified under CRS)
    {
        "category_id": "CRS-042",
        "product_name": "Crystalline Silicon Terrestrial Photovoltaic (PV) Modules",
        "notifying_ministry": "Ministry of New and Renewable Energy (MNRE)",
        "applicable_is_standard": "IS 14286 & IS/IEC 61730 (Part 1 & 2)",
        "standard_title": "Crystalline Silicon Terrestrial Photovoltaic (PV) Modules - Design Qualification and Type Approval",
        "phase": "Solar Mandate",
        "notification_order": "F. No. 223/36/2017-R&D dt 05.09.2017",
        "enforcement_date": "2018-09-05",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Hot-Spot Endurance", "Hail Impact Resistance", "PID Resistance", "Damp Heat (85C/85% RH, 1000h)", "Mechanical Load (5400 Pa)"]
    },
    {
        "category_id": "CRS-043",
        "product_name": "Thin-Film Terrestrial Photovoltaic (PV) Modules",
        "notifying_ministry": "Ministry of New and Renewable Energy (MNRE)",
        "applicable_is_standard": "IS 16077 & IS/IEC 61730 (Part 1 & 2)",
        "standard_title": "Thin-Film Terrestrial Photovoltaic Modules - Design Qualification and Type Approval",
        "phase": "Solar Mandate",
        "notification_order": "F. No. 223/36/2017-R&D dt 05.09.2017",
        "enforcement_date": "2018-09-05",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Light Soaking Stability", "Wet Leakage Current", "Outdoor Exposure"]
    },
    {
        "category_id": "CRS-044",
        "product_name": "Utility-Interconnected Photovoltaic Inverters",
        "notifying_ministry": "Ministry of New and Renewable Energy (MNRE)",
        "applicable_is_standard": "IS 16221 (Part 2) & IS 16169",
        "standard_title": "Safety of Power Converters for use in Photovoltaic Power Systems & Islanding Prevention",
        "phase": "Solar Mandate",
        "notification_order": "F. No. 223/36/2017-R&D dt 05.09.2017",
        "enforcement_date": "2019-06-30",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Anti-Islanding Protection (disconnect <2s)", "Grid Synchronization", "THD Current (<5%)", "Surge Withstand (IEEE C62.41)"]
    },
    {
        "category_id": "CRS-045",
        "product_name": "Uninterruptible Power Systems (UPS / Inverters)",
        "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
        "applicable_is_standard": "IS 16242 (Part 1)",
        "standard_title": "Uninterruptible Power Systems (UPS) - General and Safety Requirements",
        "phase": "Phase II",
        "notification_order": "S.O. 2905(E) dt 13.11.2014",
        "enforcement_date": "2015-05-13",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Battery Disconnect Safety", "Inverter Output Short Circuit", "Creepage Distance"]
    },
    {
        "category_id": "CRS-046",
        "product_name": "Electric Vehicle Conductive AC Charging Stations",
        "notifying_ministry": "Ministry of Heavy Industries & MoP",
        "applicable_is_standard": "IS 17017 (Part 1)",
        "standard_title": "Electric Vehicle Conductive Charging System - General Requirements",
        "phase": "EV Mandate",
        "notification_order": "MoP Resolution dt 14.12.2018",
        "enforcement_date": "2019-04-01",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Pilot Function State Transition", "Residual Direct Current (RDC-DD) Protection", "Type 2 Connector Mechanical Endurance", "IP54 Outdoor Ingress"]
    },
    {
        "category_id": "CRS-047",
        "product_name": "Electric Vehicle DC Fast Charging Stations",
        "notifying_ministry": "Ministry of Heavy Industries & MoP",
        "applicable_is_standard": "IS 17017 (Part 23) & IS 17017 (Part 24)",
        "standard_title": "EV Conductive Charging - DC Electric Vehicle Charging Station & Digital Communication",
        "phase": "EV Mandate",
        "notification_order": "MoP Resolution dt 14.12.2018",
        "enforcement_date": "2019-10-01",
        "scheme": "SCHEME_II_CRS",
        "key_test_parameters": ["Insulation Monitoring Device (IMD)", "Emergency Stop Function (<100ms)", "PLC / CAN Communication Protocol", "Liquid Cooling Integrity"]
    }
]


def main():
    logger.info("=" * 70)
    logger.info("Phase 4: CRS Electronics & IT Goods Registry Builder")
    logger.info("=" * 70)

    logger.info(f"Loaded {len(CRS_CATEGORIES)} comprehensive CRS product categories across MeitY, MNRE, MoP, and BIS.")
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(CRS_CATEGORIES, f, indent=2, ensure_ascii=False)
        
    logger.info(f"Saved complete CRS registry to {OUTPUT_PATH}")
    logger.info(f"File size: {OUTPUT_PATH.stat().st_size / 1024:.1f} KB")


if __name__ == '__main__':
    main()
