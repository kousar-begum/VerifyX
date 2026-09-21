from fastapi import FastAPI

from app.api.routes.authentication.auth import (
    router as auth_router,
)

from app.api.routes.documents.upload import (
    router as document_router,
)

from app.api.routes.documents.download import (
    router as document_download_router,
)

from app.api.routes.analysis.preprocessing import (
    router as preprocessing_router,
)

from app.api.routes.analysis.ocr import (
    router as ocr_router,
)

from app.api.routes.analysis.metadata import (
    router as metadata_router,
)

from app.api.routes.analysis.cv_analysis import (
    router as cv_analysis_router,
)

from app.api.routes.analysis.anomalies import (
    router as anomaly_router,
)

from app.api.routes.analysis.risk import (
    router as risk_router,
)

from app.api.routes.analysis.full_analysis import (
    router as full_analysis_router,
)

from app.api.routes.analysis.heatmap import (
    router as heatmap_router,
)

from app.api.routes.analysis.risk_explanation import (
    router as risk_explanation_router,
)

from app.api.routes.analysis.document_comparison import (
    router as document_comparison_router,
)

from app.api.routes.analysis.document_dna import (
    router as document_dna_router,
)

from app.api.routes.analysis.change_detection import (
    router as change_detection_router,
)

from app.api.routes.analysis.reports import (
    router as reports_router,
)

from app.api.routes.analysis.analysis_history import (
    router as analysis_history_router,
)

from app.api.routes.analysis.verification import (
    router as verification_router,
)

from app.api.routes.analysis.audit_log import (
    router as audit_log_router,
)

from app.core.config import settings


app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
)


# ======================================================================
# AUTHENTICATION
# ======================================================================

app.include_router(
    auth_router,
    prefix=settings.API_PREFIX,
)


# ======================================================================
# DOCUMENT MANAGEMENT
# ======================================================================

app.include_router(
    document_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    document_download_router,
    prefix=settings.API_PREFIX,
)


# ======================================================================
# DOCUMENT ANALYSIS
# ======================================================================

app.include_router(
    preprocessing_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    ocr_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    metadata_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    cv_analysis_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    anomaly_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    risk_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    full_analysis_router,
    prefix=settings.API_PREFIX,
)


# ======================================================================
# ADVANCED DOCUMENT ANALYSIS
# ======================================================================

app.include_router(
    heatmap_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    risk_explanation_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    document_comparison_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    document_dna_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    change_detection_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    reports_router,
    prefix=settings.API_PREFIX,
)


# ======================================================================
# ANALYSIS HISTORY
# ======================================================================

app.include_router(
    analysis_history_router,
    prefix=settings.API_PREFIX,
)


# ======================================================================
# VERIFICATION
# ======================================================================

app.include_router(
    verification_router,
    prefix=settings.API_PREFIX,
)


# ======================================================================
# AUDIT LOGGING
# ======================================================================

app.include_router(
    audit_log_router,
    prefix=settings.API_PREFIX,
)


# ======================================================================
# HEALTH CHECK
# ======================================================================

@app.get(
    "/",
    tags=["Health"],
)
def root():
    return {
        "message": "VerfiX backend is running",
        "version": settings.APP_VERSION,
    }