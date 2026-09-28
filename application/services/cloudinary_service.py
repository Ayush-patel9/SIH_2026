"""
Cloudinary Service for PDF Storage
Handles uploading, deleting, and generating URLs for tender documents in Cloudinary,
mirroring the AiForBharat implementation.
"""

import os
import io
import time
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("cloudinary_service")

# Try to import and configure Cloudinary
CLOUDINARY_CONFIGURED = False
try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.utils

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        CLOUDINARY_CONFIGURED = True
        logger.info(f"✓ Cloudinary configured with cloud: {cloud_name}")
    else:
        logger.warning("⚠ Cloudinary credentials missing in .env")
except Exception as e:
    logger.error(f"❌ Error configuring Cloudinary: {e}")


def upload_pdf(file_path: str, public_id: Optional[str] = None, folder: str = "tenders") -> Dict[str, Any]:
    """
    Upload a PDF file to Cloudinary.
    """
    if not CLOUDINARY_CONFIGURED:
        raise RuntimeError("Cloudinary is not configured. Check your CLOUDINARY_* environment variables.")

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    if not public_id:
        public_id = Path(file_path).stem

    logger.info(f"Uploading PDF to Cloudinary: {file_path} (public_id={public_id})")

    result = cloudinary.uploader.upload(
        file_path,
        folder=folder,
        resource_type="raw",
        public_id=public_id,
        overwrite=False,
        use_filename=True,
        unique_filename=True,
        access_mode="public"
    )

    return {
        'url': result.get('url'),
        'secure_url': result.get('secure_url'),
        'public_id': result.get('public_id'),
        'bytes': result.get('bytes', os.path.getsize(file_path)),
        'resource_type': result.get('resource_type', 'raw'),
        'format': result.get('format', 'pdf')
    }


def upload_pdf_bytes(pdf_bytes: bytes, filename: str, folder: str = "tenders") -> Dict[str, Any]:
    """
    Upload PDF bytes directly to Cloudinary and also persist a local copy in data/tenders/.
    """
    if not CLOUDINARY_CONFIGURED:
        raise RuntimeError("Cloudinary is not configured. Check your CLOUDINARY_* environment variables.")

    # Save a local cache copy
    local_dir = Path("data") / "tenders"
    local_dir.mkdir(parents=True, exist_ok=True)
    
    clean_stem = Path(filename).stem
    safe_stem = "".join(c for c in clean_stem if c.isalnum() or c in ("-", "_")).strip() or "tender"
    timestamp = int(time.time())
    unique_filename = f"{timestamp}_{safe_stem}.pdf"
    local_filepath = local_dir / unique_filename

    with open(local_filepath, "wb") as f:
        f.write(pdf_bytes)

    # Upload to Cloudinary using file path
    res = upload_pdf(str(local_filepath), public_id=f"{timestamp}_{safe_stem}", folder=folder)
    res['local_filepath'] = str(local_filepath)
    res['filename'] = unique_filename
    res['original_filename'] = filename
    return res


def delete_pdf(public_id: str) -> bool:
    """Delete a PDF from Cloudinary."""
    if not CLOUDINARY_CONFIGURED or not public_id:
        return False
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="raw")
        return result.get('result') == 'ok'
    except Exception as e:
        logger.error(f"Cloudinary delete error: {e}")
        return False


def get_pdf_url(public_id: str) -> str:
    """Get the direct HTTPS URL for a PDF stored in Cloudinary."""
    if not CLOUDINARY_CONFIGURED:
        return ""
    url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type="raw",
        secure=True
    )
    return url
