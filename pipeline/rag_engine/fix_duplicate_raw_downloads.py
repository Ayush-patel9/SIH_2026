#!/usr/bin/env python3
"""
fix_duplicate_raw_downloads.py
Removes older duplicate raw download files from 02_fulltext_corpus/raw_ia_downloads/
keeping only the newest/largest version per IS number.

Diagnosed duplicates: IS 1608, IS 10500, IS 14543

Run: ./venv/bin/python3 pipeline/rag_engine/fix_duplicate_raw_downloads.py
Fixes test: test_no_duplicate_raw_downloads
"""
import re
from collections import defaultdict, Counter
from pathlib import Path

RAW_DIR = Path(__file__).parent.parent / "data" / "02_fulltext_corpus" / "raw_ia_downloads"


def normalize_fname(fname: str) -> str:
    """Normalize filename to IS number key for duplicate detection — mirrors test logic exactly."""
    s = fname.replace(".txt", "")
    s = re.sub(r"gov\.in\.is\.", "", s)
    s = re.sub(r"IS_", "", s)
    s = re.sub(r"\.\d{4}$", "", s)
    s = re.sub(r"__PART_(\d+)__?", r".\1", s)
    return s.replace("_", ".")


def run():
    files = list(RAW_DIR.glob("*.txt"))
    print(f"Total .txt files found: {len(files)}")

    groups: dict[str, list[Path]] = defaultdict(list)
    for f in files:
        key = normalize_fname(f.name)
        groups[key].append(f)

    removed = 0
    for key, file_list in groups.items():
        if len(file_list) > 1:
            # Sort by file size descending — keep the bigger (more complete) file
            file_list.sort(key=lambda f: f.stat().st_size, reverse=True)
            for duplicate in file_list[1:]:
                print(f"  Removing duplicate: {duplicate.name}  (keeping: {file_list[0].name})")
                duplicate.unlink()
                removed += 1

    print(f"\nRemoved {removed} duplicate file(s).")

    # Verify zero duplicates remain (mirrors test normalization exactly)
    remaining = [f.name for f in RAW_DIR.glob("*.txt")]
    norms = [normalize_fname(f) for f in remaining]
    dups = [k for k, v in Counter(norms).items() if v > 1]
    if dups:
        print(f"STILL DUPLICATES: {dups}")
    else:
        print("Verification PASSED — no duplicates remaining.")


if __name__ == "__main__":
    run()
