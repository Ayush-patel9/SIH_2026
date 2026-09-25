import pytest
import json

def test_hindi_glossary_entries(data_dir):
    gloss_file = data_dir / "06_multilingual_lexicon" / "technical_glossary_hi.json"
    assert gloss_file.exists(), "Missing technical_glossary_hi.json"
    with open(gloss_file, "r", encoding="utf-8") as f:
        gloss = json.load(f)
    terms = gloss.get("terms", gloss)
    assert len(terms) >= 150, f"Expected >= 150 Hindi technical terms, found {len(terms)}"

def test_regional_languages_glossary(data_dir):
    reg_file = data_dir / "06_multilingual_lexicon" / "regional_glossary_multi.json"
    assert reg_file.exists(), "Missing regional_glossary_multi.json"
    with open(reg_file, "r", encoding="utf-8") as f:
        reg = json.load(f)
    langs = reg.get("languages", reg.get("metadata", {}).get("languages", reg))
    assert len(langs) >= 5, f"Expected >= 5 regional language glossaries, found {len(langs)}"

def test_vernacular_search_index(data_dir):
    idx_file = data_dir / "06_multilingual_lexicon" / "synonym_search_index.json"
    assert idx_file.exists(), "Missing synonym_search_index.json"
    with open(idx_file, "r", encoding="utf-8") as f:
        idx = json.load(f)
    assert len(idx) >= 300, f"Expected >= 300 vernacular index entries, found {len(idx)}"
