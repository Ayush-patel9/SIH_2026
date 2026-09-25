# 🧭 ManakAI Feature Blueprint & Implementation Index

## 🔒 Architectural Isolation & Key-and-Lock Principle
To ensure **zero merge conflicts** while your friend works on the data acquisition & pipeline in `pipeline/`, all application features are decoupled into pure interface contracts:
- **Pipeline** produces the **Key** (`StandardsResponse`, `QueryRequest`, `FeedbackRequest`, `AlertPayload`).
- **Application** provides the **Lock** (12 modular, independent feature engines).

---

## 📑 Feature Planning Documents (In-Depth Specifications)

| # | Feature Name | Planning Document | Core Capability |
|---|---|---|---|
| **01** | **Explainability vs. Black-Box** | [`01_explainability_vs_black_box.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/01_explainability_vs_black_box.md) | 4-Stage Reasoning Timeline, Confidence Bars, Knowledge Graph Subgraph Explorer |
| **02** | **Audit Trail & Legal Defensibility** | [`02_audit_trail_and_legal_defensibility.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/02_audit_trail_and_legal_defensibility.md) | Cryptographic SHA-256 Hash Verification, Printable RTI/CVC Defense Dossier |
| **03** | **Human-in-the-Loop Feedback** | [`03_human_in_the_loop_feedback.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/03_human_in_the_loop_feedback.md) | Flag Recommendation Modal, Moderation Review Queue, Lifecycle Trust Scoring |
| **04** | **Proactive Staleness Alerts** | [`04_proactive_staleness_alerts.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/04_proactive_staleness_alerts.md) | Real-time Supersession & Amendment Push Notification Center, Active Tender Impact Matrix |
| **05** | **Bhashini Multilingual NLP** | [`05_bhashini_multilingual.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/05_bhashini_multilingual.md) | MeitY Bhashini API Scheme Client, Technical Synonym Lexicon, Multi-Language UI |
| **06** | **Confidence & Coverage Dashboard** | [`06_confidence_and_coverage_dashboard.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/06_confidence_and_coverage_dashboard.md) | Executive HOD / Joint Secretary MIS Analytics, Division Donut Charts, Risk Metrics |
| **07** | **Dry-Run / Sandbox Mode** | [`07_dry_run_sandbox.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/07_dry_run_sandbox.md) | Live Pre-Submission Draft Specification Checker, Outdated Standard Warning Strip |
| **08** | **Role-Based Views** | [`08_role_based_views.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/08_role_based_views.md) | 1-Click Persona Lenses: Procurement Officer, Government Auditor, Bidding Vendor |
| **09** | **Standards as MCP Server** | [`09_standards_as_mcp_server.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/09_standards_as_mcp_server.md) | Standalone FastMCP Server exposing tools (`recommend_standards`, `check_qco`) for AI Agents |
| **10** | **Automated Tender Parser & PDF Highlighter** | [`10_automated_tender_parser_pdf_highlighter.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/10_automated_tender_parser_pdf_highlighter.md) | Split-screen Text/PDF Viewer with Red (Withdrawn), Yellow (Outdated), Green (Active) Highlights |
| **11** | **"Explain Like I'm New Here" (ELINH)** | [`11_explain_like_im_new_plain_language.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/11_explain_like_im_new_plain_language.md) | Plain-Language Explainer toggle translating dense engineering standards into simple English/Hindi |
| **12** | **GeM & CPPP Procurement Integration** | [`12_gem_cppp_procurement_integration.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/12_gem_cppp_procurement_integration.md) | Model Tender Clause Generator, GeM Golden Parameters Matrix, e-Procurement Stubs |
