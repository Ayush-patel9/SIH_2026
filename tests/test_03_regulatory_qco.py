import pytest
import re

def test_qco_matrix_loaded(qco_matrix):
    assert len(qco_matrix) >= 50, f"Expected >= 50 QCO matrix entries, got {len(qco_matrix)}"

def test_qco_standards_resolve_in_master(master_catalog, qco_matrix):
    def norm_str(s):
        return re.sub(r"[^A-Z0-9]", "", str(s).upper())

    master_keys = set(norm_str(r.get("is_number", "")) for r in master_catalog)
    
    unresolved = []
    for k in qco_matrix.keys():
        if norm_str(k) not in master_keys:
            unresolved.append(k)
            
    assert len(unresolved) == 0, f"Unresolved QCO keys in master catalog: {unresolved}"

def test_mandatory_standards_flagged(master_catalog):
    mandatory = [r for r in master_catalog if r.get("regulatory_compliance", {}).get("is_mandatory")]
    assert len(mandatory) >= 80, f"Expected >= 80 mandatory standards, found {len(mandatory)}"
