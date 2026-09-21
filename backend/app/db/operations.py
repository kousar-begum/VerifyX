"""
VerfiX Database Operations

Centralized database operations used by backend services.

This module keeps database access separate from business logic.
Services should call these functions instead of scattering raw
database operations throughout the application.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.db.models import (
    Analysis,
    AnalysisLayer,
    Anomaly,
    AuditLog,
    Base,
    Comparison,
    ComparisonChange,
    ComparisonDNA,
    Document,
    DocumentDNA,
    OCRResult,
    Profile,
    Report,
    RiskFactor,
    VerificationRequest,
)


# ======================================================================
# Database Engine
# ======================================================================


settings = get_settings()


def _create_engine():
    """
    Create the SQLAlchemy engine.

    DATABASE_URL remains empty until the Supabase database connection
    is configured.
    """

    database_url = settings.DATABASE_URL.strip()

    if not database_url:
        return None

    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_recycle=1800,
        future=True,
    )


engine = _create_engine()

SessionLocal = (
    sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )
    if engine is not None
    else None
)


# ======================================================================
# Session Management
# ======================================================================


def get_db_session() -> Session:
    """
    Create and return a database session.

    Raises:
        RuntimeError: If DATABASE_URL has not been configured.
    """

    if SessionLocal is None:
        raise RuntimeError(
            "DATABASE_URL is not configured. "
            "Configure the Supabase PostgreSQL connection "
            "before using SQLAlchemy database operations."
        )

    return SessionLocal()


def close_db_session(session: Session) -> None:
    """
    Safely close a database session.
    """

    session.close()


def initialize_database() -> None:
    """
    Create database tables from SQLAlchemy models.

    This helper is intended for local development only.

    Production Supabase databases should use explicit SQL migrations
    so that schema changes remain controlled and reproducible.
    """

    if engine is None:
        raise RuntimeError(
            "DATABASE_URL is not configured."
        )

    Base.metadata.create_all(bind=engine)


# ======================================================================
# Profile Operations
# ======================================================================


def create_profile(
    user_id: UUID,
    email: Optional[str] = None,
    full_name: Optional[str] = None,
    organization_name: Optional[str] = None,
    role: str = "user",
) -> Profile:
    """
    Create a new application profile.
    """

    with get_db_session() as session:
        profile = Profile(
            id=user_id,
            email=email,
            full_name=full_name,
            organization_name=organization_name,
            role=role,
            is_active=True,
        )

        session.add(profile)
        session.commit()
        session.refresh(profile)

        return profile


def get_profile(user_id: UUID) -> Optional[Profile]:
    """
    Retrieve a profile by Supabase Auth user ID.
    """

    with get_db_session() as session:
        statement = select(Profile).where(
            Profile.id == user_id
        )

        return session.execute(statement).scalar_one_or_none()


# ======================================================================
# Document Operations
# ======================================================================


def create_document(
    user_id: UUID,
    file_name: str,
    original_file_name: str,
    storage_path: str,
    mime_type: str,
    file_extension: str,
    file_size: int,
    sha256_hash: Optional[str] = None,
    document_type: Optional[str] = None,
    page_count: Optional[int] = None,
    metadata_json: Optional[dict[str, Any]] = None,
) -> Document:
    """
    Create a document record after successful upload.
    """

    with get_db_session() as session:
        document = Document(
            user_id=user_id,
            file_name=file_name,
            original_file_name=original_file_name,
            storage_path=storage_path,
            mime_type=mime_type,
            file_extension=file_extension,
            file_size=file_size,
            sha256_hash=sha256_hash,
            document_type=document_type,
            page_count=page_count,
            metadata_json=metadata_json,
        )

        session.add(document)
        session.commit()
        session.refresh(document)

        return document


def get_document(
    document_id: UUID,
    user_id: Optional[UUID] = None,
) -> Optional[Document]:
    """
    Retrieve a document.

    If user_id is provided, the query is restricted to that owner.
    """

    with get_db_session() as session:
        statement = select(Document).where(
            Document.id == document_id
        )

        if user_id is not None:
            statement = statement.where(
                Document.user_id == user_id
            )

        return session.execute(statement).scalar_one_or_none()


def list_documents(
    user_id: UUID,
    limit: int = 50,
    offset: int = 0,
) -> list[Document]:
    """
    Return documents belonging to a specific user.
    """

    limit = max(1, min(limit, 100))
    offset = max(0, offset)

    with get_db_session() as session:
        statement = (
            select(Document)
            .where(Document.user_id == user_id)
            .order_by(Document.uploaded_at.desc())
            .limit(limit)
            .offset(offset)
        )

        return list(session.execute(statement).scalars().all())


def update_document_status(
    document_id: UUID,
    status: str,
    user_id: Optional[UUID] = None,
) -> Optional[Document]:
    """
    Update the processing status of a document.
    """

    with get_db_session() as session:
        statement = select(Document).where(
            Document.id == document_id
        )

        if user_id is not None:
            statement = statement.where(
                Document.user_id == user_id
            )

        document = session.execute(
            statement
        ).scalar_one_or_none()

        if document is None:
            return None

        document.status = status
        document.updated_at = datetime.now(timezone.utc)

        session.commit()
        session.refresh(document)

        return document


# ======================================================================
# Analysis Operations
# ======================================================================


def create_analysis(
    document_id: UUID,
    user_id: UUID,
    analysis_version: str = "1.0.0",
) -> Analysis:
    """
    Create a new analysis execution.
    """

    with get_db_session() as session:
        analysis = Analysis(
            document_id=document_id,
            user_id=user_id,
            analysis_version=analysis_version,
        )

        session.add(analysis)
        session.commit()
        session.refresh(analysis)

        return analysis


def get_analysis(
    analysis_id: UUID,
    user_id: Optional[UUID] = None,
) -> Optional[Analysis]:
    """
    Retrieve an analysis by ID.
    """

    with get_db_session() as session:
        statement = select(Analysis).where(
            Analysis.id == analysis_id
        )

        if user_id is not None:
            statement = statement.where(
                Analysis.user_id == user_id
            )

        return session.execute(
            statement
        ).scalar_one_or_none()


def list_analyses(
    user_id: UUID,
    limit: int = 50,
    offset: int = 0,
) -> list[Analysis]:
    """
    Return analyses belonging to a specific user.

    Results are ordered from newest to oldest.
    """

    limit = max(1, min(limit, 100))
    offset = max(0, offset)

    with get_db_session() as session:
        statement = (
            select(Analysis)
            .where(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        return list(
            session.execute(statement).scalars().all()
        )


def update_analysis_result(
    analysis_id: UUID,
    status: str,
    risk_score: Optional[float] = None,
    risk_level: Optional[str] = None,
    result_summary: Optional[str] = None,
    confidence_score: Optional[float] = None,
    insufficient_evidence: Optional[bool] = None,
) -> Optional[Analysis]:
    """
    Update the final or intermediate result of an analysis.
    """

    with get_db_session() as session:
        statement = select(Analysis).where(
            Analysis.id == analysis_id
        )

        analysis = session.execute(
            statement
        ).scalar_one_or_none()

        if analysis is None:
            return None

        analysis.status = status

        if risk_score is not None:
            analysis.risk_score = risk_score

        if risk_level is not None:
            analysis.risk_level = risk_level

        if result_summary is not None:
            analysis.result_summary = result_summary

        if confidence_score is not None:
            analysis.confidence_score = confidence_score

        if insufficient_evidence is not None:
            analysis.insufficient_evidence = (
                insufficient_evidence
            )

        if status in {"completed", "failed", "inconclusive"}:
            analysis.completed_at = datetime.now(timezone.utc)

        session.commit()
        session.refresh(analysis)

        return analysis


# ======================================================================
# Analysis Layer Operations
# ======================================================================


def create_analysis_layer(
    analysis_id: UUID,
    layer_name: str,
    status: str = "completed",
    score: Optional[float] = None,
    result_json: Optional[dict[str, Any]] = None,
    error_message: Optional[str] = None,
) -> AnalysisLayer:
    """
    Store the result of one analysis layer.
    """

    with get_db_session() as session:
        layer = AnalysisLayer(
            analysis_id=analysis_id,
            layer_name=layer_name,
            status=status,
            score=score,
            result_json=result_json,
            error_message=error_message,
        )

        session.add(layer)
        session.commit()
        session.refresh(layer)

        return layer


def get_analysis_layers(
    analysis_id: UUID,
) -> list[AnalysisLayer]:
    """
    Return all analysis layers for an analysis.
    """

    with get_db_session() as session:
        statement = (
            select(AnalysisLayer)
            .where(
                AnalysisLayer.analysis_id == analysis_id
            )
            .order_by(AnalysisLayer.created_at.asc())
        )

        return list(session.execute(statement).scalars().all())


# ======================================================================
# OCR Operations
# ======================================================================


def create_ocr_result(
    analysis_id: UUID,
    extracted_text: str,
    language: Optional[str] = None,
    confidence_score: Optional[float] = None,
    page_results: Optional[list[dict[str, Any]]] = None,
) -> OCRResult:
    """
    Store OCR output.
    """

    with get_db_session() as session:
        result = OCRResult(
            analysis_id=analysis_id,
            extracted_text=extracted_text,
            language=language,
            confidence_score=confidence_score,
            page_results=page_results,
        )

        session.add(result)
        session.commit()
        session.refresh(result)

        return result


def get_ocr_result(
    analysis_id: UUID,
) -> Optional[OCRResult]:
    """
    Retrieve OCR results for an analysis.
    """

    with get_db_session() as session:
        statement = select(OCRResult).where(
            OCRResult.analysis_id == analysis_id
        )

        return session.execute(
            statement
        ).scalar_one_or_none()


# ======================================================================
# Anomaly Operations
# ======================================================================


def create_anomaly(
    analysis_id: UUID,
    anomaly_type: str,
    anomaly_name: str,
    description: str,
    severity: str,
    confidence_score: Optional[float] = None,
    evidence: Optional[dict[str, Any]] = None,
    location: Optional[dict[str, Any]] = None,
    recommended_action: Optional[str] = None,
) -> Anomaly:
    """
    Store one detected anomaly.
    """

    with get_db_session() as session:
        anomaly = Anomaly(
            analysis_id=analysis_id,
            anomaly_type=anomaly_type,
            anomaly_name=anomaly_name,
            description=description,
            severity=severity,
            confidence_score=confidence_score,
            evidence=evidence,
            location=location,
            recommended_action=recommended_action,
        )

        session.add(anomaly)
        session.commit()
        session.refresh(anomaly)

        return anomaly


def get_anomalies(
    analysis_id: UUID,
) -> list[Anomaly]:
    """
    Return anomalies associated with an analysis.
    """

    with get_db_session() as session:
        statement = (
            select(Anomaly)
            .where(Anomaly.analysis_id == analysis_id)
            .order_by(Anomaly.created_at.asc())
        )

        return list(session.execute(statement).scalars().all())


# ======================================================================
# Risk Factor Operations
# ======================================================================


def create_risk_factor(
    analysis_id: UUID,
    factor_name: str,
    category: str,
    description: str,
    contribution: float,
    severity: str,
    evidence_json: Optional[dict[str, Any]] = None,
) -> RiskFactor:
    """
    Store one risk factor contributing to the analysis.
    """

    with get_db_session() as session:
        factor = RiskFactor(
            analysis_id=analysis_id,
            factor_name=factor_name,
            category=category,
            description=description,
            contribution=contribution,
            severity=severity,
            evidence_json=evidence_json,
        )

        session.add(factor)
        session.commit()
        session.refresh(factor)

        return factor


def get_risk_factors(
    analysis_id: UUID,
) -> list[RiskFactor]:
    """
    Return all risk factors for an analysis.
    """

    with get_db_session() as session:
        statement = (
            select(RiskFactor)
            .where(
                RiskFactor.analysis_id == analysis_id
            )
            .order_by(
                RiskFactor.contribution.desc()
            )
        )

        return list(session.execute(statement).scalars().all())


# ======================================================================
# Document DNA Operations
# ======================================================================


def create_document_dna(
    document_id: UUID,
    analysis_id: Optional[UUID] = None,
    text_hash: Optional[str] = None,
    visual_hash: Optional[str] = None,
    structure_hash: Optional[str] = None,
    metadata_hash: Optional[str] = None,
    dna_vector: Optional[list[float]] = None,
    fingerprint_json: Optional[dict[str, Any]] = None,
) -> DocumentDNA:
    """
    Store a document DNA fingerprint.
    """

    with get_db_session() as session:
        dna = DocumentDNA(
            document_id=document_id,
            analysis_id=analysis_id,
            text_hash=text_hash,
            visual_hash=visual_hash,
            structure_hash=structure_hash,
            metadata_hash=metadata_hash,
            dna_vector=dna_vector,
            fingerprint_json=fingerprint_json,
        )

        session.add(dna)
        session.commit()
        session.refresh(dna)

        return dna


def get_document_dna(
    document_id: UUID,
) -> Optional[DocumentDNA]:
    """
    Retrieve the latest DNA record for a document.
    """

    with get_db_session() as session:
        statement = (
            select(DocumentDNA)
            .where(
                DocumentDNA.document_id == document_id
            )
            .order_by(DocumentDNA.created_at.desc())
        )

        return session.execute(
            statement
        ).scalars().first()


# ======================================================================
# Comparison Operations
# ======================================================================


def create_comparison(
    user_id: UUID,
    document_a_id: UUID,
    document_b_id: UUID,
) -> Comparison:
    """
    Create a document comparison request.
    """

    with get_db_session() as session:
        comparison = Comparison(
            user_id=user_id,
            document_a_id=document_a_id,
            document_b_id=document_b_id,
        )

        session.add(comparison)
        session.commit()
        session.refresh(comparison)

        return comparison


def get_comparison(
    comparison_id: UUID,
    user_id: Optional[UUID] = None,
) -> Optional[Comparison]:
    """
    Retrieve a document comparison.
    """

    with get_db_session() as session:
        statement = select(Comparison).where(
            Comparison.id == comparison_id
        )

        if user_id is not None:
            statement = statement.where(
                Comparison.user_id == user_id
            )

        return session.execute(
            statement
        ).scalar_one_or_none()


def create_comparison_change(
    comparison_id: UUID,
    change_type: str,
    description: str,
    severity: str,
    field_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    location_a: Optional[dict[str, Any]] = None,
    location_b: Optional[dict[str, Any]] = None,
) -> ComparisonChange:
    """
    Store one detected document change.
    """

    with get_db_session() as session:
        change = ComparisonChange(
            comparison_id=comparison_id,
            change_type=change_type,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            description=description,
            severity=severity,
            location_a=location_a,
            location_b=location_b,
        )

        session.add(change)
        session.commit()
        session.refresh(change)

        return change


def get_comparison_changes(
    comparison_id: UUID,
) -> list[ComparisonChange]:
    """
    Return all changes detected during a comparison.
    """

    with get_db_session() as session:
        statement = (
            select(ComparisonChange)
            .where(
                ComparisonChange.comparison_id
                == comparison_id
            )
            .order_by(ComparisonChange.created_at.asc())
        )

        return list(session.execute(statement).scalars().all())


def create_comparison_dna(
    comparison_id: UUID,
    text_similarity: Optional[float] = None,
    visual_similarity: Optional[float] = None,
    structure_similarity: Optional[float] = None,
    metadata_similarity: Optional[float] = None,
    overall_similarity: Optional[float] = None,
    differences_json: Optional[dict[str, Any]] = None,
) -> ComparisonDNA:
    """
    Store DNA comparison results.
    """

    with get_db_session() as session:
        dna = ComparisonDNA(
            comparison_id=comparison_id,
            text_similarity=text_similarity,
            visual_similarity=visual_similarity,
            structure_similarity=structure_similarity,
            metadata_similarity=metadata_similarity,
            overall_similarity=overall_similarity,
            differences_json=differences_json,
        )

        session.add(dna)
        session.commit()
        session.refresh(dna)

        return dna


# ======================================================================
# Report Operations
# ======================================================================


def create_report(
    analysis_id: UUID,
    user_id: UUID,
    report_type: str,
    storage_bucket: str,
    storage_path: str,
    file_name: str,
) -> Report:
    """
    Store a generated report reference.
    """

    with get_db_session() as session:
        report = Report(
            analysis_id=analysis_id,
            user_id=user_id,
            report_type=report_type,
            storage_bucket=storage_bucket,
            storage_path=storage_path,
            file_name=file_name,
        )

        session.add(report)
        session.commit()
        session.refresh(report)

        return report


def get_reports(
    user_id: UUID,
    limit: int = 50,
    offset: int = 0,
) -> list[Report]:
    """
    Return reports belonging to a user.
    """

    limit = max(1, min(limit, 100))
    offset = max(0, offset)

    with get_db_session() as session:
        statement = (
            select(Report)
            .where(Report.user_id == user_id)
            .order_by(Report.generated_at.desc())
            .limit(limit)
            .offset(offset)
        )

        return list(session.execute(statement).scalars().all())


# ======================================================================
# Verification Operations
# ======================================================================


def create_verification_request(
    document_id: UUID,
    user_id: UUID,
    analysis_id: Optional[UUID] = None,
    verification_method: Optional[str] = None,
    notes: Optional[str] = None,
) -> VerificationRequest:
    """
    Create a document verification request.
    """

    with get_db_session() as session:
        request = VerificationRequest(
            document_id=document_id,
            analysis_id=analysis_id,
            user_id=user_id,
            verification_method=verification_method,
            notes=notes,
        )

        session.add(request)
        session.commit()
        session.refresh(request)

        return request


def get_verification_request(
    request_id: UUID,
    user_id: Optional[UUID] = None,
) -> Optional[VerificationRequest]:
    """
    Retrieve a verification request.
    """

    with get_db_session() as session:
        statement = select(
            VerificationRequest
        ).where(
            VerificationRequest.id == request_id
        )

        if user_id is not None:
            statement = statement.where(
                VerificationRequest.user_id == user_id
            )

        return session.execute(
            statement
        ).scalar_one_or_none()


# ======================================================================
# Audit Logging
# ======================================================================


def create_audit_log(
    action: str,
    user_id: Optional[UUID] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[UUID] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
) -> AuditLog:
    """
    Create a security audit log entry.

    Never store passwords, access tokens, service-role keys, or raw
    document contents in the audit log.
    """

    with get_db_session() as session:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
        )

        session.add(audit_log)
        session.commit()
        session.refresh(audit_log)

        return audit_log