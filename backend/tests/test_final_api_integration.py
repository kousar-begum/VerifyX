from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


EXPECTED_ENDPOINTS = {
    "GET": [
        "/api/documents/{document_id}/download",
        "/api/analysis/history",
        "/api/analysis/reports",
    ],
    "POST": [
        "/api/auth/signup",
        "/api/auth/login",
        "/api/auth/logout",
        "/api/documents/upload",
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
        "/api/analysis/reports/{analysis_id}",
        "/api/verification/requests",
    ],
}


PROTECTED_TEST_ROUTES = [
    (
        "GET",
        "/api/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "download",
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
        "/api/auth/logout",
    ),
    (
        "POST",
        "/api/documents/upload",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "preprocess",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "ocr",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "metadata",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "cv",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "anomalies",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "risk",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "full-analysis",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "heatmap",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "explain-risk",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "dna",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "compare/"
        "00000000-0000-0000-0000-000000000001",
    ),
    (
        "POST",
        "/api/analysis/documents/"
        "00000000-0000-0000-0000-000000000000/"
        "change-detection/"
        "00000000-0000-0000-0000-000000000001",
    ),
    (
        "POST",
        "/api/analysis/reports/"
        "00000000-0000-0000-0000-000000000000",
    ),
    (
        "POST",
        "/api/verification/requests",
    ),
]


def _request_without_auth(method: str, path: str):
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
        f"Unsupported HTTP method: {method}"
    )


def test_final_api_root_is_available():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "VerfiX backend is running"
    assert "version" in data


def test_final_api_openapi_is_available():
    response = client.get("/openapi.json")

    assert response.status_code == 200

    schema = response.json()

    assert "openapi" in schema
    assert "paths" in schema
    assert len(schema["paths"]) >= 23


def test_all_expected_api_paths_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    missing = []

    for method, endpoints in EXPECTED_ENDPOINTS.items():
        for endpoint in endpoints:
            if endpoint not in paths:
                missing.append(
                    f"{method} {endpoint}"
                )
                continue

            if method.lower() not in paths[endpoint]:
                missing.append(
                    f"{method} {endpoint}"
                )

    assert not missing, (
        "Missing or incorrectly registered API routes: "
        + ", ".join(missing)
    )


def test_api_route_count_is_expected():
    schema = app.openapi()

    assert len(schema["paths"]) == 23


def test_authentication_routes_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    assert "/api/auth/signup" in paths
    assert "/api/auth/login" in paths
    assert "/api/auth/logout" in paths

    assert "post" in paths["/api/auth/signup"]
    assert "post" in paths["/api/auth/login"]
    assert "post" in paths["/api/auth/logout"]


def test_document_routes_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    assert "/api/documents/upload" in paths
    assert "/api/documents/{document_id}/download" in paths

    assert "post" in paths[
        "/api/documents/upload"
    ]

    assert "get" in paths[
        "/api/documents/{document_id}/download"
    ]


def test_analysis_pipeline_routes_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    required_analysis_routes = [
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
    ]

    for route in required_analysis_routes:
        assert route in paths
        assert "post" in paths[route]


def test_comparison_routes_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    assert (
        "/api/analysis/documents/"
        "{document_a_id}/compare/{document_b_id}"
    ) in paths

    assert (
        "/api/analysis/documents/"
        "{document_a_id}/change-detection/{document_b_id}"
    ) in paths

    assert (
        "post"
        in paths[
            "/api/analysis/documents/"
            "{document_a_id}/compare/{document_b_id}"
        ]
    )

    assert (
        "post"
        in paths[
            "/api/analysis/documents/"
            "{document_a_id}/change-detection/{document_b_id}"
        ]
    )


def test_reporting_and_workflow_routes_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    assert "/api/analysis/reports" in paths
    assert "/api/analysis/reports/{analysis_id}" in paths
    assert "/api/analysis/history" in paths
    assert "/api/verification/requests" in paths
    assert "/api/audit/logs" in paths


def test_protected_api_routes_reject_missing_authentication():
    for method, path in PROTECTED_TEST_ROUTES:
        response = _request_without_auth(
            method,
            path,
        )

        assert response.status_code in {
            401,
            403,
        }, (
            f"{method} {path} should require authentication "
            f"but returned HTTP {response.status_code}."
        )


def test_public_auth_routes_do_not_require_authentication_dependency():
    schema = app.openapi()

    for route in [
        "/api/auth/signup",
        "/api/auth/login",
    ]:
        operations = schema["paths"][route]

        for method_name, operation in operations.items():
            if method_name.lower() not in {
                "get",
                "post",
                "put",
                "patch",
                "delete",
            }:
                continue

            security = operation.get("security", [])

            assert security == [], (
                f"{method_name.upper()} {route} "
                "unexpectedly requires authentication."
            )


def test_protected_routes_have_security_definition():
    schema = app.openapi()

    protected_routes = [
        "/api/auth/logout",
        "/api/documents/upload",
        "/api/documents/{document_id}/download",
        "/api/analysis/history",
        "/api/analysis/reports",
        "/api/verification/requests",
        "/api/audit/logs",
    ]

    for route in protected_routes:
        assert route in schema["paths"]

        operations = schema["paths"][route]

        methods = [
            method
            for method in operations
            if method.lower() in {
                "get",
                "post",
                "put",
                "patch",
                "delete",
            }
        ]

        assert methods

        for method in methods:
            operation = operations[method]

            assert "security" in operation, (
                f"{method.upper()} {route} "
                "does not expose an authentication security definition."
            )


def test_invalid_document_download_is_not_successful():
    response = client.get(
        "/api/documents/not-a-valid-uuid/download"
    )

    assert response.status_code in {
        400,
        401,
        403,
        404,
    }

    assert response.status_code != 200


def test_unknown_document_download_is_not_successful():
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

    assert response.status_code != 200


def test_unknown_document_full_analysis_is_not_successful():
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

    assert response.status_code != 200


def test_no_protected_route_returns_internal_server_error_without_auth():
    for method, path in PROTECTED_TEST_ROUTES:
        response = _request_without_auth(
            method,
            path,
        )

        assert response.status_code != 500, (
            f"{method} {path} returned HTTP 500 "
            "without authentication."
        )
