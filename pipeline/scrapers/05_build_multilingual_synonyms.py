import os
import sys
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
MULTILINGUAL_DIR = os.path.join(DATA_DIR, "06_multilingual_lexicon")
os.makedirs(MULTILINGUAL_DIR, exist_ok=True)

# CSTT & BIS Multilingual Technical Terminology Mapping
MULTILINGUAL_DICTIONARY = [
    {
        "term_english": "Reinforcement Steel / TMT Bars",
        "terms_hindi": ["सरिया", "सरिए", "रीइन्फोर्समेंट स्टील", "कंक्रीट सरिया", "टीएमटी बार", "विकृत इस्पात छड़ें"],
        "governing_is": "IS 1786",
        "description_hi": "कंक्रीट सुदृढ़ीकरण के लिए उच्च सामर्थ्य विकृत इस्पात की छड़ें और तार",
        "keywords": ["saria", "tmt bar", "rebar", "reinforcement", "steel rod"]
    },
    {
        "term_english": "Ordinary Portland Cement (OPC)",
        "terms_hindi": ["साधारण पोर्टलैंड सीमेंट", "सीमेंट 43 ग्रेड", "सीमेंट 53 ग्रेड", "सीमेंट की बोरियां"],
        "governing_is": "IS 269",
        "description_hi": "साधारण पोर्टलैंड सीमेंट - विनिर्देश",
        "keywords": ["cement", "opc 43", "opc 53", "portland cement"]
    },
    {
        "term_english": "Portland Pozzolana Cement (PPC)",
        "terms_hindi": ["पोर्टलैंड पॉज़ोलाना सीमेंट", "फ्लाई ऐश सीमेंट", "पीपीसी सीमेंट"],
        "governing_is": "IS 1489 (Part 1)",
        "description_hi": "पोर्टलैंड पॉज़ोलाना सीमेंट (फ्लाई ऐश आधारित)",
        "keywords": ["ppc cement", "fly ash cement"]
    },
    {
        "term_english": "PVC Insulated Electrical Cables",
        "terms_hindi": ["बिजली का तार", "विद्युत केबल", "पीवीसी तार", "तांबे का तार", "वायरिंग तार"],
        "governing_is": "IS 694",
        "description_hi": "1100 वोल्ट तक के लिए पीवीसी रोधित विद्युत तार व केबल",
        "keywords": ["pvc wire", "electric wire", "copper cable", "house wiring"]
    },
    {
        "term_english": "Distribution Transformers",
        "terms_hindi": ["वितरण ट्रांसफार्मर", "बिजली का ट्रांसफार्मर", "विद्युत ट्रांसफॉर्मर"],
        "governing_is": "IS 1180 (Part 1)",
        "description_hi": "2500 केवीए, 33 केवी तक तेल निमज्जित आउटडोर वितरण ट्रांसफार्मर",
        "keywords": ["transformer", "distribution transformer", "100 kva transformer", "250 kva transformer"]
    },
    {
        "term_english": "LED Street Lights and Luminaires",
        "terms_hindi": ["एलईडी स्ट्रीट लाइट", "सड़क बत्ती", "एलईडी प्रकाश व्यवस्था", "एलईडी ल्यूमिनेयर"],
        "governing_is": "IS 10322 (Part 5/Sec 3)",
        "description_hi": "सड़क और मार्ग प्रकाश व्यवस्था हेतु एलईडी ल्यूमिनेयर",
        "keywords": ["led street light", "street luminaire", "led road lighting"]
    },
    {
        "term_english": "Solar Photovoltaic Modules",
        "terms_hindi": ["सोलर पैनल", "सौर फोटोवोल्टिक मॉड्यूल", "सोलर प्लेट", "सौर ऊर्जा पैनल"],
        "governing_is": "IS 14286",
        "description_hi": "स्थलीय सौर पीवी मॉड्यूल हेतु डिजाइन योग्यता एवं प्रकार अनुमोदन",
        "keywords": ["solar panel", "solar module", "pv module", "solar plate"]
    },
    {
        "term_english": "Office Work Chairs",
        "terms_hindi": ["कार्यालय की कुर्सी", "घूमने वाली कुर्सी", "कार्य कुर्सी", "रिवॉल्विंग चेयर", "एर्गोनोमिक कुर्सी"],
        "governing_is": "IS 17631",
        "description_hi": "कार्य कुर्सियां - विनिर्देश",
        "keywords": ["office chair", "revolving chair", "work chair", "ergonomic chair"]
    },
    {
        "term_english": "Portable Fire Extinguishers",
        "terms_hindi": ["अग्निशामक यंत्र", "आग बुझाने का यंत्र", "फायर एक्सटिंग्विशर", "एबीसी पाउडर सिलेंडर"],
        "governing_is": "IS 15683",
        "description_hi": "सुवाह्य अग्निशामक यंत्र - कार्यनिष्पादन एवं निर्माण",
        "keywords": ["fire extinguisher", "abc fire extinguisher", "co2 fire extinguisher"]
    },
    {
        "term_english": "Protective Two-Wheeler Helmets",
        "terms_hindi": ["सुरक्षा हेलमेट", "दुपहिया वाहन चालकों के लिए हेलमेट", "हेलमेट"],
        "governing_is": "IS 4151",
        "description_hi": "दोपहिया वाहन सवारों के लिए सुरक्षात्मक हेलमेट",
        "keywords": ["helmet", "two wheeler helmet", "bike helmet"]
    },
    {
        "term_english": "Ductile Iron Water Supply Pipes",
        "terms_hindi": ["डक्टाइल आयरन पाइप", "डीआई पाइप", "जल आपूर्ति पाइप", "सीवेज पाइप"],
        "governing_is": "IS 8329",
        "description_hi": "पानी, गैस और सीवेज हेतु डक्टाइल आयरन प्रेशर पाइप",
        "keywords": ["di pipe", "ductile iron pipe", "water supply pipe"]
    },
    {
        "term_english": "Drinking Water Specification",
        "terms_hindi": ["पीने का पानी", "पेयजल", "शुद्ध पेयजल मानक"],
        "governing_is": "IS 10500",
        "description_hi": "पेयजल विनिर्देश",
        "keywords": ["drinking water", "potable water", "water quality"]
    },
    {
        "term_english": "Gold Jewellery & Artefacts (Hallmarking)",
        "terms_hindi": ["सोने के आभूषण", "स्वर्ण आभूषण", "सोने का हॉलमार्क", "हॉलमार्किंग"],
        "governing_is": "IS 1417",
        "description_hi": "सोना और स्वर्ण मिश्र धातु, आभूषण - शुद्धता और अंकन",
        "keywords": ["gold jewellery", "hallmark", "gold hallmark", "gold purity"]
    },
    {
        "term_english": "Domestic Pressure Cookers",
        "terms_hindi": ["प्रेशर कुकर", "घरेलू प्रेशर कुकर"],
        "governing_is": "IS 2347",
        "description_hi": "घरेलू प्रेशर कुकर - विनिर्देश",
        "keywords": ["pressure cooker", "cooker"]
    },
    {
        "term_english": "Safety of Toys",
        "terms_hindi": ["बच्चों के खिलौने", "सुरक्षित खिलौने", "इलेक्ट्रिक खिलौने"],
        "governing_is": "IS 9873 (Part 1)",
        "description_hi": "खिलौनों की सुरक्षा (यांत्रिक और भौतिक गुण)",
        "keywords": ["toys", "baby toys", "safety of toys"]
    }
]

def compile_multilingual_lexicon():
    """Compile multilingual vocabulary and search synonym index"""
    logger.info("=== COMPILING MULTILINGUAL VERNACULAR & SYNONYMS LEXICON ===")
    
    out_file = os.path.join(MULTILINGUAL_DIR, "technical_glossary_hi.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(MULTILINGUAL_DICTIONARY, f, indent=2, ensure_ascii=False)
        
    # Build fast query lookup inverted index
    inverted_index: Dict[str, str] = {}
    for item in MULTILINGUAL_DICTIONARY:
        target_is = item["governing_is"]
        for term_hi in item["terms_hindi"]:
            inverted_index[term_hi.lower().strip()] = target_is
        for kw in item["keywords"]:
            inverted_index[kw.lower().strip()] = target_is
            
    index_file = os.path.join(MULTILINGUAL_DIR, "synonym_search_index.json")
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(inverted_index, f, indent=2, ensure_ascii=False)
        
    logger.info(f" Saved Multilingual Dictionary with {len(MULTILINGUAL_DICTIONARY)} bilingual product categories -> {out_file}")
    logger.info(f" Compiled Fast Semantic Inverted Lookup Index with {len(inverted_index)} vernacular query terms -> {index_file}")

if __name__ == "__main__":
    compile_multilingual_lexicon()
