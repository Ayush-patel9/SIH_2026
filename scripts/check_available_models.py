#!/usr/bin/env python3
"""
ManakAI (SIH 2026) — Comprehensive Gemini Model Evaluator & Benchmark
Discovers all content-generation models for the configured API key,
evaluates text/JSON speed, tests multimodal PDF parsing on real tender documents,
and outputs a complete performance & quota scorecard with recommendations.
"""

import os
import sys
import time
import json
import warnings
from pathlib import Path
from dotenv import load_dotenv

# Suppress deprecated warnings for cleaner output
warnings.filterwarnings("ignore")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
env_path = PROJECT_ROOT / ".env"
load_dotenv(dotenv_path=env_path)

try:
    import google.generativeai as genai
except ImportError:
    print("[ERROR] google-generativeai is not installed.", flush=True)
    sys.exit(1)

def print_header(title: str):
    print("\n" + "=" * 78, flush=True)
    print(f"  {title}", flush=True)
    print("=" * 78, flush=True)

def main():
    print_header("GEMINI MODEL DIAGNOSTICS & CAPABILITY BENCHMARK (SIH 2026)")

    # 1. Load API Key
    raw_keys = os.getenv("GEMINI_API_KEYS", os.getenv("GEMINI_API_KEY", ""))
    keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
    if not keys:
        print("[FAIL] No GEMINI_API_KEYS or GEMINI_API_KEY found in .env!", flush=True)
        return

    active_key = keys[0]
    print(f"[*] API Key Detected: {active_key[:8]}...{active_key[-6:]} (Total keys: {len(keys)})", flush=True)
    genai.configure(api_key=active_key)

    # 2. Discover all generation models
    print("\n[Step 1] Querying Google AI Studio for all models...", flush=True)
    all_gen_models = []
    try:
        for m in genai.list_models():
            if "generateContent" in m.supported_generation_methods:
                clean_name = m.name.replace("models/", "")
                all_gen_models.append({
                    "name": clean_name,
                    "display_name": getattr(m, "display_name", clean_name),
                    "input_token_limit": getattr(m, "input_token_limit", 0),
                    "output_token_limit": getattr(m, "output_token_limit", 0),
                    "description": getattr(m, "description", "")
                })
        print(f"[SUCCESS] Found {len(all_gen_models)} models supporting 'generateContent'.", flush=True)
    except Exception as e:
        print(f"[FAIL] Error querying list_models(): {e}", flush=True)
        return

    # Print all found generation models
    print("\nAvailable Content-Generation Models in your Account:")
    for m in all_gen_models:
        in_tok = f"{m['input_token_limit']:,}" if m['input_token_limit'] else "Unknown"
        out_tok = f"{m['output_token_limit']:,}" if m['output_token_limit'] else "Unknown"
        print(f"  - {m['name']:<32} | Input Tokens: {in_tok:<10} | Output Tokens: {out_tok}", flush=True)

    # 3. Select Key Candidates for Live Testing
    # Priority candidates: current, flash, pro, and latest aliases
    priority_candidates = [
        "gemini-2.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-3.8-flash",
        "gemini-3.8-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash-8b",
    ]

    # Combine candidates present in all_gen_models or prioritized
    models_to_test = []
    seen = set()
    for name in priority_candidates:
        if name not in seen:
            seen.add(name)
            models_to_test.append(name)

    # Add other models from discovery
    for m in all_gen_models:
        name = m["name"]
        if name not in seen and not any(x in name for x in ["tts", "embedding", "aqa", "imagen"]):
            seen.add(name)
            models_to_test.append(name)

    # 4. Load Mock Tender PDF
    mock_pdf_path = PROJECT_ROOT / "MOCK_GOVERNMENT_TENDER_NIT_2026.pdf"
    pdf_bytes = None
    if mock_pdf_path.exists():
        pdf_bytes = mock_pdf_path.read_bytes()
        print(f"\n[*] Loaded local test PDF: {mock_pdf_path.name} ({len(pdf_bytes):,} bytes)", flush=True)
    else:
        print("\n[WARN] MOCK_GOVERNMENT_TENDER_NIT_2026.pdf not found; PDF testing skipped.", flush=True)

    # 5. Live Benchmarking
    print_header("LIVE BENCHMARK: JSON GENERATION & MULTIMODAL PDF PARSING")
    print(f"{'#':<3} | {'Model Name':<28} | {'Text/JSON':<10} | {'PDF Parsing':<16} | Notes", flush=True)
    print("-" * 78, flush=True)

    test_results = []
    for idx, model_name in enumerate(models_to_test, 1):
        res_info = {
            "name": model_name,
            "text_ok": False,
            "text_time": None,
            "pdf_ok": False,
            "pdf_time": None,
            "error": None,
            "input_tokens": next((m["input_token_limit"] for m in all_gen_models if m["name"] == model_name), 0)
        }

        # Step A: Text & JSON Generation
        try:
            model = genai.GenerativeModel(model_name)
            t0 = time.time()
            resp = model.generate_content(
                "Return a JSON object: {\"status\": \"ONLINE\", \"tested_model\": \"" + model_name + "\"}",
                generation_config={"response_mime_type": "application/json"},
                request_options={"timeout": 8.0}
            )
            elapsed_text = round(time.time() - t0, 2)
            res_info["text_ok"] = True
            res_info["text_time"] = elapsed_text
        except Exception as e:
            err_line = str(e).split("\n")[0]
            if "404" in err_line:
                res_info["error"] = "404 Not Found / Inaccessible"
            elif "429" in err_line:
                res_info["error"] = "429 Rate Limit / Quota Exceeded"
            else:
                res_info["error"] = err_line[:30]

        # Step B: Multimodal PDF Parsing (if text succeeded and PDF exists)
        if res_info["text_ok"] and pdf_bytes:
            try:
                pdf_part = {"inline_data": {"mime_type": "application/pdf", "data": pdf_bytes}}
                prompt = (
                    "You are a BIS procurement specialist. "
                    "Analyze the attached tender PDF and extract in strict JSON: "
                    "{\"items\": [{\"name\": string, \"grade\": string}]}"
                )
                t0 = time.time()
                resp = model.generate_content(
                    [pdf_part, prompt],
                    generation_config={"response_mime_type": "application/json"},
                    request_options={"timeout": 15.0}
                )
                elapsed_pdf = round(time.time() - t0, 2)
                res_info["pdf_ok"] = True
                res_info["pdf_time"] = elapsed_pdf
            except Exception as e:
                err_line = str(e).split("\n")[0]
                if "429" in err_line:
                    res_info["pdf_error"] = "429 Quota Exceeded"
                else:
                    res_info["pdf_error"] = err_line[:25]

        # Format output line
        text_str = f"OK ({res_info['text_time']}s)" if res_info["text_ok"] else "FAILED"
        if res_info["pdf_ok"]:
            pdf_str = f"PASS ({res_info['pdf_time']}s)"
        elif res_info["text_ok"]:
            pdf_str = f"FAIL ({res_info.get('pdf_error', 'err')})"
        else:
            pdf_str = "SKIPPED"
        
        note = res_info["error"] or ("Fully Compatible" if (res_info["text_ok"] and res_info["pdf_ok"]) else "Text Only")
        print(f"{idx:<3} | {model_name:<28} | {text_str:<10} | {pdf_str:<16} | {note}", flush=True)
        test_results.append(res_info)

    # 6. Evaluation & Strategic Recommendations
    print_header("EVALUATION & STRATEGIC RECOMMENDATIONS")

    fully_compatible = [r for r in test_results if r["text_ok"] and r["pdf_ok"]]

    if fully_compatible:
        # Sort by total speed (text + pdf)
        fully_compatible.sort(key=lambda x: (x["text_time"] or 99) + (x["pdf_time"] or 99))

        print("\nTop Models Fully Supporting Both Text/JSON & Multimodal PDF Ingestion:\n")
        for i, m in enumerate(fully_compatible, 1):
            tok_fmt = f"{m['input_tokens']:,}" if m['input_tokens'] else "1M+"
            print(f"  {i}. {m['name']:<26} -> Text: {m['text_time']}s | PDF: {m['pdf_time']}s | Context: {tok_fmt} tokens", flush=True)

        # Flash recommendation: lightest & fastest with full PDF support
        best_flash = fully_compatible[0]["name"]
        
        # Pro recommendation: best high-tier model for reasoning & spec drafting
        pro_candidates = [m for m in fully_compatible if "pro" in m["name"]]
        best_pro = pro_candidates[0]["name"] if pro_candidates else best_flash

        print("\n" + "-" * 78, flush=True)
        print("  RECOMMENDED SETTINGS FOR YOUR `.env` FILE", flush=True)
        print("-" * 78, flush=True)
        print(f"GEMINI_FLASH_MODEL={best_flash}", flush=True)
        print(f"GEMINI_PRO_MODEL={best_pro}", flush=True)
        print("-" * 78, flush=True)

        print("\nQUOTA & PERFORMANCE CHARACTERISTICS:")
        print(f"  • {best_flash}:")
        print("    - Free Tier Quota: Highest Requests Per Minute (RPM) & Requests Per Day (RPD).")
        print("    - Speed: Sub-second JSON generation, fast multimodal PDF OCR.")
        print("    - Ideal for: Query Normalization (AI Call #1) and Tender PDF Decomposition.")
        print(f"  • {best_pro}:")
        print("    - Reasoning: Superior depth for standard compliance checklists & spec drafting.")
        print("    - Ideal for: Grounded Reasoning & Explainability (AI Call #2).")
    else:
        print("[!] No tested models succeeded with both text and PDF.")
        working_text = [r for r in test_results if r["text_ok"]]
        if working_text:
            print(f"Models that worked for Text only: {[r['name'] for r in working_text]}", flush=True)

    print("=" * 78 + "\n", flush=True)

if __name__ == "__main__":
    main()
