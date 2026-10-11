import os
import sys
import json
import time
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
load_dotenv(PROJECT_ROOT / ".env")

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from pipeline.rag_engine.llm_gateway import llm_gateway, LLMTaskType

def test_model_speed(model_name: str):
    print(f"\n--- Testing Model: {model_name} ---")
    active_key = llm_gateway.keys[0]
    llm_gateway.genai.configure(api_key=active_key)
    t0 = time.time()
    try:
        model = llm_gateway.genai.GenerativeModel(model_name)
        resp = model.generate_content(
            "Return JSON: {\"status\": \"ONLINE\", \"query\": \"IS 269 cement specification\"}",
            generation_config={"response_mime_type": "application/json"}
        )
        t1 = time.time()
        print(f"[{model_name}] Text/JSON Generation: SUCCESS in {t1 - t0:.2f}s")
    except Exception as e:
        print(f"[{model_name}] Text/JSON Generation: FAILED: {e}")

    pdf_path = PROJECT_ROOT / "MOCK_GOVERNMENT_TENDER_NIT_2026.pdf"
    if pdf_path.exists():
        t0 = time.time()
        try:
            model = llm_gateway.genai.GenerativeModel(model_name)
            pdf_bytes = pdf_path.read_bytes()
            resp = model.generate_content(
                [
                    {"inline_data": {"mime_type": "application/pdf", "data": pdf_bytes}},
                    "Extract tender authority and reference as JSON: {\"authority\": \"...\", \"reference\": \"...\"}"
                ],
                generation_config={"response_mime_type": "application/json"}
            )
            t1 = time.time()
            print(f"[{model_name}] Multimodal PDF Ingestion: SUCCESS in {t1 - t0:.2f}s")
        except Exception as e:
            print(f"[{model_name}] Multimodal PDF Ingestion: FAILED: {e}")

def test_backend_llm_calls():
    print("=" * 60)
    print("TESTING BACKEND LLM GATEWAY (EXACT PRODUCTION LOGIC)")
    print("=" * 60)
    print(f"Configured GEMINI_FLASH_MODEL: {os.getenv('GEMINI_FLASH_MODEL')}")
    print(f"Configured GEMINI_PRO_MODEL:   {os.getenv('GEMINI_PRO_MODEL')}")
    print(f"Gateway Default Flash Model:  {llm_gateway.default_flash_model}")
    print(f"Gateway Default Pro Model:    {llm_gateway.default_pro_model}")
    print(f"Gateway Available (Keys loaded): {llm_gateway.is_available()}")
    print("-" * 60)

    # Benchmark recommended models
    test_model_speed(llm_gateway.default_flash_model)
    test_model_speed("gemini-3.5-flash-lite")

    # 2. Test Call #2: Grounded Reasoning & Synthesis
    print("\n[Test 2] Executing AI Call #2 (Reasoning Synthesis)...")
    t0 = time.time()
    try:
        res2 = llm_gateway.execute(
            LLMTaskType.REASONING_SYNTHESIS,
            query="Ordinary Portland Cement 43 grade",
            candidate_standards=[
                {
                    "is_number": "IS 269:2015",
                    "title": "Ordinary Portland Cement — Specification",
                    "status": "ACTIVE",
                    "mandatory": True,
                    "qco_order": "Cement Quality Control Order 2024"
                }
            ],
            user_role="PROCUREMENT_OFFICER"
        )
        t1 = time.time()
        print(f"✓ AI Call #2 SUCCEEDED in {t1 - t0:.2f}s!")
        print(f"Result Preview: {json.dumps(res2, indent=2)[:300]}...")
    except Exception as e:
        print(f"❌ AI Call #2 FAILED: {e}")

    # 3. Test PDF Multimodal Direct Ingestion (Tender Upload)
    pdf_path = PROJECT_ROOT / "MOCK_GOVERNMENT_TENDER_NIT_2026.pdf"
    if pdf_path.exists():
        print("\n[Test 3] Executing Multimodal PDF Decomposition...")
        t0 = time.time()
        try:
            pdf_bytes = pdf_path.read_bytes()
            res3 = llm_gateway.generate_from_pdf(
                pdf_bytes=pdf_bytes,
                prompt="Extract all Indian Standards (IS codes) mentioned in this tender document."
            )
            t1 = time.time()
            print(f"✓ Multimodal PDF Decomposition SUCCEEDED in {t1 - t0:.2f}s!")
            print(f"Result Preview: {json.dumps(res3, indent=2)[:300]}...")
        except Exception as e:
            print(f"❌ Multimodal PDF Decomposition FAILED: {e}")

    print("\n" + "=" * 60)
    print("BACKEND LLM GATEWAY TEST FINISHED")
    print("=" * 60)

if __name__ == "__main__":
    test_backend_llm_calls()
