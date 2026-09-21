from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


REQUIRED_ENDPOINTS = [
    "/api/auth/signup",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/documents/upload",
    "/api/documents/{document_id}/download",
    "/api/analysis/documents/{document_id}/preprocess",
    "/api/analysis/documents/{document_id}/ocr",
    "/api/analysis/documents/{document_id}/metadata",
    "/api/analysis/documents/{document_id}/cv",
    "/api/analysis/documents/{document_id}/anomalies",
    "/api/analysis/documents/{document_id}/risk",
    "/api/analysis/documents/{document_id}/full-analysis",
    "/api/analysis/documents/{document_id}/heatmap",
    "/api/analysis/documents/{document_id}/explain-risk",
    "/api/analysis/documents/{document_id}/dna",
    "/api/analysis/documents/{document_a_id}/compare/{document_b_id}",
    "/api/analysis/documents/{document_a_id}/change-detection/{document_b_id}",
    "/api/analysis/reports",
    "/api/analysis/reports/{analysis_id}",
    "/api/analysis/history",
    "/api/verification/requests",
    "/api/audit/logs",
]


PROTECTED_ENDPOINTS = [
    (
        "GET",
        "/api/documents/00000000-0000-0000-0000-000000000000/download",
    ),
    (
        "POST",
        "/api/analysis/documents/00000000-0000-0000-0000-000000000000/preprocess",
    ),
    (
        "POST",
        "/api/analysis/documents/00000000-0000-0000-0000-000000000000/ocr",
    ),
    (
        "POST",
        "/api/analysis/documents/00000000-0000-0000-0000-000000000000/metadata",
    ),
    (
        "POST",
        "/api/analysis/documents/00000000-0000-0000-0000-000000000000/cv",
    ),
    (
        "POST",
        "/api/analysis/documents/00000000-0000-0000-0000-000000000000/anomalies",
    ),
    (
        "POST",
        "/api/analysis/documents/00000000-0000-0000-0000-000000000000/risk",
    ),
    (
        "POST",
        "/api/analysis/documents/00000000-0000-0000-0000-000000000000/full-analysis",
    ),
    (
        "GET",
        "/api/analysis/history",
    ),
    (
        "GET",
        "/api/analysis/reports",
    ),
    (
        "POST",
        "/api/verification/requests",
    ),
]


def request_without_authentication(method: str, path: str):
    if method == "GET":
        return client.get(path)

    if method == "POST":
        return client.post(path, json={})

    if method == "PUT":
        return client.put(path, json={})

    if method == "PATCH":
        return client.patch(path, json={})

    if method == "DELETE":
        return client.delete(path)

    raise AssertionError(
        f"Unsupported HTTP method in test: {method}"
    )


def test_application_imports():
    assert app is not None
    assert app.title


def test_health_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "VerfiX backend is running"
    assert "version" in data


def test_openapi_generation():
    response = client.get("/openapi.json")

    assert response.status_code == 200

    schema = response.json()

    assert "paths" in schema
    assert len(schema["paths"]) >= len(REQUIRED_ENDPOINTS)


def test_required_endpoints_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    missing = [
        endpoint
        for endpoint in REQUIRED_ENDPOINTS
        if endpoint not in paths
    ]

    assert not missing, (
        "Missing required endpoints: "
        + ", ".join(missing)
    )


def test_document_upload_endpoint_is_registered():
    schema = app.openapi()

    assert "/api/documents/upload" in schema["paths"]
    assert "post" in schema["paths"]["/api/documents/upload"]


def test_document_download_endpoint_is_registered():
    schema = app.openapi()

    assert "/api/documents/{document_id}/download" in schema["paths"]
    assert "get" in schema["paths"][
        "/api/documents/{document_id}/download"
    ]


def test_analysis_endpoints_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    analysis_paths = [
        path
        for path in paths
        if path.startswith("/api/analysis/")
    ]

    assert len(analysis_paths) >= 15


def test_protected_endpoints_reject_missing_authentication():
    for method, path in PROTECTED_ENDPOINTS:
        response = request_without_authentication(
            method,
            path,
        )

        assert response.status_code in {
            401,
            403,
        }, (
            f"{method} {path} did not reject "
            f"missing authentication. "
            f"Returned {response.status_code}."
        )


def test_audit_logs_endpoint_is_protected():
    schema = app.openapi()

    audit_path = schema["paths"].get(
        "/api/audit/logs"
    )

    assert audit_path is not None

    allowed_methods = [
        method.upper()
        for method in audit_path
        if method.lower()
        in {
            "get",
            "post",
            "put",
            "patch",
            "delete",
        }
    ]

    assert allowed_methods

    for method in allowed_methods:
        response = request_without_authentication(
            method,
            "/api/audit/logs",
        )

        assert response.status_code in {
            401,
            403,
        }, (
            f"{method} /api/audit/logs did not reject "
            f"missing authentication. "
            f"Returned {response.status_code}."
        )


def test_invalid_document_uuid_is_rejected():
    response = client.get(
        "/api/documents/not-a-valid-uuid/download"
    )

    assert response.status_code in {
        400,
        401,
        404,
    }


def test_unknown_document_download_does_not_return_success():
    response = client.get(
        "/api/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "download"
    )

    assert response.status_code in {
        401,
        403,
        404,
    }


def test_unknown_document_analysis_does_not_return_success():
    response = client.post(
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "full-analysis"
    )

    assert response.status_code in {
        401,
        403,
        404,
    }


def test_no_internal_server_error_for_missing_authentication():
    for method, path in PROTECTED_ENDPOINTS:
        response = request_without_authentication(
            method,
            path,
        )

        assert response.status_code != 500, (
            f"{method} {path} returned HTTP 500 "
            "without authentication."
        )


def test_no_internal_server_error_for_audit_logs():
    schema = app.openapi()

    audit_path = schema["paths"].get(
        "/api/audit/logs"
    )

    assert audit_path is not None

    allowed_methods = [
        method.upper()
        for method in audit_path
        if method.lower()
        in {
            "get",
            "post",
            "put",
            "patch",
            "delete",
        }
    ]

    for method in allowed_methods:
        response = request_without_authentication(
            method,
            "/api/audit/logs",
        )

        assert response.status_code != 500
