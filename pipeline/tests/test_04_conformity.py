import pytest
import json

def test_conformity_schemes(data_dir):
    schemes_file = data_dir / "04_conformity_ecosystem" / "conformity_schemes.json"
    assert schemes_file.exists(), "Missing conformity_schemes.json"
    with open(schemes_file, "r", encoding="utf-8") as f:
        schemes = json.load(f)
    assert len(schemes) >= 5, f"Expected >= 5 conformity schemes, found {len(schemes)}"

def test_lims_lab_registry(data_dir):
    lims_file = data_dir / "04_conformity_ecosystem" / "lims_lab_registry.json"
    assert lims_file.exists(), "Missing lims_lab_registry.json"
    with open(lims_file, "r", encoding="utf-8") as f:
        lims = json.load(f)
    assert "standards_covered" in lims or "labs" in lims or len(lims) >= 10

def test_manak_licensee_registry(data_dir):
    manak_file = data_dir / "04_conformity_ecosystem" / "manak_licensee_registry.json"
    assert manak_file.exists(), "Missing manak_licensee_registry.json"
    with open(manak_file, "r", encoding="utf-8") as f:
        manak = json.load(f)
    assert "standards" in manak or "total_licensees" in manak.get("metadata", {}) or len(manak) >= 2
