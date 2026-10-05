"""Branding endpoints.

Lets a Super Admin upload a new logo / favicon and change the App display
name from the Settings → Branding tab.

Uploaded files go through the shared object storage (`core.storage`) — on
the VPS that is local disk under LOCAL_UPLOAD_DIR, outside the app checkout,
so uploads survive deploys (`git reset --hard` + fresh `frontend/build`).
They are served back by `GET /api/branding/asset/{slot}`; a version
timestamp on the settings doc is used for cache-busting on the client side.

Feb 26 2026 — Sai Karthick requested an in-app way to swap the
"My Home USB" branding to "Urban Space Builders" without an engineering
deploy.
Oct 2026 — uploads used to be written into `/app/frontend/public/`, a path
that only existed in the old preview container, so on the VPS they never
reached the browser. Moved to object storage.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Response
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from core.database import db
from core.deps import get_current_user
from core.models import User, UserRole
from core.storage import put_object, get_object, APP_NAME

logger = logging.getLogger(__name__)

router = APIRouter()

BRANDING_DOC_ID = "branding_settings_singleton"
MAX_BYTES = 2 * 1024 * 1024  # 2 MB
SLOTS = ("logo", "favicon")
CONTENT_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
}


class BrandingPatch(BaseModel):
    app_name: Optional[str] = None


async def _get_or_init_doc():
    doc = await db.branding_settings.find_one({"_id": BRANDING_DOC_ID})
    if doc is None:
        doc = {
            "_id": BRANDING_DOC_ID,
            "app_name": "Drawlead Construction ERP",
            "logo_version": 0,
            "favicon_version": 0,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.branding_settings.insert_one(doc)
    elif doc.get("app_name") == "My Home USB":
        # Sep 2026 rebrand: migrate the old stored default in place.
        doc["app_name"] = "Drawlead Construction ERP"
        await db.branding_settings.update_one(
            {"_id": BRANDING_DOC_ID}, {"$set": {"app_name": doc["app_name"]}},
        )
    return doc


def _shape(doc: dict) -> dict:
    """Return the response shape with cache-busted URLs.

    `logo_url` is null until a logo has been uploaded (the UI then shows the
    built-in Drawlead mark). `favicon_url` falls back to the bundled icon.
    """
    lv = doc.get("logo_version") or 0
    fv = doc.get("favicon_version") or 0
    has_logo = bool(doc.get("logo_path"))
    has_favicon = bool(doc.get("favicon_path"))
    return {
        "app_name": doc.get("app_name") or "Drawlead Construction ERP",
        "logo_url": f"/api/branding/asset/logo?v={lv}" if has_logo else None,
        "favicon_url": f"/api/branding/asset/favicon?v={fv}" if has_favicon else f"/icon-192.png?v={fv}",
        "favicon_512_url": f"/api/branding/asset/favicon?v={fv}" if has_favicon else f"/icon-512.png?v={fv}",
        "has_custom_logo": has_logo,
        "has_custom_favicon": has_favicon,
        "logo_version": lv,
        "favicon_version": fv,
        "updated_at": doc.get("updated_at"),
    }


@router.get("/branding")
async def get_branding():
    """Public read — used by every page to load the current app name and
    cache-busted logo URL on mount. No auth required."""
    doc = await _get_or_init_doc()
    return _shape(doc)


@router.get("/branding/asset/{slot}")
async def get_branding_asset(slot: str):
    """Public read of the uploaded logo / favicon bytes."""
    if slot not in SLOTS:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await db.branding_settings.find_one({"_id": BRANDING_DOC_ID}) or {}
    path = doc.get(f"{slot}_path")
    if not path:
        raise HTTPException(status_code=404, detail="No custom asset uploaded")
    try:
        data, _ = await run_in_threadpool(get_object, path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Asset file missing from storage")
    except Exception as e:  # storage backend unreachable
        logger.error(f"Branding asset read failed for {path}: {e}")
        raise HTTPException(status_code=502, detail="Could not read asset from storage")
    return Response(
        content=data,
        media_type=doc.get(f"{slot}_content_type") or "application/octet-stream",
        headers={
            # URLs carry ?v=<version>, so a new upload gets a new URL.
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
            # SVG uploads must never run script if opened directly.
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        },
    )


@router.patch("/admin/branding")
async def update_branding(payload: BrandingPatch, user: User = Depends(get_current_user)):
    if user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admin can update branding")
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if payload.app_name is not None:
        name = (payload.app_name or "").strip()
        if not name:
            raise HTTPException(status_code=400, detail="App name cannot be empty")
        if len(name) > 80:
            raise HTTPException(status_code=400, detail="App name max 80 characters")
        updates["app_name"] = name
    await db.branding_settings.update_one(
        {"_id": BRANDING_DOC_ID}, {"$set": updates}, upsert=True,
    )
    doc = await db.branding_settings.find_one({"_id": BRANDING_DOC_ID})
    return _shape(doc)


@router.post("/admin/branding/upload")
async def upload_branding_asset(
    slot: str,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """Upload a new logo or favicon. `slot` ∈ {"logo", "favicon"}."""
    if user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admin can upload branding assets")
    if slot not in SLOTS:
        raise HTTPException(status_code=400, detail=f"slot must be one of {list(SLOTS)}")

    ext = os.path.splitext((file.filename or "").lower())[1]
    if ext not in CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type {ext}. Allowed: {sorted(CONTENT_TYPES)}")

    body = await file.read()
    if len(body) == 0:
        raise HTTPException(status_code=400, detail="Empty upload")
    if len(body) > MAX_BYTES:
        raise HTTPException(status_code=400, detail=f"File too large; max {MAX_BYTES // 1024 // 1024} MB")

    new_ver = int(datetime.now(timezone.utc).timestamp())
    content_type = CONTENT_TYPES[ext]
    # Versioned object name: earlier uploads stay in storage for manual rollback.
    path = f"{APP_NAME}/branding/{slot}-{new_ver}{ext}"
    try:
        await run_in_threadpool(put_object, path, body, content_type)
    except Exception as e:
        logger.error(f"Branding upload to storage failed for {path}: {e}")
        raise HTTPException(status_code=500, detail="Could not store the uploaded file")

    await db.branding_settings.update_one(
        {"_id": BRANDING_DOC_ID},
        {"$set": {
            f"{slot}_version": new_ver,
            f"{slot}_path": path,
            f"{slot}_content_type": content_type,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    doc = await db.branding_settings.find_one({"_id": BRANDING_DOC_ID})
    return _shape(doc)
