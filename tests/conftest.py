import os
import sys
import pytest
from pathlib import Path

# Set UTF-8
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"

@pytest.fixture(scope="session")
def data_dir():
    return DATA_DIR

@pytest.fixture(scope="session")
def master_catalog(data_dir):
    import json
    cat_path = data_dir / "01_master_catalog" / "unified_standards.json"
    with open(cat_path, "r", encoding="utf-8") as f:
        return json.load(f)

@pytest.fixture(scope="session")
def qco_matrix(data_dir):
    import json
    qco_path = data_dir / "03_regulatory_qco" / "qco_mapping_matrix.json"
    with open(qco_path, "r", encoding="utf-8") as f:
        return json.load(f)
