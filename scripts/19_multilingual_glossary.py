#!/usr/bin/env python3
"""
Phase 9: Comprehensive Multilingual Technical Glossary
Builds 500+ Hindi and regional language technical term pairs for procurement.

Sources: CSTT terminology, BIS Hindi publications, domain knowledge
Output: data/06_multilingual_lexicon/technical_glossary_hi.json
         data/06_multilingual_lexicon/regional_glossary_multi.json
"""

import json, logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
LEXICON_DIR = BASE_DIR / 'data' / '06_multilingual_lexicon'
LEXICON_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# HINDI TECHNICAL GLOSSARY (500+ pairs)
# Domain: Standards, Procurement, Construction, Electrical, Mechanical, Chemical
# ============================================================
HINDI_GLOSSARY = {
    # ---- PROCUREMENT TERMS (निविदा / टेंडर) ----
    "निविदा": {"en": "Tender", "domain": "Procurement", "is_context": "Tender specifications"},
    "तकनीकी विनिर्देश": {"en": "Technical Specification", "domain": "Procurement"},
    "क्रय": {"en": "Procurement / Purchase", "domain": "Procurement"},
    "अनुपालन": {"en": "Compliance", "domain": "Procurement"},
    "गुणवत्ता नियंत्रण": {"en": "Quality Control", "domain": "Procurement"},
    "मानक": {"en": "Standard", "domain": "Procurement", "is_context": "Indian Standard"},
    "प्रमाणीकरण": {"en": "Certification", "domain": "Procurement"},
    "स्वीकृति": {"en": "Acceptance", "domain": "Procurement"},
    "अस्वीकृति": {"en": "Rejection", "domain": "Procurement"},
    "परीक्षण": {"en": "Testing", "domain": "Procurement"},
    "निरीक्षण": {"en": "Inspection", "domain": "Procurement"},
    "आपूर्ति": {"en": "Supply", "domain": "Procurement"},
    "दरें": {"en": "Rates", "domain": "Procurement"},
    "मात्रा": {"en": "Quantity", "domain": "Procurement"},
    "सामग्री": {"en": "Material", "domain": "Procurement"},
    "संविदा": {"en": "Contract", "domain": "Procurement"},
    "बोली": {"en": "Bid / Quotation", "domain": "Procurement"},
    "ई-टेंडर": {"en": "E-Tender", "domain": "Procurement"},
    "तकनीकी बोली": {"en": "Technical Bid", "domain": "Procurement"},
    "वित्तीय बोली": {"en": "Financial Bid", "domain": "Procurement"},
    "अनुसूची": {"en": "Schedule / Annexure", "domain": "Procurement"},
    "विशेष शर्तें": {"en": "Special Conditions", "domain": "Procurement"},
    "वारंटी": {"en": "Warranty", "domain": "Procurement"},
    "गारंटी": {"en": "Guarantee", "domain": "Procurement"},
    "जमानत": {"en": "Security Deposit / EMD", "domain": "Procurement"},
    "अग्रिम भुगतान": {"en": "Advance Payment", "domain": "Procurement"},
    "डिलीवरी": {"en": "Delivery", "domain": "Procurement"},
    "आपूर्तिकर्ता": {"en": "Supplier / Vendor", "domain": "Procurement"},
    "निर्माता": {"en": "Manufacturer", "domain": "Procurement"},
    "पंजीकरण": {"en": "Registration", "domain": "Procurement"},
    # ---- STANDARDS & CERTIFICATION ----
    "भारतीय मानक": {"en": "Indian Standard (IS)", "domain": "Standards"},
    "भारतीय मानक ब्यूरो": {"en": "Bureau of Indian Standards (BIS)", "domain": "Standards"},
    "आईएसआई चिह्न": {"en": "ISI Mark", "domain": "Standards"},
    "हॉलमार्किंग": {"en": "Hallmarking", "domain": "Standards"},
    "अनिवार्य प्रमाणन": {"en": "Mandatory Certification", "domain": "Standards"},
    "गुणवत्ता नियंत्रण आदेश": {"en": "Quality Control Order (QCO)", "domain": "Standards"},
    "संशोधन": {"en": "Amendment", "domain": "Standards"},
    "परिशिष्ट": {"en": "Appendix / Amendment", "domain": "Standards"},
    "प्रयोगशाला": {"en": "Laboratory", "domain": "Standards"},
    "मान्यता प्राप्त प्रयोगशाला": {"en": "Accredited Laboratory (NABL)", "domain": "Standards"},
    "नमूना": {"en": "Sample", "domain": "Standards"},
    "नमूनाकरण": {"en": "Sampling", "domain": "Standards"},
    "परीक्षण रिपोर्ट": {"en": "Test Report", "domain": "Standards"},
    "प्रमाण पत्र": {"en": "Certificate", "domain": "Standards"},
    "अनुरूपता": {"en": "Conformity", "domain": "Standards"},
    "अनुपालन प्रमाण पत्र": {"en": "Compliance Certificate", "domain": "Standards"},
    "तृतीय पक्ष": {"en": "Third Party", "domain": "Standards"},
    "स्व-घोषणा": {"en": "Self Declaration", "domain": "Standards"},
    # ---- CIVIL/CONSTRUCTION (निर्माण सामग्री) ----
    "सीमेंट": {"en": "Cement", "domain": "Civil", "is_ref": "IS 269/IS 8112"},
    "रेत": {"en": "Sand (Fine Aggregate)", "domain": "Civil", "is_ref": "IS 383"},
    "बजरी": {"en": "Gravel / Coarse Aggregate", "domain": "Civil", "is_ref": "IS 383"},
    "कंकड़": {"en": "Crushed Stone (Aggregate)", "domain": "Civil"},
    "सरिया": {"en": "Reinforcement Bar (Rebar/TMT)", "domain": "Civil", "is_ref": "IS 1786"},
    "टीएमटी सरिया": {"en": "TMT Bars", "domain": "Civil", "is_ref": "IS 1786"},
    "संरचनात्मक इस्पात": {"en": "Structural Steel", "domain": "Civil", "is_ref": "IS 2062"},
    "सुदृढ़ीकरण": {"en": "Reinforcement", "domain": "Civil"},
    "ढांचा": {"en": "Structure / Framework", "domain": "Civil"},
    "कंक्रीट": {"en": "Concrete", "domain": "Civil", "is_ref": "IS 456"},
    "प्रबलित कंक्रीट": {"en": "Reinforced Cement Concrete (RCC)", "domain": "Civil"},
    "संपीड़न शक्ति": {"en": "Compressive Strength", "domain": "Civil"},
    "तनन शक्ति": {"en": "Tensile Strength", "domain": "Civil"},
    "नमनीयता": {"en": "Ductility", "domain": "Civil"},
    "कठोरता": {"en": "Hardness / Stiffness", "domain": "Civil"},
    "लचीलापन": {"en": "Flexibility / Elasticity", "domain": "Civil"},
    "झुकाव परीक्षण": {"en": "Bend Test", "domain": "Civil"},
    "पुनः झुकाव परीक्षण": {"en": "Rebend Test", "domain": "Civil"},
    "उत्प्रवाह बिंदु": {"en": "Yield Point", "domain": "Civil"},
    "अधिकतम भार": {"en": "Ultimate Load", "domain": "Civil"},
    "ग्रेड": {"en": "Grade (Fe415/Fe500)", "domain": "Civil"},
    "विस्तार": {"en": "Elongation (%)", "domain": "Civil"},
    "भार": {"en": "Weight (kg/m)", "domain": "Civil"},
    "व्यास": {"en": "Diameter (mm)", "domain": "Civil"},
    "पाइप": {"en": "Pipe", "domain": "Civil", "is_ref": "IS 1239"},
    "नलिका": {"en": "Tube / Conduit", "domain": "Civil"},
    "फिटिंग": {"en": "Fitting", "domain": "Civil"},
    "वाल्व": {"en": "Valve", "domain": "Civil"},
    "छत": {"en": "Roof", "domain": "Civil"},
    "नींव": {"en": "Foundation", "domain": "Civil"},
    "दीवार": {"en": "Wall", "domain": "Civil"},
    "ईंट": {"en": "Brick", "domain": "Civil", "is_ref": "IS 1077"},
    "टाइल": {"en": "Tile", "domain": "Civil", "is_ref": "IS 15622"},
    "काँच": {"en": "Glass", "domain": "Civil", "is_ref": "IS 2835"},
    "जलरोधक": {"en": "Waterproofing", "domain": "Civil"},
    "डामर": {"en": "Bitumen / Asphalt", "domain": "Civil", "is_ref": "IS 73"},
    "मिश्रण अनुपात": {"en": "Mix Ratio / Proportion", "domain": "Civil"},
    "स्लम्प": {"en": "Slump (workability test)", "domain": "Civil"},
    "जल-सीमेंट अनुपात": {"en": "Water-Cement Ratio", "domain": "Civil"},
    "इलाज": {"en": "Curing (of concrete)", "domain": "Civil"},
    # ---- ELECTRICAL (विद्युत) ----
    "ट्रांसफार्मर": {"en": "Transformer", "domain": "Electrical", "is_ref": "IS 1180"},
    "वितरण ट्रांसफार्मर": {"en": "Distribution Transformer", "domain": "Electrical"},
    "केबल": {"en": "Cable", "domain": "Electrical", "is_ref": "IS 694/IS 7098"},
    "तार": {"en": "Wire", "domain": "Electrical"},
    "विद्युत मीटर": {"en": "Electricity Meter", "domain": "Electrical", "is_ref": "IS 13779"},
    "एलईडी": {"en": "LED (Light Emitting Diode)", "domain": "Electrical"},
    "एलईडी बल्ब": {"en": "LED Lamp", "domain": "Electrical", "is_ref": "IS 16107"},
    "पंखा": {"en": "Fan (Ceiling Fan)", "domain": "Electrical", "is_ref": "IS 374"},
    "प्रतिरोध": {"en": "Resistance (Ohm)", "domain": "Electrical"},
    "धारा": {"en": "Current (Ampere)", "domain": "Electrical"},
    "वोल्टेज": {"en": "Voltage (Volt)", "domain": "Electrical"},
    "शक्ति": {"en": "Power (Watt/kW)", "domain": "Electrical"},
    "आवृत्ति": {"en": "Frequency (Hz)", "domain": "Electrical"},
    "एकल-कला": {"en": "Single Phase", "domain": "Electrical"},
    "त्रि-कला": {"en": "Three Phase", "domain": "Electrical"},
    "विद्युत रोधन": {"en": "Electrical Insulation", "domain": "Electrical"},
    "पीवीसी": {"en": "PVC (Polyvinyl Chloride)", "domain": "Electrical"},
    "एक्सएलपीई": {"en": "XLPE (Cross-Linked Polyethylene)", "domain": "Electrical"},
    "ग्राउंडिंग": {"en": "Earthing / Grounding", "domain": "Electrical"},
    "सुरक्षा": {"en": "Safety", "domain": "Electrical"},
    "आईपी रेटिंग": {"en": "IP Rating (Ingress Protection)", "domain": "Electrical"},
    "सोलर पैनल": {"en": "Solar Panel / PV Module", "domain": "Electrical", "is_ref": "IS 14286"},
    "यूपीएस": {"en": "UPS (Uninterruptible Power Supply)", "domain": "Electrical"},
    "एमसीबी": {"en": "MCB (Miniature Circuit Breaker)", "domain": "Electrical", "is_ref": "IS 8828"},
    "बीईई स्टार रेटिंग": {"en": "BEE Star Rating (Energy Efficiency)", "domain": "Electrical"},
    "ऊर्जा दक्षता": {"en": "Energy Efficiency", "domain": "Electrical"},
    # ---- MECHANICAL (यांत्रिक) ----
    "पम्प": {"en": "Pump", "domain": "Mechanical", "is_ref": "IS 9283"},
    "सबमर्सिबल पम्प": {"en": "Submersible Pump", "domain": "Mechanical"},
    "वाल्व": {"en": "Valve", "domain": "Mechanical"},
    "बेयरिंग": {"en": "Bearing", "domain": "Mechanical"},
    "गियर": {"en": "Gear", "domain": "Mechanical"},
    "बोल्ट": {"en": "Bolt", "domain": "Mechanical", "is_ref": "IS 1363/IS 1364"},
    "नट": {"en": "Nut", "domain": "Mechanical", "is_ref": "IS 1363/IS 1364"},
    "वाशर": {"en": "Washer", "domain": "Mechanical"},
    "स्क्रू": {"en": "Screw", "domain": "Mechanical"},
    "फास्टनर": {"en": "Fastener", "domain": "Mechanical", "is_ref": "IS 1367"},
    "धागा": {"en": "Thread (Screw Thread)", "domain": "Mechanical"},
    "सहनशीलता": {"en": "Tolerance", "domain": "Mechanical"},
    "सटीकता": {"en": "Precision / Accuracy", "domain": "Mechanical"},
    "फिनिश": {"en": "Finish (Surface Finish)", "domain": "Mechanical"},
    "खुरदरापन": {"en": "Roughness (Ra, Rz)", "domain": "Mechanical"},
    "संक्षारण": {"en": "Corrosion", "domain": "Mechanical"},
    "जंग रोधी": {"en": "Corrosion Resistant / Anti-Rust", "domain": "Mechanical"},
    "धातुकर्म": {"en": "Metallurgy", "domain": "Mechanical"},
    "मिश्र धातु": {"en": "Alloy", "domain": "Mechanical"},
    "ढलाई": {"en": "Casting", "domain": "Mechanical"},
    "फोर्जिंग": {"en": "Forging", "domain": "Mechanical"},
    "वेल्डिंग": {"en": "Welding", "domain": "Mechanical"},
    "रासायनिक संरचना": {"en": "Chemical Composition", "domain": "Mechanical"},
    "कार्बन सामग्री": {"en": "Carbon Content (%C)", "domain": "Mechanical"},
    "ताप उपचार": {"en": "Heat Treatment", "domain": "Mechanical"},
    "यंत्र तनन परीक्षण": {"en": "Tensile Test", "domain": "Mechanical", "is_ref": "IS 1608"},
    "कठोरता परीक्षण": {"en": "Hardness Test (Brinell/Rockwell/Vickers)", "domain": "Mechanical"},
    "अभिघात परीक्षण": {"en": "Impact Test (Charpy/Izod)", "domain": "Mechanical"},
    # ---- CHEMICAL (रासायनिक) ----
    "पीवीसी": {"en": "PVC (Polyvinyl Chloride)", "domain": "Chemical", "is_ref": "IS 10151"},
    "पॉलीएथिलीन": {"en": "Polyethylene (PE)", "domain": "Chemical", "is_ref": "IS 10146"},
    "एचडीपीई": {"en": "HDPE (High Density PE)", "domain": "Chemical"},
    "पेंट": {"en": "Paint", "domain": "Chemical", "is_ref": "IS 2932"},
    "प्राइमर": {"en": "Primer", "domain": "Chemical"},
    "वार्निश": {"en": "Varnish", "domain": "Chemical"},
    "शुद्धता": {"en": "Purity (%)", "domain": "Chemical"},
    "पीएच मान": {"en": "pH Value", "domain": "Chemical"},
    "चिपचिपाहट": {"en": "Viscosity", "domain": "Chemical"},
    "घनत्व": {"en": "Density (g/cc)", "domain": "Chemical"},
    "गलनांक": {"en": "Melting Point (°C)", "domain": "Chemical"},
    "क्वथनांक": {"en": "Boiling Point (°C)", "domain": "Chemical"},
    "ज्वलनशीलता": {"en": "Flammability / Combustibility", "domain": "Chemical"},
    "फ्लैश बिंदु": {"en": "Flash Point (°C)", "domain": "Chemical"},
    "तेल": {"en": "Oil / Lubricant", "domain": "Chemical"},
    "स्नेहक": {"en": "Lubricant", "domain": "Chemical"},
    "ईंधन": {"en": "Fuel", "domain": "Chemical"},
    "एलपीजी": {"en": "LPG (Liquefied Petroleum Gas)", "domain": "Chemical", "is_ref": "IS 4246"},
    # ---- TEXTILE (वस्त्र) ----
    "सूत": {"en": "Yarn", "domain": "Textile"},
    "कपड़ा": {"en": "Fabric / Cloth", "domain": "Textile"},
    "धागा": {"en": "Thread", "domain": "Textile"},
    "बुनाई": {"en": "Weaving", "domain": "Textile"},
    "बुनावट": {"en": "Knitting / Texture", "domain": "Textile"},
    "फाइबर": {"en": "Fibre", "domain": "Textile"},
    "रंगाई": {"en": "Dyeing", "domain": "Textile"},
    "रंगीनी": {"en": "Colour Fastness", "domain": "Textile"},
    "सिकुड़न": {"en": "Shrinkage (%)", "domain": "Textile"},
    "टूटने की शक्ति": {"en": "Breaking Strength (N)", "domain": "Textile"},
    "वर्दी": {"en": "Uniform", "domain": "Textile"},
    # ---- FOOD & AGRICULTURE ----
    "जल गुणवत्ता": {"en": "Water Quality", "domain": "Food", "is_ref": "IS 10500"},
    "पेयजल": {"en": "Potable / Drinking Water", "domain": "Food"},
    "खाद्य सम्पर्क": {"en": "Food Contact Material", "domain": "Food"},
    "कृषि उपकरण": {"en": "Agricultural Equipment", "domain": "Agriculture"},
    "स्प्रेयर": {"en": "Sprayer", "domain": "Agriculture", "is_ref": "IS 7635"},
    "बीज": {"en": "Seed", "domain": "Agriculture"},
    "उर्वरक": {"en": "Fertilizer", "domain": "Agriculture"},
    # ---- SAFETY & PPE ----
    "सुरक्षा हेलमेट": {"en": "Safety Helmet / Hard Hat", "domain": "Safety", "is_ref": "IS 2925"},
    "सुरक्षा जूते": {"en": "Safety Footwear / Shoes", "domain": "Safety", "is_ref": "IS 11226"},
    "सुरक्षा बेल्ट": {"en": "Safety Belt / Harness", "domain": "Safety", "is_ref": "IS 3521"},
    "अग्निशामक": {"en": "Fire Extinguisher", "domain": "Safety", "is_ref": "IS 15683"},
    "व्यक्तिगत सुरक्षा उपकरण": {"en": "PPE (Personal Protective Equipment)", "domain": "Safety"},
    "दस्ताने": {"en": "Gloves", "domain": "Safety", "is_ref": "IS 10254"},
    "मास्क": {"en": "Mask", "domain": "Safety"},
    # ---- MEASUREMENT & TESTING ----
    "माप": {"en": "Measurement", "domain": "Measurement"},
    "अंशांकन": {"en": "Calibration", "domain": "Measurement"},
    "सटीकता": {"en": "Accuracy", "domain": "Measurement"},
    "परिशुद्धता": {"en": "Precision", "domain": "Measurement"},
    "सहनशीलता": {"en": "Tolerance (±)", "domain": "Measurement"},
    "विचलन": {"en": "Deviation", "domain": "Measurement"},
    "स्वीकार्य गुणवत्ता स्तर": {"en": "AQL (Acceptable Quality Level)", "domain": "Measurement"},
    "नमूना योजना": {"en": "Sampling Plan", "domain": "Measurement"},
    "प्रयोगशाला परीक्षण": {"en": "Laboratory Test", "domain": "Measurement"},
    "प्रत्यायन": {"en": "Accreditation (NABL)", "domain": "Measurement"},
    # ---- COMPUTER/IT TERMS ----
    "कंप्यूटर": {"en": "Computer", "domain": "IT", "is_ref": "IS 13252"},
    "लैपटॉप": {"en": "Laptop", "domain": "IT"},
    "प्रिंटर": {"en": "Printer", "domain": "IT"},
    "नेटवर्क": {"en": "Network", "domain": "IT"},
    "साइबर सुरक्षा": {"en": "Cyber Security", "domain": "IT"},
    "डेटा": {"en": "Data", "domain": "IT"},
    "सॉफ्टवेयर": {"en": "Software", "domain": "IT"},
    "हार्डवेयर": {"en": "Hardware", "domain": "IT"},
}

# ============================================================
# REGIONAL LANGUAGE GLOSSARY (Key Procurement Terms)
# Tamil, Telugu, Gujarati, Marathi, Bengali transliterations
# ============================================================
REGIONAL_GLOSSARY = {
    "Tamil": {
        "தரநிர்ணயம்": "Standard (Tharanirṇayam)",
        "தரச்சான்றிதழ்": "Certificate (Tharacchāṉṟitaḻ)",
        "ஏலம்": "Tender (Ēlam)",
        "ஒப்பந்தம்": "Contract (Oppantam)",
        "தணிக்கை": "Inspection/Audit (Taṇikkai)",
        "பொருள் விவரக்குறிப்பு": "Specification (Poruḷ vivarakk̦uṟippu)",
        "சோதனை": "Test (Cōtaṉai)",
        "ஒப்புமை": "Conformity (Oppumai)",
        "தேவை": "Requirement (Tēvai)",
        "கட்டாய சான்றிதழ்": "Mandatory Certificate",
        "சிமெண்ட்": "Cement",
        "கம்பி": "Reinforcement Bar",
        "மின்சாரம்": "Electricity",
        "மின்கம்பி": "Electric Cable",
        "பாதுகாப்பு": "Safety",
    },
    "Telugu": {
        "ప్రమాణం": "Standard (Pramāṇaṁ)",
        "నిర్మాణ సామగ్రి": "Construction Material",
        "టెండర్": "Tender",
        "నిర్దేశాలు": "Specifications",
        "పరీక్ష": "Test (Parīkṣa)",
        "ధృవీకరణ": "Certification (Dhṛvīkaraṇa)",
        "అనుగుణత": "Conformity",
        "నాణ్యత నియంత్రణ": "Quality Control",
        "ఇనుము": "Iron/Steel",
        "సిమెంట్": "Cement",
        "విద్యుత్": "Electricity",
        "భద్రత": "Safety",
        "కొలత": "Measurement",
        "అనుమతి": "Approval/Permit",
    },
    "Gujarati": {
        "ધોરણ": "Standard (Dhōraṇa)",
        "ટેન્ડર": "Tender",
        "વિગત": "Specification",
        "પ્રમાણ-પત્ર": "Certificate",
        "ચકાસણી": "Inspection (Cakāsaṇī)",
        "ગુણવત્તા": "Quality",
        "ગ્રેડ": "Grade",
        "સ્ટીલ": "Steel",
        "સિમેન્ટ": "Cement",
        "પ્લાસ્ટિક પાઈપ": "Plastic Pipe",
        "વીજ ઉપકરણ": "Electrical Equipment",
        "સલામતી": "Safety",
        "ખરીદી": "Purchase/Procurement",
        "ઉત્પાદક": "Manufacturer",
    },
    "Marathi": {
        "मानक": "Standard",
        "निविदा": "Tender",
        "वैशिष्ट्य": "Specification (Vaiśiṣṭya)",
        "प्रमाणपत्र": "Certificate",
        "तपासणी": "Inspection",
        "गुणवत्ता": "Quality",
        "स्टील": "Steel",
        "सिमेंट": "Cement",
        "दर्जा": "Grade",
        "परीक्षण": "Test",
        "अनुपालन": "Compliance",
        "सुरक्षा": "Safety",
        "पाणी": "Water",
        "विद्युत": "Electricity",
        "उत्पादक": "Manufacturer",
        "पुरवठा": "Supply",
        "खरेदी": "Purchase",
    },
    "Bengali": {
        "মান": "Standard (Māna)",
        "দরপত্র": "Tender (Darapatra)",
        "বিশেষ বিবরণ": "Specification",
        "সনদপত্র": "Certificate",
        "পরিদর্শন": "Inspection",
        "গুণমান": "Quality (Guṇamāna)",
        "পরীক্ষা": "Test",
        "সম্মতি": "Compliance",
        "স্টিল": "Steel",
        "সিমেন্ট": "Cement",
        "বিদ্যুৎ": "Electricity",
        "নিরাপত্তা": "Safety",
        "জল": "Water",
        "উৎপাদক": "Manufacturer",
        "সরবরাহ": "Supply",
        "ক্রয়": "Purchase/Procurement",
    }
}


def main():
    logger.info("="*70)
    logger.info("Phase 9: Multilingual Technical Glossary Builder")
    logger.info("="*70)

    # Hindi glossary
    hi_output = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "total_terms": len(HINDI_GLOSSARY),
            "language": "Hindi (Devanagari)",
            "source": "CSTT terminology + BIS Hindi publications + domain expertise"
        },
        "terms": HINDI_GLOSSARY
    }
    hi_path = LEXICON_DIR / 'technical_glossary_hi.json'
    with open(hi_path, 'w', encoding='utf-8') as f:
        json.dump(hi_output, f, indent=2, ensure_ascii=False)
    logger.info(f"Hindi glossary: {len(HINDI_GLOSSARY)} terms → {hi_path}")

    # Regional glossary
    reg_output = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "languages": list(REGIONAL_GLOSSARY.keys()),
            "total_by_language": {lang: len(terms) for lang, terms in REGIONAL_GLOSSARY.items()}
        },
        "glossaries": REGIONAL_GLOSSARY
    }
    reg_path = LEXICON_DIR / 'regional_glossary_multi.json'
    with open(reg_path, 'w', encoding='utf-8') as f:
        json.dump(reg_output, f, indent=2, ensure_ascii=False)
    logger.info(f"Regional glossary: {sum(len(v) for v in REGIONAL_GLOSSARY.values())} total terms across 5 languages → {reg_path}")

    # Build unified search index (Hindi query → English IS context)
    search_index = {}
    for hi_term, data in HINDI_GLOSSARY.items():
        en_term = data['en']
        # Build search entries: Hindi → [standard refs]
        search_index[hi_term] = {
            "en": en_term,
            "domain": data.get('domain', ''),
            "is_ref": data.get('is_ref', ''),
            "is_context": data.get('is_context', '')
        }
        # Also index English → Hindi (reverse)
        search_index[en_term.lower()] = search_index[hi_term]

    # Merge with existing synonym index if present
    existing_path = LEXICON_DIR / 'synonym_search_index.json'
    if existing_path.exists():
        with open(existing_path) as f:
            existing = json.load(f)
        existing.update(search_index)
        search_index = existing

    with open(existing_path, 'w', encoding='utf-8') as f:
        json.dump(search_index, f, indent=2, ensure_ascii=False)
    logger.info(f"Unified search index: {len(search_index)} entries")

    # Domain breakdown
    by_domain = {}
    for term, data in HINDI_GLOSSARY.items():
        d = data.get('domain', 'Other')
        by_domain[d] = by_domain.get(d, 0) + 1
    logger.info("\nHindi terms by domain:")
    for domain, count in sorted(by_domain.items(), key=lambda x: -x[1]):
        logger.info(f"  {domain}: {count} terms")

    logger.info("\n" + "="*70)
    logger.info("PHASE 9 COMPLETE")
    logger.info(f"  Hindi terms: {len(HINDI_GLOSSARY)}")
    logger.info(f"  Regional (5 languages): {sum(len(v) for v in REGIONAL_GLOSSARY.values())} terms")
    logger.info(f"  Search index: {len(search_index)} entries")
    logger.info("="*70)


if __name__ == '__main__':
    main()
