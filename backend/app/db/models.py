"""
VerfiX Database Models

SQLAlchemy models representing the core entities used by the
AI Document Tampering & Identity Risk Analyzer.

Supabase PostgreSQL remains the primary production database.
These models provide a structured Python representation of the
database schema for backend operations, validation, and future
database tooling.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


# ======================================================================
# Base
# ======================================================================


class Base(DeclarativeBase):
    """
    Base class for all VerfiX SQLAlchemy models.
    """

    pass


# ======================================================================
# Enumerations
# ======================================================================


class DocumentStatus(str, Enum):
    """
    Processing state of an uploaded document.
    """

    UPLOADED = "uploaded"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    FAILED = "failed"
    DELETED = "deleted"


class AnalysisStatus(str, Enum):
    """
    Processing state of a document analysis.
    """

    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    INCONCLUSIVE = "inconclusive"


class RiskLevel(str, Enum):
    """
    VerfiX risk classification.

    The risk score is an evidence-based indicator and is not a
    probability of fraud or authenticity.
    """

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    UNCERTAIN = "uncertain"


class AnomalySeverity(str, Enum):
    """
    Severity assigned to a detected anomaly.
    """

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AnomalyStatus(str, Enum):
    """
    Current state of an anomaly.
    """

    DETECTED = "detected"
    REVIEWED = "reviewed"
    DISMISSED = "dismissed"
    CONFIRMED = "confirmed"


class ComparisonStatus(str, Enum):
    """
    Processing state of a document comparison.
    """

    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class VerificationStatus(str, Enum):
    """
    State of a document-owner verification request.
    """

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


# ======================================================================
# Profiles
# ======================================================================


class Profile(Base):
    """
    Application profile associated with a Supabase Auth user.
    """

    __tablename__ = "profiles"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
    )

    full_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    email: Mapped[Optional[str]] = mapped_column(
        String(320),
        nullable=True,
        index=True,
    )

    organization_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="user",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


# ======================================================================
# Documents
# ======================================================================


class Document(Base):
    """
    Represents an uploaded document.

    Original files are stored in private Supabase Storage.
    The database stores metadata and references, not the raw file.
    """

    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    user_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    file_name: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )

    original_file_name: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    file_extension: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    sha256_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )

    status: Mapped[DocumentStatus] = mapped_column(
        String(30),
        nullable=False,
        default=DocumentStatus.UPLOADED,
        index=True,
    )

    document_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    page_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    metadata_json: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


# ======================================================================
# Analyses
# ======================================================================


class Analysis(Base):
    """
    Represents one complete analysis execution for a document.
    """

    __tablename__ = "analyses"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    document_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[AnalysisStatus] = mapped_column(
        String(30),
        nullable=False,
        default=AnalysisStatus.QUEUED,
        index=True,
    )

    risk_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    risk_level: Mapped[RiskLevel] = mapped_column(
        String(30),
        nullable=False,
        default=RiskLevel.UNCERTAIN,
    )

    result_summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    confidence_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    insufficient_evidence: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    analysis_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="1.0.0",
    )

    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Analysis Layers
# ======================================================================


class AnalysisLayer(Base):
    """
    Stores results from individual forensic analysis layers.

    Examples:
    - OCR
    - metadata
    - image
    - structure
    - tampering
    - AI-origin indicators
    """

    __tablename__ = "analysis_layers"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    analysis_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    layer_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="completed",
    )

    score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    result_json: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# OCR Results
# ======================================================================


class OCRResult(Base):
    """
    Stores OCR output and related quality information.
    """

    __tablename__ = "ocr_results"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    analysis_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    extracted_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    language: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    confidence_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    page_results: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Anomalies
# ======================================================================


class Anomaly(Base):
    """
    Represents a detected document anomaly.

    An anomaly is evidence requiring interpretation. It is not by
    itself proof that a document is fraudulent.
    """

    __tablename__ = "anomalies"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    analysis_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    anomaly_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    anomaly_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    severity: Mapped[AnomalySeverity] = mapped_column(
        String(30),
        nullable=False,
    )

    status: Mapped[AnomalyStatus] = mapped_column(
        String(30),
        nullable=False,
        default=AnomalyStatus.DETECTED,
    )

    confidence_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    evidence: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    location: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    recommended_action: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Document DNA
# ======================================================================


class DocumentDNA(Base):
    """
    Stores a structural and visual fingerprint of a document.

    DNA is used to support document comparison and change detection.
    """

    __tablename__ = "document_dna"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    document_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    analysis_id: Mapped[Optional[UUID]] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="SET NULL"),
        nullable=True,
    )

    text_hash: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
    )

    visual_hash: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
    )

    structure_hash: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
    )

    metadata_hash: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
    )

    dna_vector: Mapped[Optional[list[float]]] = mapped_column(
        JSON,
        nullable=True,
    )

    fingerprint_json: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Risk Factors
# ======================================================================


class RiskFactor(Base):
    """
    Individual evidence item contributing to the overall risk score.
    """

    __tablename__ = "risk_factors"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    analysis_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    factor_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    contribution: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    severity: Mapped[AnomalySeverity] = mapped_column(
        String(30),
        nullable=False,
    )

    evidence_json: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Comparisons
# ======================================================================


class Comparison(Base):
    """
    Represents comparison of two documents.
    """

    __tablename__ = "comparisons"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    user_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    document_a_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
    )

    document_b_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
    )

    status: Mapped[ComparisonStatus] = mapped_column(
        String(30),
        nullable=False,
        default=ComparisonStatus.QUEUED,
    )

    similarity_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    change_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    result_json: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


# ======================================================================
# Comparison Changes
# ======================================================================


class ComparisonChange(Base):
    """
    Individual change detected between two documents.
    """

    __tablename__ = "comparison_changes"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    comparison_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("comparisons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    change_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    field_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    old_value: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    new_value: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    severity: Mapped[AnomalySeverity] = mapped_column(
        String(30),
        nullable=False,
    )

    location_a: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    location_b: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Comparison DNA
# ======================================================================


class ComparisonDNA(Base):
    """
    Stores DNA-level comparison results.
    """

    __tablename__ = "comparison_dna"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    comparison_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("comparisons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    text_similarity: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    visual_similarity: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    structure_similarity: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    metadata_similarity: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    overall_similarity: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    differences_json: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Artifacts
# ======================================================================


class Artifact(Base):
    """
    Represents generated analysis artifacts.

    Examples:
    - tamper heatmaps
    - annotated images
    - processed documents
    - extracted page images
    """

    __tablename__ = "artifacts"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    document_id: Mapped[Optional[UUID]] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=True,
    )

    analysis_id: Mapped[Optional[UUID]] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=True,
    )

    user_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    artifact_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    storage_bucket: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
    )

    mime_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    file_size: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    metadata_json: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Reports
# ======================================================================


class Report(Base):
    """
    Generated PDF or structured analysis report.
    """

    __tablename__ = "reports"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    analysis_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    report_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="pdf",
    )

    storage_bucket: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
    )

    file_name: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ======================================================================
# Verification Requests
# ======================================================================


class VerificationRequest(Base):
    """
    Represents a manual document-owner verification workflow.
    """

    __tablename__ = "verification_requests"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    document_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    analysis_id: Mapped[Optional[UUID]] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="SET NULL"),
        nullable=True,
    )

    user_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[VerificationStatus] = mapped_column(
        String(30),
        nullable=False,
        default=VerificationStatus.PENDING,
    )

    verification_method: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    reviewer_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


# ======================================================================
# Audit Logs
# ======================================================================


class AuditLog(Base):
    """
    Security and activity audit trail.

    Audit records should never contain raw document contents or
    sensitive secrets.
    """

    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    user_id: Mapped[Optional[UUID]] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    resource_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    resource_id: Mapped[Optional[UUID]] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        nullable=True,
    )

    ip_address: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    user_agent: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
    )

    details: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )