from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    work_item_id: Optional[str] = None
    title: str
    message: str
    notification_type: str
    urgency_level: str
    is_read: bool
    created_at: str


class NotificationsListResponse(BaseModel):
    items: List[NotificationResponse]
    unread_count: int
    total: int


class RecalculationResponse(BaseModel):
    user_id: str
    items_recalculated: int
    risk_transitions: List[Dict[str, Any]] = []
    stale_sessions_closed: int = 0
    notifications_created: int = 0
