from uuid import UUID

from fastapi import APIRouter, Depends, Request, status

from app.core.security import get_current_user
from app.db.operations import create_audit_log
from app.schemas.audit_log import (
    AuditLogCreate,
    AuditLogResponse,
)


router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"],
)


@router.post(
    "/logs",
    response_model=AuditLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_audit_log_entry(
    request_data: AuditLogCreate,
    request: Request,
    current_user=Depends(get_current_user),
) -> AuditLogResponse:
    """
    Create an audit log entry for the authenticated user.
    """

    user_id = UUID(str(current_user.id))

    resource_id = None

    if request_data.entity_id:
        resource_id = UUID(request_data.entity_id)

    client_ip = (
        request.client.host
        if request.client
        else None
    )

    user_agent = request.headers.get(
        "user-agent"
    )

    details = dict(request_data.metadata)

    if request_data.entity_type:
        details["entity_type"] = request_data.entity_type

    if request_data.description:
        details["description"] = request_data.description

    audit_log = create_audit_log(
        action=request_data.action,
        user_id=user_id,
        resource_type=request_data.entity_type,
        resource_id=resource_id,
        ip_address=client_ip,
        user_agent=user_agent,
        details=details,
    )

    return AuditLogResponse(
        audit_id=str(audit_log.id),
        user_id=str(audit_log.user_id),
        action=audit_log.action,
        entity_type=(
            audit_log.resource_type
            or request_data.entity_type
        ),
        entity_id=(
            str(audit_log.resource_id)
            if audit_log.resource_id
            else None
        ),
        description=request_data.description,
        metadata=(
            audit_log.details
            if audit_log.details
            else {}
        ),
        created_at=(
            audit_log.created_at.isoformat()
            if audit_log.created_at
            else None
        ),
    )