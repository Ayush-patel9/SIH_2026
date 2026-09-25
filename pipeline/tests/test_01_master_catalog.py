import pytest

def test_master_catalog_census(master_catalog):
    assert len(master_catalog) >= 21500, f"Expected >= 21,500 standards, found {len(master_catalog)}"

def test_master_catalog_non_null_fields(master_catalog):
    null_is = sum(1 for r in master_catalog if not r.get("is_number"))
    null_title = sum(1 for r in master_catalog if not r.get("title"))
    null_div = sum(1 for r in master_catalog if not r.get("technical_committee", {}).get("division_code"))
    null_aspect = sum(1 for r in master_catalog if not r.get("aspect"))
    null_ics = sum(1 for r in master_catalog if not r.get("ics_codes") or len(r.get("ics_codes")) == 0)

    assert null_is == 0, f"Found {null_is} standards with null is_number"
    assert null_title == 0, f"Found {null_title} standards with null title"
    assert null_div == 0, f"Found {null_div} standards with null division"
    assert null_aspect == 0, f"Found {null_aspect} standards with null aspect"
    assert null_ics == 0, f"Found {null_ics} standards with null ICS codes"

def test_no_generic_is_iec(master_catalog):
    generic_iec = [r for r in master_catalog if r.get("is_number") in ["IS IEC", "IS IEC ", "IS/IEC"]]
    assert len(generic_iec) == 0, f"Found {len(generic_iec)} unparsed generic 'IS IEC' standard keys"

def test_ics_classification_tree_exists(data_dir):
    import json
    tree_file = data_dir / "01_master_catalog" / "ics_classification_tree.json"
    assert tree_file.exists(), "Missing ics_classification_tree.json"
    with open(tree_file, "r", encoding="utf-8") as f:
        tree = json.load(f)
    assert "metadata" in tree
    assert tree["metadata"]["total_fields"] >= 30
    assert tree["metadata"]["total_groups"] >= 250
