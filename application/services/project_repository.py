import re
import json
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from application.services.db_config import get_connection, release_connection, get_cursor

logger = logging.getLogger("project_repository")

# Default Sample Tenders for Seeding Initial Projects
NHAI_SAMPLE_TENDER = """GOVERNMENT OF INDIA · NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)
TECHNICAL SPECIFICATION & BILL OF QUANTITIES (BOQ) FOR HIGHWAY CULVERTS & BRIDGES

Clause 4.1.2 — Cement Specifications for Structural Culvert Works:
All structural concrete elements, including precast culvert barrels, deck slabs, and retaining walls, shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.

Clause 4.1.3 — Coarse & Fine Aggregates for Concrete:
Aggregates shall conform to IS 383:2016 and be tested for soundness, crushing value, and alkali-aggregate reactivity.

Clause 5.2.1 — Reinforcement Steel Bars:
Reinforcement steel for structural columns, piers, and shear walls shall be High Yield Strength Deformed (HYSD) bars Grade Fe 415 conforming to IS 1786:1985.

Clause 7.3.2 — Fasteners & Structural Bolts:
High strength friction grip bolts for structural steel bracing shall conform to IS 3757:1985 with torque tightening inspection as per IRC 24.

Clause 12.4.0 — HDPE Water Drainage Pipes:
HDPE pipes for subsurface bridge drainage and culvert outfall channels shall be manufactured as per IS 4984:1995 with PE-80 raw material."""

CPWD_SAMPLE_TENDER = """CENTRAL PUBLIC WORKS DEPARTMENT (CPWD) · GOVERNMENT OF INDIA
ELECTRIFICATION & STRUCTURAL SPECIFICATIONS FOR MEDICAL WINGS

Clause 3.2.1 — Electrical Wiring Cables:
Single core PVC insulated copper conductor cables for internal power distribution and lighting circuits shall conform strictly to IS 694:2010.

Clause 3.4.0 — Distribution Switchboards & Circuit Breakers:
Low-voltage switchgear and controlgear assemblies for hospital ICU isolation panels shall comply with IS/IEC 61439-2:2011 with Form 4b separation.

Clause 6.1.1 — Structural Steel Tubular Sections:
Hollow steel sections for roof canopies and oxygen manifold shelter frames shall conform to IS 4923:2017 Grade YSt 310."""

JJM_SAMPLE_TENDER = """MINISTRY OF JAL SHAKTI · DEPARTMENT OF DRINKING WATER & SANITATION
NATIONAL JAL JEEVAN MISSION (JJM) · RURAL WATER SUPPLY SCHEME

Clause 8.1.0 — Centrifugally Cast (Ductile) Iron Pipes:
Ductile iron pressure pipes for water mains and distribution networks shall conform strictly to IS 8329:2000 Class K9 with cement mortar lining.

Clause 12.4.1 — Potable Drinking Water Testing Parameters:
Treated water delivered at household tap connections shall adhere strictly to Indian Standard Specification for Drinking Water IS 10500:2012 without deviation."""

_LOCAL_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "proj-nhai-088",
        "nitNumber": "NIT-NHAI-NCR-2026-088",
        "title": "Construction of 6-Lane Flyover & Bridge Superstructure on NH-48",
        "department": "National Highways Authority of India (NHAI)",
        "estimatedValue": "₹148.50 Crores",
        "status": "NEEDS_REVIEW",
        "complianceScore": 78,
        "hasDocument": True,
        "lastModified": "Just now",
        "recencyTimestamp": int(datetime.now().timestamp() * 1000),
        "tenderId": "tnd-proj-nhai-088",
        "pdfFileName": "MOCK_GOVERNMENT_TENDER_NIT_2026.pdf",
        "pdfUrl": "https://res.cloudinary.com/dwnigoa4b/image/upload/v1774735593/tenders/tender_0126786a3456.pdf",
        "documentText": NHAI_SAMPLE_TENDER,
        "isFrozen": True,
        "isAnalyzed": True,
        "analysisPhase": "DASHBOARD_COMPLETED",
        "stage1Data": None,
        "stage2Data": None,
        "stage3Data": None,
    },
    {
        "id": "proj-cpwd-042",
        "nitNumber": "NIT-CPWD-AIIMS-2026-042",
        "title": "Modernization & Electrification of Surgical Wing, AIIMS Delhi",
        "department": "Central Public Works Department (CPWD)",
        "estimatedValue": "₹42.80 Crores",
        "status": "COMPLIANT",
        "complianceScore": 100,
        "hasDocument": True,
        "lastModified": "Just now",
        "recencyTimestamp": int(datetime.now().timestamp() * 1000) - 100000,
        "tenderId": "tnd-proj-cpwd-042",
        "pdfFileName": "CPWD_SURGICAL_SPEC_2026.pdf",
        "pdfUrl": None,
        "documentText": CPWD_SAMPLE_TENDER,
        "isFrozen": True,
        "isAnalyzed": True,
        "analysisPhase": "DASHBOARD_COMPLETED",
        "stage1Data": None,
        "stage2Data": None,
        "stage3Data": None,
    },
    {
        "id": "proj-jjm-019",
        "nitNumber": "NIT-JJM-RAJ-2026-019",
        "title": "Rural Potable Water Grid Infrastructure & Treatment Facility Phase-II",
        "department": "Ministry of Jal Shakti (JJM)",
        "estimatedValue": "₹95.20 Crores",
        "status": "DRAFT",
        "complianceScore": 0,
        "hasDocument": False,
        "lastModified": "Just now",
        "recencyTimestamp": int(datetime.now().timestamp() * 1000) - 200000,
        "tenderId": None,
        "pdfFileName": None,
        "pdfUrl": None,
        "documentText": None,
        "isFrozen": False,
        "isAnalyzed": False,
        "analysisPhase": "IDLE",
        "stage1Data": None,
        "stage2Data": None,
        "stage3Data": None,
    },
    {
        "id": "proj-dfccil-119",
        "nitNumber": "NIT-MOR-DFCCIL-2026-119",
        "title": "Dedicated Freight Corridor Track Laying & Pre-Stressed Concrete Sleepers",
        "department": "Ministry of Railways (DFCCIL)",
        "estimatedValue": "₹310.00 Crores",
        "status": "NEEDS_REVIEW",
        "complianceScore": 84,
        "hasDocument": True,
        "lastModified": "Just now",
        "recencyTimestamp": int(datetime.now().timestamp() * 1000) - 300000,
        "tenderId": "tnd-proj-dfccil-119",
        "pdfFileName": "DFCCIL_TRACK_SPEC_2026.pdf",
        "pdfUrl": None,
        "documentText": NHAI_SAMPLE_TENDER,
        "isFrozen": True,
        "isAnalyzed": True,
        "analysisPhase": "DASHBOARD_COMPLETED",
        "stage1Data": None,
        "stage2Data": None,
        "stage3Data": None,
    }
]

_LOCAL_CHAT_MESSAGES: Dict[str, List[Dict[str, Any]]] = {}

def init_db():
    """Create all required tables and indexes in Neon PostgreSQL."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            logger.info("Database connection not configured. Running with local storage.")
            return
        cur = get_cursor(conn, dict_cursor=False)

        # 1. Projects Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id VARCHAR(64) PRIMARY KEY,
                nit_number VARCHAR(128) NOT NULL UNIQUE,
                title TEXT NOT NULL,
                department VARCHAR(255) NOT NULL,
                estimated_value VARCHAR(64) DEFAULT 'TBD',
                status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
                compliance_score INTEGER DEFAULT 0,
                has_document BOOLEAN DEFAULT FALSE,
                created_by VARCHAR(128) DEFAULT 'OFFICER',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_projects_nit_number ON projects(nit_number);
            CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
            CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
        """)

        # 2. Tenders Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tenders (
                id VARCHAR(64) PRIMARY KEY,
                project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                cloudinary_url TEXT,
                cloudinary_public_id VARCHAR(255),
                raw_document_text TEXT,
                file_bytes BIGINT DEFAULT 0,
                file_format VARCHAR(16) DEFAULT 'pdf',
                is_frozen BOOLEAN DEFAULT TRUE,
                version INTEGER DEFAULT 1,
                uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_tenders_project_id ON tenders(project_id);
        """)

        # 3. Tender Analyses Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tender_analyses (
                id VARCHAR(64) PRIMARY KEY,
                project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                tender_id VARCHAR(64) NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
                phase VARCHAR(32) NOT NULL DEFAULT 'IDLE',
                stage1_result JSONB,
                stage2_result JSONB,
                stage3_result JSONB,
                current_step_text TEXT,
                error_message TEXT,
                started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_analyses_project_tender ON tender_analyses(project_id, tender_id);
        """)

        # 4. Tender Chat Messages Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tender_chat_messages (
                id VARCHAR(64) PRIMARY KEY,
                project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                tender_id VARCHAR(64) NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
                sender VARCHAR(16) NOT NULL,
                message_text TEXT NOT NULL,
                context_citations JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_chat_project_tender ON tender_chat_messages(project_id, tender_id, created_at ASC);
        """)

        # 5. Officer Audit Trail Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS officer_audit_trail (
                id SERIAL PRIMARY KEY,
                project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                action_type VARCHAR(64) NOT NULL,
                product_id VARCHAR(64),
                target_standard VARCHAR(64),
                justification TEXT,
                officer_id VARCHAR(128) DEFAULT 'OFFICER_01',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_audit_project ON officer_audit_trail(project_id);
        """)

        # 6. Approved & Saved Standards Dossiers Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS saved_standards_dossiers (
                id VARCHAR(64) PRIMARY KEY,
                is_number VARCHAR(64) NOT NULL,
                title TEXT NOT NULL,
                search_query TEXT,
                response_data JSONB NOT NULL,
                approved_by VARCHAR(128) DEFAULT 'Technical Officer / Bureau Authority',
                approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_saved_standards_is_num ON saved_standards_dossiers(is_number);
            CREATE INDEX IF NOT EXISTS idx_saved_standards_query ON saved_standards_dossiers(search_query);
        """)

        conn.commit()
        logger.info("✓ Neon PostgreSQL tables and indexes verified successfully.")
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"✗ Database initialization error on Neon: {e}")
        raise
    finally:
        release_connection(conn)

def seed_initial_projects_if_empty():
    """Seed initial showcase projects if the projects table is currently empty."""
    conn = None
    try:
        conn = get_connection()
        cur = get_cursor(conn)
        cur.execute("SELECT COUNT(*) as count FROM projects")
        row = cur.fetchone()
        count = row["count"] if row else 0

        if count == 0:
            logger.info("Projects table is empty. Seeding initial showcase procurement projects into Neon...")

            seed_data = [
                {
                    "id": "proj-nhai-088",
                    "nit_number": "NIT-NHAI-NCR-2026-088",
                    "title": "Construction of 6-Lane Flyover & Bridge Superstructure on NH-48",
                    "department": "National Highways Authority of India (NHAI)",
                    "estimated_value": "₹148.50 Crores",
                    "status": "NEEDS_REVIEW",
                    "compliance_score": 78,
                    "has_document": True,
                    "document_text": NHAI_SAMPLE_TENDER,
                    "filename": "MOCK_GOVERNMENT_TENDER_NIT_2026.pdf",
                    "cloudinary_url": "https://res.cloudinary.com/dwnigoa4b/image/upload/v1774735593/tenders/tender_0126786a3456.pdf"
                },
                {
                    "id": "proj-cpwd-042",
                    "nit_number": "NIT-CPWD-AIIMS-2026-042",
                    "title": "Modernization & Electrification of Surgical Wing, AIIMS Delhi",
                    "department": "Central Public Works Department (CPWD)",
                    "estimated_value": "₹42.80 Crores",
                    "status": "COMPLIANT",
                    "compliance_score": 100,
                    "has_document": True,
                    "document_text": CPWD_SAMPLE_TENDER,
                    "filename": "CPWD_SURGICAL_SPEC_2026.pdf",
                    "cloudinary_url": None
                },
                {
                    "id": "proj-jjm-019",
                    "nit_number": "NIT-JJM-RAJ-2026-019",
                    "title": "Rural Potable Water Grid Infrastructure & Treatment Facility Phase-II",
                    "department": "Ministry of Jal Shakti (JJM)",
                    "estimated_value": "₹95.20 Crores",
                    "status": "DRAFT",
                    "compliance_score": 0,
                    "has_document": False,
                    "document_text": None,
                    "filename": None,
                    "cloudinary_url": None
                },
                {
                    "id": "proj-dfccil-119",
                    "nit_number": "NIT-MOR-DFCCIL-2026-119",
                    "title": "Dedicated Freight Corridor Track Laying & Pre-Stressed Concrete Sleepers",
                    "department": "Ministry of Railways (DFCCIL)",
                    "estimated_value": "₹310.00 Crores",
                    "status": "NEEDS_REVIEW",
                    "compliance_score": 84,
                    "has_document": True,
                    "document_text": NHAI_SAMPLE_TENDER,
                    "filename": "DFCCIL_TRACK_SPEC_2026.pdf",
                    "cloudinary_url": None
                }
            ]

            for item in seed_data:
                # Insert project
                cur.execute("""
                    INSERT INTO projects (id, nit_number, title, department, estimated_value, status, compliance_score, has_document)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    item["id"], item["nit_number"], item["title"], item["department"],
                    item["estimated_value"], item["status"], item["compliance_score"], item["has_document"]
                ))

                # Insert tender if document present
                if item["has_document"] and item["document_text"]:
                    tender_id = f"tnd-{item['id']}"
                    cur.execute("""
                        INSERT INTO tenders (id, project_id, filename, cloudinary_url, raw_document_text, is_frozen)
                        VALUES (%s, %s, %s, %s, %s, TRUE)
                        ON CONFLICT (id) DO NOTHING
                    """, (
                        tender_id, item["id"], item["filename"] or "TENDER_SPEC.pdf",
                        item["cloudinary_url"], item["document_text"]
                    ))

            conn.commit()
            logger.info("✓ Initial showcase procurement projects successfully seeded into Neon PostgreSQL.")
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error seeding projects in Neon: {e}")
    finally:
        release_connection(conn)

# ============================================================================
# Projects CRUD Operations
# ============================================================================

def list_projects() -> List[Dict[str, Any]]:
    """Fetch all projects from Neon PostgreSQL with tender metadata."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return list(_LOCAL_PROJECTS)
        cur = get_cursor(conn)
        cur.execute("""
            SELECT 
                p.id,
                p.nit_number as "nitNumber",
                p.title,
                p.department,
                p.estimated_value as "estimatedValue",
                p.status,
                p.compliance_score as "complianceScore",
                p.has_document as "hasDocument",
                p.created_at as "createdAt",
                p.updated_at as "updatedAt",
                t.id as "tenderId",
                t.filename as "pdfFileName",
                t.cloudinary_url as "pdfUrl",
                t.raw_document_text as "documentText",
                t.is_frozen as "isFrozen",
                a.phase as "analysisPhase",
                a.stage1_result as "stage1Result",
                a.stage2_result as "stage2Result",
                a.stage3_result as "stage3Result"
            FROM projects p
            LEFT JOIN tenders t ON t.project_id = p.id
            LEFT JOIN tender_analyses a ON a.project_id = p.id
            ORDER BY p.updated_at DESC
        """)
        rows = cur.fetchall()
        
        results = []
        for r in rows:
            # Format recency timestamp
            updated_ts = r["updatedAt"].timestamp() if r["updatedAt"] else datetime.now().timestamp()
            results.append({
                "id": r["id"],
                "nitNumber": r["nitNumber"],
                "title": r["title"],
                "department": r["department"],
                "estimatedValue": r["estimatedValue"],
                "status": r["status"],
                "complianceScore": r["complianceScore"] or 0,
                "hasDocument": bool(r["hasDocument"]),
                "lastModified": "Just now",
                "recencyTimestamp": int(updated_ts * 1000),
                "pdfFileName": r["pdfFileName"],
                "pdfUrl": r["pdfUrl"],
                "documentText": r["documentText"],
                "isFrozen": r["isFrozen"] if r["isFrozen"] is not None else True,
                "isAnalyzed": r["analysisPhase"] == "DASHBOARD_COMPLETED",
                "analysisPhase": r["analysisPhase"] or "IDLE",
                "stage1Data": r["stage1Result"],
                "stage2Data": r["stage2Result"],
                "stage3Data": r["stage3Result"],
            })
        return results
    except Exception as e:
        logger.error(f"Error listing projects: {e}")
        return []
    finally:
        release_connection(conn)

def get_project(project_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single project with its tender dossier and full 3-stage analysis."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return next((p for p in _LOCAL_PROJECTS if p["id"] == project_id), None)
        cur = get_cursor(conn)
        cur.execute("""
            SELECT 
                p.id,
                p.nit_number as "nitNumber",
                p.title,
                p.department,
                p.estimated_value as "estimatedValue",
                p.status,
                p.compliance_score as "complianceScore",
                p.has_document as "hasDocument",
                p.created_at as "createdAt",
                p.updated_at as "updatedAt",
                t.id as "tenderId",
                t.filename as "pdfFileName",
                t.cloudinary_url as "pdfUrl",
                t.cloudinary_public_id as "cloudinaryPublicId",
                t.raw_document_text as "documentText",
                t.is_frozen as "isFrozen",
                a.id as "analysisId",
                a.phase as "analysisPhase",
                a.stage1_result as "stage1Result",
                a.stage2_result as "stage2Result",
                a.stage3_result as "stage3Result",
                a.current_step_text as "currentStepText"
            FROM projects p
            LEFT JOIN tenders t ON t.project_id = p.id
            LEFT JOIN tender_analyses a ON a.project_id = p.id
            WHERE p.id = %s
        """, (project_id,))
        row = cur.fetchone()
        if not row:
            return None

        updated_ts = row["updatedAt"].timestamp() if row["updatedAt"] else datetime.now().timestamp()
        return {
            "id": row["id"],
            "nitNumber": row["nitNumber"],
            "title": row["title"],
            "department": row["department"],
            "estimatedValue": row["estimatedValue"],
            "status": row["status"],
            "complianceScore": row["complianceScore"] or 0,
            "hasDocument": bool(row["hasDocument"]),
            "lastModified": "Just now",
            "recencyTimestamp": int(updated_ts * 1000),
            "tenderId": row["tenderId"],
            "pdfFileName": row["pdfFileName"],
            "pdfUrl": row["pdfUrl"],
            "documentText": row["documentText"],
            "isFrozen": row["isFrozen"] if row["isFrozen"] is not None else True,
            "isAnalyzed": row["analysisPhase"] == "DASHBOARD_COMPLETED",
            "analysisPhase": row["analysisPhase"] or "IDLE",
            "stage1Data": row["stage1Result"],
            "stage2Data": row["stage2Result"],
            "stage3Data": row["stage3Result"],
        }
    except Exception as e:
        logger.error(f"Error fetching project {project_id}: {e}")
        return None
    finally:
        release_connection(conn)

def create_project(title: str, nit_number: str, department: str, estimated_value: str = "TBD") -> Dict[str, Any]:
    """Create a new procurement project in Neon PostgreSQL."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            project_id = f"proj-{uuid.uuid4().hex[:8]}"
            new_p = {
                "id": project_id,
                "nitNumber": nit_number.strip().upper(),
                "title": title.strip(),
                "department": department.strip(),
                "estimatedValue": estimated_value.strip() or "TBD",
                "status": "DRAFT",
                "complianceScore": 0,
                "hasDocument": False,
                "lastModified": "Just now",
                "recencyTimestamp": int(datetime.now().timestamp() * 1000),
                "tenderId": None,
                "pdfFileName": None,
                "pdfUrl": None,
                "documentText": None,
                "isFrozen": False,
                "isAnalyzed": False,
                "analysisPhase": "IDLE",
                "stage1Data": None,
                "stage2Data": None,
                "stage3Data": None,
            }
            _LOCAL_PROJECTS.insert(0, new_p)
            return new_p
        cur = get_cursor(conn)
        project_id = f"proj-{uuid.uuid4().hex[:12]}"
        
        cur.execute("""
            INSERT INTO projects (id, nit_number, title, department, estimated_value, status, compliance_score, has_document)
            VALUES (%s, %s, %s, %s, %s, 'DRAFT', 0, FALSE)
            RETURNING id, nit_number as "nitNumber", title, department, estimated_value as "estimatedValue", status, compliance_score as "complianceScore", has_document as "hasDocument", created_at as "createdAt"
        """, (project_id, nit_number.strip().upper(), title.strip(), department.strip(), estimated_value.strip() or "TBD"))
        
        row = cur.fetchone()
        conn.commit()
        return dict(row)
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error creating project: {e}")
        raise
    finally:
        release_connection(conn)

def delete_project(project_id: str) -> bool:
    """Delete a procurement project and all its associated tenders, analyses, and chats."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            initial_len = len(_LOCAL_PROJECTS)
            _LOCAL_PROJECTS[:] = [p for p in _LOCAL_PROJECTS if p["id"] != project_id]
            if project_id in _LOCAL_CHAT_MESSAGES:
                del _LOCAL_CHAT_MESSAGES[project_id]
            return len(_LOCAL_PROJECTS) < initial_len
        cur = get_cursor(conn)
        cur.execute("DELETE FROM projects WHERE id = %s RETURNING id", (project_id,))
        deleted = cur.fetchone()
        conn.commit()
        # Also clean up local cache if present
        _LOCAL_PROJECTS[:] = [p for p in _LOCAL_PROJECTS if p["id"] != project_id]
        if project_id in _LOCAL_CHAT_MESSAGES:
            del _LOCAL_CHAT_MESSAGES[project_id]
        return bool(deleted)
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error deleting project {project_id}: {e}")
        raise
    finally:
        release_connection(conn)

def ingest_tender_document(project_id: str, document_text: str, filename: str, cloudinary_url: Optional[str] = None, cloudinary_public_id: Optional[str] = None) -> Dict[str, Any]:
    """Attach and freeze a tender document for a project."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            for p in _LOCAL_PROJECTS:
                if p["id"] == project_id:
                    p["hasDocument"] = True
                    p["status"] = "NEEDS_REVIEW"
                    p["documentText"] = document_text
                    p["pdfFileName"] = filename
                    p["pdfUrl"] = cloudinary_url
                    p["isFrozen"] = True
                    return {
                        "project_id": project_id,
                        "tender_id": f"tnd-{project_id}",
                        "filename": filename,
                        "cloudinary_url": cloudinary_url,
                        "is_frozen": True
                    }
            return {"project_id": project_id, "error": "Project not found"}
        cur = get_cursor(conn)

        # Check existing tender
        cur.execute("SELECT id FROM tenders WHERE project_id = %s", (project_id,))
        existing = cur.fetchone()
        
        tender_id = existing["id"] if existing else f"tnd-{uuid.uuid4().hex[:12]}"
        
        if existing:
            cur.execute("""
                UPDATE tenders 
                SET filename = %s, cloudinary_url = %s, cloudinary_public_id = %s, raw_document_text = %s, is_frozen = TRUE, uploaded_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (filename, cloudinary_url, cloudinary_public_id, document_text, tender_id))
        else:
            cur.execute("""
                INSERT INTO tenders (id, project_id, filename, cloudinary_url, cloudinary_public_id, raw_document_text, is_frozen)
                VALUES (%s, %s, %s, %s, %s, %s, TRUE)
            """, (tender_id, project_id, filename, cloudinary_url, cloudinary_public_id, document_text))

        # Update project status
        cur.execute("""
            UPDATE projects 
            SET has_document = TRUE, status = 'NEEDS_REVIEW', updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (project_id,))

        conn.commit()
        return {
            "project_id": project_id,
            "tender_id": tender_id,
            "filename": filename,
            "cloudinary_url": cloudinary_url,
            "is_frozen": True
        }
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error ingesting document for project {project_id}: {e}")
        raise
    finally:
        release_connection(conn)

def save_pipeline_analysis(
    project_id: str,
    phase: str,
    stage1_result: Optional[Dict[str, Any]] = None,
    stage2_result: Optional[Dict[str, Any]] = None,
    stage3_result: Optional[Dict[str, Any]] = None,
    current_step_text: Optional[str] = None,
    error_message: Optional[str] = None
) -> None:
    """Save 3-stage pipeline state & outputs directly to Neon PostgreSQL."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            for p in _LOCAL_PROJECTS:
                if p["id"] == project_id:
                    p["analysisPhase"] = phase
                    if stage1_result: p["stage1Data"] = stage1_result
                    if stage2_result: p["stage2Data"] = stage2_result
                    if stage3_result: p["stage3Data"] = stage3_result
                    if phase == "DASHBOARD_COMPLETED":
                        p["status"] = "COMPLIANT"
                        p["complianceScore"] = 92
                        p["isAnalyzed"] = True
            return
        cur = get_cursor(conn)

        # Get tender_id
        cur.execute("SELECT id FROM tenders WHERE project_id = %s", (project_id,))
        tender_row = cur.fetchone()
        if not tender_row:
            # Create a placeholder tender if not already created
            tender_id = f"tnd-{uuid.uuid4().hex[:12]}"
            cur.execute("INSERT INTO tenders (id, project_id, filename, raw_document_text) VALUES (%s, %s, %s, %s)",
                        (tender_id, project_id, "ANALYZED_DOSSIER.pdf", ""))
        else:
            tender_id = tender_row["id"]

        analysis_id = f"ana-{project_id}"

        cur.execute("""
            INSERT INTO tender_analyses (
                id, project_id, tender_id, phase, stage1_result, stage2_result, stage3_result, current_step_text, error_message, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP
            )
            ON CONFLICT (project_id, tender_id) DO UPDATE SET
                phase = EXCLUDED.phase,
                stage1_result = COALESCE(EXCLUDED.stage1_result, tender_analyses.stage1_result),
                stage2_result = COALESCE(EXCLUDED.stage2_result, tender_analyses.stage2_result),
                stage3_result = COALESCE(EXCLUDED.stage3_result, tender_analyses.stage3_result),
                current_step_text = EXCLUDED.current_step_text,
                error_message = EXCLUDED.error_message,
                completed_at = CASE WHEN EXCLUDED.phase = 'DASHBOARD_COMPLETED' THEN CURRENT_TIMESTAMP ELSE tender_analyses.completed_at END,
                updated_at = CURRENT_TIMESTAMP
        """, (
            analysis_id, project_id, tender_id, phase,
            json.dumps(stage1_result) if stage1_result else None,
            json.dumps(stage2_result) if stage2_result else None,
            json.dumps(stage3_result) if stage3_result else None,
            current_step_text, error_message
        ))

        # Update project status and compliance score
        if phase == "DASHBOARD_COMPLETED":
            score = 100
            if stage3_result and isinstance(stage3_result, dict):
                score = stage3_result.get("summary", {}).get("final_compliance_score", 100)
            cur.execute("""
                UPDATE projects 
                SET status = 'COMPLIANT', compliance_score = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (score, project_id))
        elif phase == "STAGE2_SELECTION":
            cur.execute("""
                UPDATE projects 
                SET status = 'NEEDS_REVIEW', updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (project_id,))
        elif phase == "STAGE1_DECOMPOSING":
            cur.execute("""
                UPDATE projects 
                SET status = 'ANALYZING', updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (project_id,))

        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error saving pipeline analysis for project {project_id}: {e}")
    finally:
        release_connection(conn)

def save_chat_message(project_id: str, sender: str, text: str, citations: Optional[List[Dict[str, Any]]] = None) -> None:
    """Persist a tender chatbot message into Neon PostgreSQL."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            if project_id not in _LOCAL_CHAT_MESSAGES:
                _LOCAL_CHAT_MESSAGES[project_id] = []
            _LOCAL_CHAT_MESSAGES[project_id].append({
                "id": f"msg-{uuid.uuid4().hex[:8]}",
                "sender": sender,
                "text": text,
                "timestamp": datetime.now().strftime("%I:%M %p"),
                "citations": citations or []
            })
            return
        cur = get_cursor(conn)
        
        cur.execute("SELECT id FROM tenders WHERE project_id = %s", (project_id,))
        t = cur.fetchone()
        tender_id = t["id"] if t else "tnd-default"

        msg_id = f"msg-{uuid.uuid4().hex[:12]}"
        cur.execute("""
            INSERT INTO tender_chat_messages (id, project_id, tender_id, sender, message_text, context_citations)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (msg_id, project_id, tender_id, sender, text, json.dumps(citations or [])))
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error saving chat message for project {project_id}: {e}")
    finally:
        release_connection(conn)

def get_chat_history(project_id: str) -> List[Dict[str, Any]]:
    """Retrieve chat history for a project."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return list(_LOCAL_CHAT_MESSAGES.get(project_id, []))
        cur = get_cursor(conn)
        cur.execute("""
            SELECT id, sender, message_text as "text", context_citations as "citations", created_at as "timestamp"
            FROM tender_chat_messages
            WHERE project_id = %s
            ORDER BY created_at ASC
        """, (project_id,))
        rows = cur.fetchall()
        results = []
        for r in rows:
            results.append({
                "id": r["id"],
                "sender": r["sender"],
                "text": r["text"],
                "timestamp": r["timestamp"].strftime("%I:%M %p") if r["timestamp"] else ""
            })
        return results
    except Exception as e:
        logger.error(f"Error fetching chat history for project {project_id}: {e}")
        return []
    finally:
        release_connection(conn)

# -------------------------------------------------------------------------
# SAVED & APPROVED STANDARDS DOSSIERS (Standards Explorer Persistence)
# -------------------------------------------------------------------------
_LOCAL_SAVED_STANDARDS: Dict[str, Dict[str, Any]] = {}

def save_approved_standard(standard_data: Dict[str, Any], search_query: str = "", approved_by: str = "Technical Officer") -> Dict[str, Any]:
    """
    Saves and permanently approves a standard dossier in the database.
    Stores all aspects: primary recommendation, alternatives comparison, allied standards,
    NIT specifications, audit records, and knowledge graph paths.
    """
    is_num = standard_data.get("primary_recommendation", {}).get("is_number") or standard_data.get("is_number") or "IS Standard"
    title = standard_data.get("primary_recommendation", {}).get("title") or standard_data.get("title") or is_num
    
    clean_id_suffix = re.sub(r'[^a-zA-Z0-9]', '', is_num).lower()
    record_id = f"std-{clean_id_suffix}" if clean_id_suffix else f"std-{uuid.uuid4().hex[:10]}"
    timestamp = datetime.now().isoformat()

    # Tag meta with approved_in_db
    if isinstance(standard_data, dict):
        if "meta" not in standard_data or not isinstance(standard_data["meta"], dict):
            standard_data["meta"] = {}
        standard_data["meta"]["approved_in_db"] = True
        standard_data["meta"]["approved_by"] = approved_by
        standard_data["meta"]["approved_at"] = timestamp

    saved_payload = {
        "id": record_id,
        "is_number": is_num,
        "title": title,
        "search_query": search_query or is_num,
        "response_data": standard_data,
        "approved_by": approved_by,
        "approved_at": timestamp,
        "is_approved": True,
    }

    # Fast in-memory caching
    _LOCAL_SAVED_STANDARDS[is_num.upper().strip()] = saved_payload
    _LOCAL_SAVED_STANDARDS[is_num.lower().strip()] = saved_payload
    _LOCAL_SAVED_STANDARDS[clean_id_suffix] = saved_payload
    _LOCAL_SAVED_STANDARDS[title.lower().strip()] = saved_payload
    if search_query:
        _LOCAL_SAVED_STANDARDS[search_query.lower().strip()] = saved_payload

    # Neon PostgreSQL persistence
    conn = None
    try:
        conn = get_connection()
        if conn:
            cur = get_cursor(conn)
            cur.execute("""
                INSERT INTO saved_standards_dossiers (id, is_number, title, search_query, response_data, approved_by, approved_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    search_query = EXCLUDED.search_query,
                    response_data = EXCLUDED.response_data,
                    approved_by = EXCLUDED.approved_by,
                    approved_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP;
            """, (record_id, is_num, title, search_query, json.dumps(standard_data), approved_by, timestamp))
            conn.commit()
            logger.info(f"✓ Saved and permanently approved standard {is_num} in PostgreSQL database.")
    except Exception as e:
        if conn:
            conn.rollback()
        logger.warning(f"Failed to commit saved standard {is_num} to PostgreSQL, using memory: {e}")
    finally:
        release_connection(conn)

    return saved_payload

def get_saved_approved_standard(query_or_is: str) -> Optional[Dict[str, Any]]:
    """
    Checks if a standard dossier has been approved and saved in the database.
    Performs multi-strategy lookup:
    1. Exact standard number or query in-memory
    2. SQL full-text, ILIKE, and substring pattern matching on IS Number, Title, and Search Query
    3. Extracted standard number lookup (e.g. '269' matches 'IS 269:2015')
    4. Keyword token intersection against stored standards
    """
    if not query_or_is:
        return None
    
    clean_key = query_or_is.strip()
    clean_key_lower = clean_key.lower()
    clean_key_upper = clean_key.upper()
    
    # 1. Fast in-memory check
    if clean_key_upper in _LOCAL_SAVED_STANDARDS:
        return _LOCAL_SAVED_STANDARDS[clean_key_upper]
    if clean_key_lower in _LOCAL_SAVED_STANDARDS:
        return _LOCAL_SAVED_STANDARDS[clean_key_lower]

    clean_alphanumeric = re.sub(r'[^a-zA-Z0-9]', '', clean_key_lower)
    if clean_alphanumeric and clean_alphanumeric in _LOCAL_SAVED_STANDARDS:
        return _LOCAL_SAVED_STANDARDS[clean_alphanumeric]

    # Check for IS number in query e.g. "IS 269", "IS-269", "269"
    is_matches = re.findall(r'(?:IS\s*)?(\d{3,5})', clean_key, re.IGNORECASE)

    # 2. Check Neon PostgreSQL
    conn = None
    try:
        conn = get_connection()
        if conn:
            cur = get_cursor(conn)
            # Strategy A: Direct matches (IS number, title, or search query)
            cur.execute("""
                SELECT id, is_number, title, search_query, response_data, approved_by, approved_at
                FROM saved_standards_dossiers
                WHERE UPPER(is_number) = UPPER(%s)
                   OR LOWER(search_query) = LOWER(%s)
                   OR LOWER(title) = LOWER(%s)
                   OR %s ILIKE '%%' || is_number || '%%'
                   OR %s ILIKE '%%' || title || '%%'
                   OR is_number ILIKE %s
                   OR title ILIKE %s
                   OR search_query ILIKE %s
                ORDER BY approved_at DESC
                LIMIT 1
            """, (clean_key, clean_key, clean_key, clean_key, clean_key, f"%{clean_key}%", f"%{clean_key}%", f"%{clean_key}%"))
            row = cur.fetchone()
            if row:
                resp = row["response_data"]
                if isinstance(resp, str):
                    resp = json.loads(resp)
                result = {
                    "id": row["id"],
                    "is_number": row["is_number"],
                    "title": row["title"],
                    "search_query": row["search_query"],
                    "response_data": resp,
                    "approved_by": row["approved_by"],
                    "approved_at": str(row["approved_at"]),
                    "is_approved": True,
                }
                _LOCAL_SAVED_STANDARDS[clean_key_upper] = result
                _LOCAL_SAVED_STANDARDS[clean_key_lower] = result
                return result

            # Strategy B: If standard number digits like 269, 1786, 4984 were detected
            for num in is_matches:
                cur.execute("""
                    SELECT id, is_number, title, search_query, response_data, approved_by, approved_at
                    FROM saved_standards_dossiers
                    WHERE is_number ILIKE %s
                    ORDER BY approved_at DESC
                    LIMIT 1
                """, (f"%{num}%",))
                row = cur.fetchone()
                if row:
                    resp = row["response_data"]
                    if isinstance(resp, str):
                        resp = json.loads(resp)
                    result = {
                        "id": row["id"],
                        "is_number": row["is_number"],
                        "title": row["title"],
                        "search_query": row["search_query"],
                        "response_data": resp,
                        "approved_by": row["approved_by"],
                        "approved_at": str(row["approved_at"]),
                        "is_approved": True,
                    }
                    _LOCAL_SAVED_STANDARDS[clean_key_upper] = result
                    return result

            # Strategy C: Token / Word intersection against all saved standards
            stop_words = {'for', 'and', 'the', 'with', 'standard', 'specification', 'supply', 'procurement', 'material', 'item', 'grade'}
            query_tokens = set(w for w in re.split(r'\W+', clean_key_lower) if len(w) >= 3 and w not in stop_words)
            if query_tokens:
                cur.execute("""
                    SELECT id, is_number, title, search_query, response_data, approved_by, approved_at
                    FROM saved_standards_dossiers
                    ORDER BY approved_at DESC
                """)
                all_saved = cur.fetchall()
                for r in all_saved:
                    target_text = f"{r['is_number']} {r['title']} {r['search_query']}".lower()
                    target_tokens = set(re.split(r'\W+', target_text))
                    if query_tokens.intersection(target_tokens):
                        resp = r["response_data"]
                        if isinstance(resp, str):
                            resp = json.loads(resp)
                        result = {
                            "id": r["id"],
                            "is_number": r["is_number"],
                            "title": r["title"],
                            "search_query": r["search_query"],
                            "response_data": resp,
                            "approved_by": r["approved_by"],
                            "approved_at": str(r["approved_at"]),
                            "is_approved": True,
                        }
                        _LOCAL_SAVED_STANDARDS[clean_key_upper] = result
                        return result

    except Exception as e:
        logger.warning(f"Error querying saved standards from database: {e}")
    finally:
        release_connection(conn)

    return None

def list_saved_approved_standards() -> List[Dict[str, Any]]:
    """
    Lists all approved standards dossiers saved in the database.
    """
    conn = None
    try:
        conn = get_connection()
        if conn:
            cur = get_cursor(conn)
            cur.execute("""
                SELECT id, is_number, title, search_query, response_data, approved_by, approved_at
                FROM saved_standards_dossiers
                ORDER BY approved_at DESC
            """)
            rows = cur.fetchall()
            results = []
            for r in rows:
                resp = r["response_data"]
                if isinstance(resp, str):
                    resp = json.loads(resp)
                results.append({
                    "id": r["id"],
                    "is_number": r["is_number"],
                    "title": r["title"],
                    "search_query": r["search_query"],
                    "response_data": resp,
                    "approved_by": r["approved_by"],
                    "approved_at": str(r["approved_at"]),
                    "is_approved": True,
                })
            return results
    except Exception as e:
        logger.warning(f"Error fetching saved standards list from database: {e}")
    finally:
        release_connection(conn)

    return list(_LOCAL_SAVED_STANDARDS.values())
