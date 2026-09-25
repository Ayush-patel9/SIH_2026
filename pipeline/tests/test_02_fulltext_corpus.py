import pytest
import json
import glob
from collections import Counter

def test_raw_downloads_volume(data_dir):
    raw_files = list((data_dir / "02_fulltext_corpus" / "raw_ia_downloads").glob("*.txt"))
    assert len(raw_files) >= 1500, f"Expected >= 1,500 raw text standards, found {len(raw_files)}"

def test_no_duplicate_raw_downloads(data_dir):
    raw_files = [f.name for f in (data_dir / "02_fulltext_corpus" / "raw_ia_downloads").glob("*.txt")]
    import re
    def norm_fname(f):
        s = f.replace(".txt", "")
        s = re.sub(r"gov\.in\.is\.", "", s)
        s = re.sub(r"IS_", "", s)
        s = re.sub(r"\.\d{4}$", "", s)
        s = re.sub(r"__PART_(\d+)__?", r".\1", s)
        return s.replace("_", ".")
    
    norms = [norm_fname(f) for f in raw_files]
    dups = [k for k, v in Counter(norms).items() if v > 1]
    assert len(dups) == 0, f"Found {len(dups)} duplicate raw download standard files: {dups[:5]}"

def test_parsed_clauses_volume(data_dir):
    parsed_files = list((data_dir / "02_fulltext_corpus" / "parsed_clauses").glob("*.json"))
    assert len(parsed_files) >= 1500, f"Expected >= 1,500 parsed clause JSONs, found {len(parsed_files)}"

def test_unique_scopes_no_bleed(data_dir):
    parsed_files = list((data_dir / "02_fulltext_corpus" / "parsed_clauses").glob("*.json"))
    scopes = []
    for pf in parsed_files:
        with open(pf, "r", encoding="utf-8") as f:
            d = json.load(f)
            s = d.get("clause_1_scope", "").strip()
            if s:
                scopes.append(s)
    
    unique_scopes = set(scopes)
    # Check that at least 85% of scopes are distinct (allowing multi-part series like IS 10810, IS 10000)
    uniqueness_ratio = len(unique_scopes) / len(parsed_files)
    assert uniqueness_ratio >= 0.85, f"Scope uniqueness ratio too low ({uniqueness_ratio:.1%}). Systemic scope bleed detected."

def test_normative_graph_integrity(data_dir, master_catalog):
    import re
    def norm_str(s):
        return re.sub(r"[^A-Z0-9]", "", str(s).upper())

    master_keys = set(norm_str(r.get("is_number", "")) for r in master_catalog)
    
    graph_file = data_dir / "02_fulltext_corpus" / "clause2_normative_graph" / "normative_edges.json"
    assert graph_file.exists(), "Missing normative_edges.json"
    with open(graph_file, "r", encoding="utf-8") as f:
        edges = json.load(f)
        
    assert len(edges) >= 5000, f"Expected >= 5,000 normative edges, found {len(edges)}"
    self_loops = [e for e in edges if e.get("source") == e.get("target")]
    assert len(self_loops) == 0, f"Found {len(self_loops)} self loops in normative graph"

def test_rag_chunks_integrity(data_dir):
    rag_file = data_dir / "02_fulltext_corpus" / "rag_chunks" / "unified_rag_chunks.json"
    assert rag_file.exists(), "Missing unified_rag_chunks.json"
    with open(rag_file, "r", encoding="utf-8") as f:
        chunks = json.load(f)
    assert len(chunks) >= 2000, f"Expected >= 2,000 RAG chunks, found {len(chunks)}"
    empty_chunks = [c for c in chunks if not c.get("text")]
    assert len(empty_chunks) == 0, f"Found {len(empty_chunks)} empty text chunks"
