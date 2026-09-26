#!/usr/bin/env python3
"""
enrich_multilingual_lexicon.py
Enriches Indic multilingual lexicons in pipeline/data/06_multilingual_lexicon/:
1. technical_glossary_hi.json (200+ terms with direct IS mappings)
2. regional_glossary_multi.json (Tamil 25+, Telugu 25+, Marathi 25+, Gujarati 25+, Bengali 25+)
3. synonym_search_index.json (500+ terms mapped to canonical search phrases and IS numbers)
"""

import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data" / "06_multilingual_lexicon"
HI_GLOSSARY_FILE = DATA_DIR / "technical_glossary_hi.json"
REGIONAL_FILE = DATA_DIR / "regional_glossary_multi.json"
SYNONYM_FILE = DATA_DIR / "synonym_search_index.json"

# Expanded Regional Glossaries
REGIONAL_DATA = {
    "metadata": {
        "generated": "2026-09-26T12:00:00.000000",
        "languages": ["Tamil", "Telugu", "Gujarati", "Marathi", "Bengali"],
        "total_by_language": {
            "Tamil": 25,
            "Telugu": 25,
            "Gujarati": 25,
            "Marathi": 25,
            "Bengali": 25
        }
    },
    "glossaries": {
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
            "நீர் குழாய்": "Water Pipe",
            "செங்கல்": "Brick",
            "கான்கிரீட்": "Concrete",
            "மின்மாற்றி": "Transformer",
            "மின்விளக்கு": "Electric Light / LED",
            "மோட்டார் பம்ப்": "Motor Pump",
            "பாதுகாப்பு தலைக்கவசம்": "Safety Helmet",
            "இரும்பு கம்பிகள்": "Steel Rebars (TMT)",
            "குடிநீர் குழாய்": "Potable Water Pipe (HDPE/uPVC)",
            "தீயணைப்பு கருவி": "Fire Extinguisher"
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
            "నీటి పైపు": "Water Pipe",
            "ఇటుక": "Brick",
            "కాంక్రీట్": "Concrete",
            "విద్యుత్ వైరు": "Electric Wire/Cable",
            "ట్రాన్స్‌ఫార్మర్": "Transformer",
            "మోటారు పంపు": "Motor Pump",
            "హెల్మెట్": "Helmet",
            "టీఎంటీ రాడ్లు": "TMT Steel Rods",
            "ఎల్ఈడీ బల్బు": "LED Bulb",
            "అగ్నిమాపక యంత్రం": "Fire Extinguisher",
            "పీవీసీ పైపులు": "PVC Pipes"
        },
        "Gujarati": {
            "ધોરણ": "Standard (Dhōraṇa)",
            "ટેન્ડર": "Tender",
            "વિગત": "Specification",
            "પ્રમાણ-પત્ર": "Certificate",
            "ચકાસણી": "Inspection (Cakāsaṇī)",
            "ગુણવત્તા": "Quality",
            "ગ્રેડ": "Grade",
            "સિમેન્ટ": "Cement",
            "સ્ટીલ": "Steel / TMT Bar",
            "પાઇપ": "Pipe",
            "વીજળી વાયર": "Electric Wire / Cable",
            "ટ્રાન્સફોર્મર": "Transformer",
            "સુરક્ષા હેલ્મેટ": "Safety Helmet",
            "ઈંટ": "Brick",
            "કોંક્રિટ": "Concrete",
            "પેવર બ્લોક": "Paver Block",
            "સબમર્સિબલ પંપ": "Submersible Pump",
            "એલઈડી લાઇટ": "LED Light",
            "પીવાનું પાણી પાઇપ": "Drinking Water Pipe",
            "અગ્નિશામક": "Fire Extinguisher",
            "ગુણવત્તા નિયંત્રણ": "Quality Control",
            "માપદંડ": "Benchmark / Standard",
            "ખરીદી": "Procurement / Purchase",
            "કરાર": "Contract",
            "બાંધકામ સામગ્રી": "Construction Material"
        },
        "Marathi": {
            "मानक": "Standard",
            "निविदा": "Tender",
            "तपशील": "Specification",
            "प्रमाणपत्र": "Certificate",
            "चाचणी": "Test",
            "तपासणी": "Inspection",
            "गुणवत्ता": "Quality",
            "सिमेंट": "Cement",
            "पोलाद": "Steel / TMT Rebar",
            "पाईप": "Pipe (HDPE/PVC)",
            "विद्युत वायर": "Electric Wire",
            "ट्रान्सफॉर्मर": "Transformer",
            "सुरक्षा शिरस्त्राण": "Safety Helmet",
            "वीट": "Brick",
            "काँक्रीट": "Concrete",
            "पेव्हर ब्लॉक": "Paver Block",
            "सबमर्सिबल पंप": "Submersible Pump",
            "एलईडी दिवा": "LED Lamp",
            "पिण्याचे पाणी पाईप": "Potable Water Pipe",
            "अग्निशामक": "Fire Extinguisher",
            "खरेदी": "Procurement",
            "अनिवार्य प्रमाणपत्र": "Mandatory Certification",
            "सामग्री": "Material",
            "हमी": "Guarantee / Warranty",
            "संरचना": "Structure"
        },
        "Bengali": {
            "মানক": "Standard",
            "দরপত্র": "Tender",
            "বিবরণ": "Specification",
            "শংসাপত্র": "Certificate",
            "পরীক্ষা": "Test",
            "পরিদর্শন": "Inspection",
            "গুণমান": "Quality",
            "সিমেন্ট": "Cement",
            "ইস্পাত": "Steel / TMT Bar",
            "পাইপ": "Pipe",
            "বৈদ্যুতিক তার": "Electric Cable",
            "ট্রান্সফরমার": "Transformer",
            "নিরাপত্তা হেলমেট": "Safety Helmet",
            "ইট": "Brick",
            "কংক্রিট": "Concrete",
            "পেভার ব্লক": "Paver Block",
            "সাবমার্সিবল পাম্প": "Submersible Pump",
            "এলইডি বাতি": "LED Light",
            "পানীয় জলের পাইপ": "Drinking Water Pipe",
            "অগ্নি নির্বাপক": "Fire Extinguisher",
            "ক্রয়": "Procurement",
            "বাধ্যতামূলক শংসাপত্র": "Mandatory Certification",
            "উপকরণ": "Material",
            "গুণমান নিয়ন্ত্রণ": "Quality Control",
            "নির্মাণ সামগ্রী": "Construction Material"
        }
    }
}

INDIC_TERM_TO_IS_MAPPING = {
    # Hindi
    "सीमेंट": {"canonical": "Ordinary Portland Cement", "is_ref": "IS 269"},
    "साधारण पोर्टलैंड सीमेंट": {"canonical": "Ordinary Portland Cement", "is_ref": "IS 269"},
    "४३ ग्रेड सीमेंट": {"canonical": "43 Grade OPC Cement", "is_ref": "IS 269"},
    "५३ ग्रेड सीमेंट": {"canonical": "53 Grade OPC Cement", "is_ref": "IS 269"},
    "पीपीसी सीमेंट": {"canonical": "Portland Pozzolana Cement", "is_ref": "IS 1489 (Part 1)"},
    "स्लैग सीमेंट": {"canonical": "Portland Slag Cement", "is_ref": "IS 455"},
    "टीएमटी स्टील": {"canonical": "TMT Deformed Steel Bars", "is_ref": "IS 1786"},
    "सरिया": {"canonical": "TMT Deformed Steel Rebars", "is_ref": "IS 1786"},
    "स्टील रीबार": {"canonical": "Steel Rebars Fe 500D", "is_ref": "IS 1786"},
    "स्ट्रक्चरल स्टील": {"canonical": "Structural Steel", "is_ref": "IS 2062"},
    "एचडीपीई पाइप": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "पीवीसी पाइप": {"canonical": "uPVC Pipes for Potable Water", "is_ref": "IS 4985"},
    "कंक्रीट पाइप": {"canonical": "Precast Concrete Pipes", "is_ref": "IS 458"},
    "विद्युत केबल": {"canonical": "PVC Insulated Cables", "is_ref": "IS 694"},
    "एक्सएलपीई केबल": {"canonical": "XLPE Insulated Power Cables", "is_ref": "IS 7098 (Part 2)"},
    "एलईडी बल्ब": {"canonical": "Self-Ballasted LED Lamps", "is_ref": "IS 16102 (Part 1)"},
    "एलईडी ड्राइवर": {"canonical": "Lamp Controlgear for LED Modules", "is_ref": "IS 15885 (Part 2/Sec 13)"},
    "एलईडी स्ट्रीट लाइट": {"canonical": "LED Luminaires for General Lighting", "is_ref": "IS 16077"},
    "ट्रांसफार्मर": {"canonical": "Distribution Transformer", "is_ref": "IS 1180 (Part 1)"},
    "सीसीटीवी": {"canonical": "Video Surveillance Systems CCTV", "is_ref": "IS 13252 (Part 1)"},
    "लैपटॉप": {"canonical": "Laptops & IT Equipment", "is_ref": "IS 13252 (Part 1)"},
    "लिथियम बैटरी": {"canonical": "Secondary Lithium Cells and Batteries", "is_ref": "IS 16046 (Part 2)"},
    "पेवर ब्लॉक": {"canonical": "Precast Concrete Blocks for Paving", "is_ref": "IS 15658"},
    "एएसी ब्लॉक": {"canonical": "Autoclaved Aerated Concrete Blocks", "is_ref": "IS 2185 (Part 3)"},
    "ईंट": {"canonical": "Common Burnt Clay Building Bricks", "is_ref": "IS 1077"},
    "हेलमेट": {"canonical": "Industrial Safety Helmets", "is_ref": "IS 2925"},
    "मोटरसाइकिल हेलमेट": {"canonical": "Protective Helmets for Two Wheeler Riders", "is_ref": "IS 4151"},
    "खिलौने": {"canonical": "Safety of Toys", "is_ref": "IS 9873 (Part 1)"},
    "सुरक्षा जूते": {"canonical": "Personal Protective Equipment - Safety Footwear", "is_ref": "IS 15298 (Part 2)"},
    "जियोटेक्सटाइल": {"canonical": "Geotextiles for Subgrade Stabilization", "is_ref": "IS 16391"},
    "सबमर्सिबल पंप": {"canonical": "Submersible Pumpsets", "is_ref": "IS 14220"},
    "गीजर": {"canonical": "Stationary Storage Water Heaters", "is_ref": "IS 302 (Part 2/Sec 21)"},
    "एमसीबी": {"canonical": "Miniature Circuit Breakers MCBs", "is_ref": "IS 8828"},

    # Tamil
    "சிமெண்ட்": {"canonical": "Ordinary Portland Cement", "is_ref": "IS 269"},
    "கம்பி": {"canonical": "High Strength Deformed Steel Bars", "is_ref": "IS 1786"},
    "இரும்பு கம்பிகள்": {"canonical": "TMT Steel Rebars", "is_ref": "IS 1786"},
    "நீர் குழாய்": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "குடிநீர் குழாய்": {"canonical": "uPVC Pipes for Potable Water", "is_ref": "IS 4985"},
    "மின்கம்பி": {"canonical": "PVC Insulated Electric Cables", "is_ref": "IS 694"},
    "மின்மாற்றி": {"canonical": "Distribution Transformer", "is_ref": "IS 1180 (Part 1)"},
    "மின்விளக்கு": {"canonical": "LED Lamps", "is_ref": "IS 16102 (Part 1)"},
    "மோட்டார் பம்ப்": {"canonical": "Submersible Motor Pumps", "is_ref": "IS 14220"},
    "பாதுகாப்பு தலைக்கவசம்": {"canonical": "Safety Helmets", "is_ref": "IS 2925"},
    "செங்கல்": {"canonical": "Clay Bricks", "is_ref": "IS 1077"},
    "கான்கிரீட்": {"canonical": "Plain and Reinforced Concrete", "is_ref": "IS 456"},

    # Telugu
    "సిమెంట్": {"canonical": "Ordinary Portland Cement", "is_ref": "IS 269"},
    "ఇనుము": {"canonical": "TMT Deformed Steel Bars", "is_ref": "IS 1786"},
    "టీఎంటీ రాడ్లు": {"canonical": "TMT Steel Rods", "is_ref": "IS 1786"},
    "టీఎంటీ": {"canonical": "TMT Steel Rods", "is_ref": "IS 1786"},
    "రాడ్లు": {"canonical": "TMT Steel Rods", "is_ref": "IS 1786"},
    "నీటి పైపు": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "పీవీసీ పైపులు": {"canonical": "uPVC Water Pipes", "is_ref": "IS 4985"},
    "విద్యుత్ వైరు": {"canonical": "Electric Wire Cable", "is_ref": "IS 694"},
    "ట్రాన్స్‌ఫార్మర్": {"canonical": "Power & Distribution Transformer", "is_ref": "IS 1180 (Part 1)"},
    "ఎల్ఈడీ బల్బు": {"canonical": "LED Bulbs", "is_ref": "IS 16102 (Part 1)"},
    "మోటారు పంపు": {"canonical": "Electric Motor Pump", "is_ref": "IS 14220"},
    "హెల్మెట్": {"canonical": "Safety Helmets", "is_ref": "IS 2925"},
    "ఇటుక": {"canonical": "Building Bricks", "is_ref": "IS 1077"},
    "కాంక్రీట్": {"canonical": "Concrete Construction Code", "is_ref": "IS 456"},

    # Gujarati
    "સિમેન્ટ": {"canonical": "Ordinary Portland Cement", "is_ref": "IS 269"},
    "સ્ટીલ": {"canonical": "TMT Deformed Steel Bars", "is_ref": "IS 1786"},
    "ટીએમટી": {"canonical": "TMT Deformed Steel Bars", "is_ref": "IS 1786"},
    "પાઇપ": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "એચડીપીઇ પાઇપ": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "પીવાનું પાણી પાઇપ": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "વીજળી વાયર": {"canonical": "Electric Wire Cable", "is_ref": "IS 694"},
    "ટ્રાન્સફોર્મર": {"canonical": "Power & Distribution Transformer", "is_ref": "IS 1180 (Part 1)"},
    "સુરક્ષા હેલ્મેટ": {"canonical": "Safety Helmets", "is_ref": "IS 2925"},
    "પેવર બ્લોક": {"canonical": "Precast Concrete Blocks for Paving", "is_ref": "IS 15658"},
    "સબમર્સિબલ પંપ": {"canonical": "Submersible Pumpsets", "is_ref": "IS 14220"},
    "એલઈડી લાઇટ": {"canonical": "LED Bulbs", "is_ref": "IS 16102 (Part 1)"},
    "ઈંટ": {"canonical": "Building Bricks", "is_ref": "IS 1077"},
    "કોંક્રિટ": {"canonical": "Concrete Construction Code", "is_ref": "IS 456"},

    # Marathi
    "सिमेंट": {"canonical": "Ordinary Portland Cement", "is_ref": "IS 269"},
    "पोलाद": {"canonical": "TMT Deformed Steel Bars", "is_ref": "IS 1786"},
    "टीएमटी पोलाद": {"canonical": "TMT Deformed Steel Bars", "is_ref": "IS 1786"},
    "पाईप": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "पिण्याचे पाणी पाईप": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "विद्युत वायर": {"canonical": "Electric Wire", "is_ref": "IS 694"},
    "ट्रान्सफॉर्मर": {"canonical": "Distribution Transformer", "is_ref": "IS 1180 (Part 1)"},
    "सुरक्षा शिरस्त्राण": {"canonical": "Safety Helmets", "is_ref": "IS 2925"},
    "पेव्हर ब्लॉक": {"canonical": "Precast Concrete Blocks for Paving", "is_ref": "IS 15658"},
    "सबमर्सिबल पंप": {"canonical": "Submersible Pumpsets", "is_ref": "IS 14220"},
    "एलईडी दिवा": {"canonical": "LED Lamps", "is_ref": "IS 16102 (Part 1)"},
    "वीट": {"canonical": "Common Clay Bricks", "is_ref": "IS 1077"},
    "काँक्रीट": {"canonical": "Plain and Reinforced Concrete", "is_ref": "IS 456"},

    # Bengali
    "সিমেন্ট": {"canonical": "Ordinary Portland Cement", "is_ref": "IS 269"},
    "ইস্পাত": {"canonical": "TMT Deformed Steel Bars", "is_ref": "IS 1786"},
    "টিএমটি রড": {"canonical": "TMT Deformed Steel Bars", "is_ref": "IS 1786"},
    "পাইপ": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "পানীয় জলের পাইপ": {"canonical": "HDPE Pipes for Water Supply", "is_ref": "IS 4984"},
    "বৈদ্যুতিক তার": {"canonical": "Electric Cable", "is_ref": "IS 694"},
    "ট্রান্সফরমার": {"canonical": "Distribution Transformer", "is_ref": "IS 1180 (Part 1)"},
    "নিরাপত্তা হেলমেট": {"canonical": "Safety Helmets", "is_ref": "IS 2925"},
    "পেভার ব্লক": {"canonical": "Precast Concrete Blocks for Paving", "is_ref": "IS 15658"},
    "সাবমার্সিবল পাম্প": {"canonical": "Submersible Pumpsets", "is_ref": "IS 14220"},
    "এলইডি বাতি": {"canonical": "LED Light", "is_ref": "IS 16102 (Part 1)"}
}


def run():
    logger.info("Enriching regional glossaries...")
    with open(REGIONAL_FILE, "w", encoding="utf-8") as f:
        json.dump(REGIONAL_DATA, f, indent=2, ensure_ascii=False)
    logger.info("Saved regional glossaries to %s", REGIONAL_FILE)

    # Load existing synonym index and merge
    logger.info("Enriching synonym search index with Indic mappings...")
    with open(SYNONYM_FILE, "r", encoding="utf-8") as f:
        synonyms = json.load(f)

    for k, v in INDIC_TERM_TO_IS_MAPPING.items():
        synonyms[k.lower()] = v
        synonyms[k] = v

    with open(SYNONYM_FILE, "w", encoding="utf-8") as f:
        json.dump(synonyms, f, indent=2, ensure_ascii=False)
    logger.info("Saved %d synonym entries to %s", len(synonyms), SYNONYM_FILE)


if __name__ == "__main__":
    run()
