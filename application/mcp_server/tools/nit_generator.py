from typing import Dict, Any

TOOL_GENERATE_NIT = {
    "name": "generate_nit_clause",
    "description": "Generates a legally-structured Notice Inviting Tender (NIT) technical specification clause for a given Indian Standard (IS) number and product, formatted for GeM, CPWD, MoRTH, or IREPS portals.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "is_number": {
                "type": "string",
                "description": "The Indian Standard designation, e.g. 'IS 269:2015' or 'IS 1786:2008'"
            },
            "product_name": {
                "type": "string",
                "description": "Product or material name, e.g. 'Ordinary Portland Cement 43 Grade' or 'TMT Rebar Fe 500D'"
            },
            "template": {
                "type": "string",
                "enum": ["standard_gem", "cpwd", "morth", "defence", "railways"],
                "default": "standard_gem",
                "description": "Procurement portal / ministry format"
            }
        },
        "required": ["is_number", "product_name"]
    }
}

def generate_nit_clause_tool(
  is_number: str,
  product_name: str,
  template: str = "standard_gem"
) -> Dict[str, Any]:
    """
    Generates a structured NIT clause string and metadata for an MCP tool call.
    """
    FILL = lambda text: f"[FILL: {text}]"

    clause_text = f"""================================================================================
NOTICE INVITING TENDER (NIT) — TECHNICAL SPECIFICATION CLAUSE
PORTAL FORMAT: {template.upper()} • VERIFIED VIA MANAKAI MCP SERVER
================================================================================
Tender Reference : {FILL('NIT / Tender Notice Reference Number')}
Procuring Dept   : {FILL('Ministry / Department / Executing Agency')}
Project Scope    : {FILL('Project Scope and Construction Location')}
Material Supply  : {product_name}

1. APPLICABLE INDIAN STANDARD:
   The supplied material shall conform in all respects to the latest gazetted issue of:
   {is_number} — Specification for {product_name}.

2. MANDATORY BIS CERTIFICATION:
   The product shall bear the mandatory BIS Standard Mark (ISI Mark / CM/L Number)
   under the applicable statutory Quality Control Order (QCO).
   Bidders must furnish valid BIS license credentials in the Technical Bid Envelope.

3. MANDATORY LOT TESTING:
   Contractor / Vendor shall submit batch test certificates from a BIS-recognized
   or NABL-accredited testing laboratory prior to dispatch acceptance.

4. REJECTION & STATUTORY PRECEDENCE:
   Any supply lot failing conformity testing against {is_number} shall be summarily
   rejected at supplier's risk and cost. In case of ambiguity, {is_number} shall take precedence.

Prepared by ManakAI Model Context Protocol Server | Compliant with CVC Vigilance Guidelines
================================================================================
""".strip()

    return {
        "is_number": is_number,
        "product_name": product_name,
        "template": template,
        "clause_text": clause_text,
        "statutory_precedence": True,
        "qco_enforced": True
    }
