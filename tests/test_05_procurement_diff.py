import pytest
import json

def test_cppp_live_tenders_count(data_dir):
    tenders_dir = data_dir / "05_procurement_gold_corpus" / "cppp_live_tenders"
    assert tenders_dir.exists(), "Missing cppp_live_tenders directory"
    tender_dirs = [d for d in tenders_dir.iterdir() if d.is_dir()]
    assert len(tender_dirs) >= 50, f"Expected >= 50 real CPPP live tenders, found {len(tender_dirs)}"

def test_tender_ground_truth_files(data_dir):
    tenders_dir = data_dir / "05_procurement_gold_corpus" / "cppp_live_tenders"
    for td in tenders_dir.iterdir():
        if td.is_dir():
            assert (td / "raw_tender.txt").exists(), f"Missing raw_tender.txt in {td.name}"
            assert (td / "found_citations.json").exists(), f"Missing found_citations.json in {td.name}"
            assert (td / "outdated_citations.json").exists(), f"Missing outdated_citations.json in {td.name}"
            assert (td / "recommended_updates.json").exists(), f"Missing recommended_updates.json in {td.name}"
