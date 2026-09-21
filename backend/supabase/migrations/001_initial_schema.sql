-- ============================================================
-- VerfiX - Initial Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- ============================================================
-- Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- ENUM TYPES
-- ============================================================

DO $$
BEGIN
    CREATE TYPE document_status AS ENUM (
        'uploaded',
        'processing',
        'analyzed',
        'failed',
        'deleted'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN
    CREATE TYPE analysis_status AS ENUM (
        'queued',
        'processing',
        'completed',
        'failed',
        'inconclusive'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN
    CREATE TYPE risk_level AS ENUM (
        'low',
        'medium',
        'high',
        'uncertain'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN
    CREATE TYPE anomaly_severity AS ENUM (
        'low',
        'medium',
        'high',
        'critical'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN
    CREATE TYPE anomaly_status AS ENUM (
        'detected',
        'reviewed',
        'dismissed',
        'confirmed'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN
    CREATE TYPE comparison_status AS ENUM (
        'queued',
        'processing',
        'completed',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN
    CREATE TYPE verification_status AS ENUM (
        'pending',
        'in_progress',
        'verified',
        'rejected',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- PROFILES
-- Connected to Supabase Auth users
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name VARCHAR(255),

    email VARCHAR(320),

    organization_name VARCHAR(255),

    role VARCHAR(50) NOT NULL DEFAULT 'user',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- DOCUMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    file_name VARCHAR(512) NOT NULL,

    original_file_name VARCHAR(512) NOT NULL,

    storage_path VARCHAR(1024) NOT NULL,

    mime_type VARCHAR(100) NOT NULL,

    file_extension VARCHAR(20) NOT NULL,

    file_size BIGINT NOT NULL,

    sha256_hash VARCHAR(64),

    status document_status NOT NULL DEFAULT 'uploaded',

    document_type VARCHAR(100),

    page_count INTEGER,

    metadata_json JSONB,

    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT documents_file_size_positive
        CHECK (file_size > 0)
);


-- ============================================================
-- ANALYSES
-- ============================================================

CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID NOT NULL
        REFERENCES documents(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    status analysis_status NOT NULL DEFAULT 'queued',

    risk_score DOUBLE PRECISION,

    risk_level risk_level NOT NULL DEFAULT 'uncertain',

    result_summary TEXT,

    confidence_score DOUBLE PRECISION,

    insufficient_evidence BOOLEAN NOT NULL DEFAULT FALSE,

    analysis_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',

    started_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT analyses_risk_score_range
        CHECK (
            risk_score IS NULL
            OR (
                risk_score >= 0
                AND risk_score <= 100
            )
        ),

    CONSTRAINT analyses_confidence_range
        CHECK (
            confidence_score IS NULL
            OR (
                confidence_score >= 0
                AND confidence_score <= 100
            )
        )
);


-- ============================================================
-- ANALYSIS LAYERS
-- ============================================================

CREATE TABLE IF NOT EXISTS analysis_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    layer_name VARCHAR(100) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'completed',

    score DOUBLE PRECISION,

    result_json JSONB,

    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT analysis_layers_score_range
        CHECK (
            score IS NULL
            OR (
                score >= 0
                AND score <= 100
            )
        )
);


-- ============================================================
-- OCR RESULTS
-- ============================================================

CREATE TABLE IF NOT EXISTS ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    extracted_text TEXT NOT NULL DEFAULT '',

    language VARCHAR(50),

    confidence_score DOUBLE PRECISION,

    page_results JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ocr_confidence_range
        CHECK (
            confidence_score IS NULL
            OR (
                confidence_score >= 0
                AND confidence_score <= 100
            )
        )
);


-- ============================================================
-- ANOMALIES
-- ============================================================

CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    anomaly_type VARCHAR(100) NOT NULL,

    anomaly_name VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    severity anomaly_severity NOT NULL,

    status anomaly_status NOT NULL DEFAULT 'detected',

    confidence_score DOUBLE PRECISION,

    evidence JSONB,

    location JSONB,

    recommended_action TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT anomalies_confidence_range
        CHECK (
            confidence_score IS NULL
            OR (
                confidence_score >= 0
                AND confidence_score <= 100
            )
        )
);


-- ============================================================
-- DOCUMENT DNA
-- ============================================================

CREATE TABLE IF NOT EXISTS document_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID NOT NULL
        REFERENCES documents(id)
        ON DELETE CASCADE,

    analysis_id UUID
        REFERENCES analyses(id)
        ON DELETE SET NULL,

    text_hash VARCHAR(128),

    visual_hash VARCHAR(128),

    structure_hash VARCHAR(128),

    metadata_hash VARCHAR(128),

    dna_vector JSONB,

    fingerprint_json JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- RISK FACTORS
-- ============================================================

CREATE TABLE IF NOT EXISTS risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    factor_name VARCHAR(255) NOT NULL,

    category VARCHAR(100) NOT NULL,

    description TEXT NOT NULL,

    contribution DOUBLE PRECISION NOT NULL DEFAULT 0,

    severity anomaly_severity NOT NULL,

    evidence_json JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- COMPARISONS
-- ============================================================

CREATE TABLE IF NOT EXISTS comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    document_a_id UUID NOT NULL
        REFERENCES documents(id)
        ON DELETE CASCADE,

    document_b_id UUID NOT NULL
        REFERENCES documents(id)
        ON DELETE CASCADE,

    status comparison_status NOT NULL DEFAULT 'queued',

    similarity_score DOUBLE PRECISION,

    change_count INTEGER NOT NULL DEFAULT 0,

    summary TEXT,

    result_json JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    completed_at TIMESTAMPTZ,

    CONSTRAINT comparisons_similarity_range
        CHECK (
            similarity_score IS NULL
            OR (
                similarity_score >= 0
                AND similarity_score <= 100
            )
        ),

    CONSTRAINT comparisons_different_documents
        CHECK (document_a_id <> document_b_id)
);


-- ============================================================
-- COMPARISON CHANGES
-- ============================================================

CREATE TABLE IF NOT EXISTS comparison_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    comparison_id UUID NOT NULL
        REFERENCES comparisons(id)
        ON DELETE CASCADE,

    change_type VARCHAR(100) NOT NULL,

    field_name VARCHAR(255),

    old_value TEXT,

    new_value TEXT,

    description TEXT NOT NULL,

    severity anomaly_severity NOT NULL,

    location_a JSONB,

    location_b JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- COMPARISON DNA
-- ============================================================

CREATE TABLE IF NOT EXISTS comparison_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    comparison_id UUID NOT NULL
        REFERENCES comparisons(id)
        ON DELETE CASCADE,

    text_similarity DOUBLE PRECISION,

    visual_similarity DOUBLE PRECISION,

    structure_similarity DOUBLE PRECISION,

    metadata_similarity DOUBLE PRECISION,

    overall_similarity DOUBLE PRECISION,

    differences_json JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT comparison_dna_similarity_range
        CHECK (
            (
                text_similarity IS NULL
                OR text_similarity BETWEEN 0 AND 100
            )
            AND
            (
                visual_similarity IS NULL
                OR visual_similarity BETWEEN 0 AND 100
            )
            AND
            (
                structure_similarity IS NULL
                OR structure_similarity BETWEEN 0 AND 100
            )
            AND
            (
                metadata_similarity IS NULL
                OR metadata_similarity BETWEEN 0 AND 100
            )
            AND
            (
                overall_similarity IS NULL
                OR overall_similarity BETWEEN 0 AND 100
            )
        )
);


-- ============================================================
-- ARTIFACTS
-- ============================================================

CREATE TABLE IF NOT EXISTS artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID
        REFERENCES documents(id)
        ON DELETE CASCADE,

    analysis_id UUID
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    artifact_type VARCHAR(100) NOT NULL,

    storage_bucket VARCHAR(255) NOT NULL,

    storage_path VARCHAR(1024) NOT NULL,

    mime_type VARCHAR(100),

    file_size BIGINT,

    metadata_json JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    report_type VARCHAR(100) NOT NULL DEFAULT 'pdf',

    storage_bucket VARCHAR(255) NOT NULL,

    storage_path VARCHAR(1024) NOT NULL,

    file_name VARCHAR(512) NOT NULL,

    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- VERIFICATION REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID NOT NULL
        REFERENCES documents(id)
        ON DELETE CASCADE,

    analysis_id UUID
        REFERENCES analyses(id)
        ON DELETE SET NULL,

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    status verification_status NOT NULL DEFAULT 'pending',

    verification_method VARCHAR(100),

    notes TEXT,

    reviewer_notes TEXT,

    verified_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES profiles(id)
        ON DELETE SET NULL,

    action VARCHAR(100) NOT NULL,

    resource_type VARCHAR(100),

    resource_id UUID,

    ip_address VARCHAR(100),

    user_agent VARCHAR(1024),

    details JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_documents_user_id
    ON documents(user_id);

CREATE INDEX IF NOT EXISTS idx_documents_status
    ON documents(status);

CREATE INDEX IF NOT EXISTS idx_documents_sha256
    ON documents(sha256_hash);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at
    ON documents(uploaded_at DESC);


CREATE INDEX IF NOT EXISTS idx_analyses_document_id
    ON analyses(document_id);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id
    ON analyses(user_id);

CREATE INDEX IF NOT EXISTS idx_analyses_status
    ON analyses(status);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at
    ON analyses(created_at DESC);


CREATE INDEX IF NOT EXISTS idx_analysis_layers_analysis_id
    ON analysis_layers(analysis_id);


CREATE INDEX IF NOT EXISTS idx_ocr_results_analysis_id
    ON ocr_results(analysis_id);


CREATE INDEX IF NOT EXISTS idx_anomalies_analysis_id
    ON anomalies(analysis_id);

CREATE INDEX IF NOT EXISTS idx_anomalies_type
    ON anomalies(anomaly_type);

CREATE INDEX IF NOT EXISTS idx_anomalies_severity
    ON anomalies(severity);


CREATE INDEX IF NOT EXISTS idx_document_dna_document_id
    ON document_dna(document_id);


CREATE INDEX IF NOT EXISTS idx_risk_factors_analysis_id
    ON risk_factors(analysis_id);


CREATE INDEX IF NOT EXISTS idx_comparisons_user_id
    ON comparisons(user_id);

CREATE INDEX IF NOT EXISTS idx_comparisons_document_a
    ON comparisons(document_a_id);

CREATE INDEX IF NOT EXISTS idx_comparisons_document_b
    ON comparisons(document_b_id);


CREATE INDEX IF NOT EXISTS idx_comparison_changes_comparison_id
    ON comparison_changes(comparison_id);


CREATE INDEX IF NOT EXISTS idx_comparison_dna_comparison_id
    ON comparison_dna(comparison_id);


CREATE INDEX IF NOT EXISTS idx_artifacts_user_id
    ON artifacts(user_id);

CREATE INDEX IF NOT EXISTS idx_artifacts_analysis_id
    ON artifacts(analysis_id);

CREATE INDEX IF NOT EXISTS idx_artifacts_document_id
    ON artifacts(document_id);


CREATE INDEX IF NOT EXISTS idx_reports_user_id
    ON reports(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_analysis_id
    ON reports(analysis_id);


CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id
    ON verification_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_verification_requests_document_id
    ON verification_requests(document_id);

CREATE INDEX IF NOT EXISTS idx_verification_requests_status
    ON verification_requests(status);


CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
    ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
    ON audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs(created_at DESC);


-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_profiles_updated_at
    ON profiles;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


DROP TRIGGER IF EXISTS update_documents_updated_at
    ON documents;

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


DROP TRIGGER IF EXISTS update_verification_requests_updated_at
    ON verification_requests;

CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- PROFILE CREATION TRIGGER
-- Automatically creates a profile whenever a Supabase Auth
-- user is created.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name'
        )
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS on_auth_user_created
    ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- END OF INITIAL SCHEMA
-- ============================================================
