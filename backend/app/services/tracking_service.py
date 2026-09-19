from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictException, NotFoundException
from app.models.time_entry import ActiveSession, TimeEntry
from app.repositories.tracking_repo import TrackingRepository
from app.repositories.work_repo import WorkItemRepository
from app.schemas.common import PaginatedResponse
from app.schemas.tracking import (
    ActiveSessionResponse,
    ManualTimeEntryCreate,
    SessionStartRequest,
    SessionStartResponse,
    SessionStopRequest,
    SessionStopResponse,
    TimeEntryResponse,
)


class TrackingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.tracking_repo = TrackingRepository(db)
        self.work_repo = WorkItemRepository(db)

    def _format_entry(self, entry: TimeEntry) -> TimeEntryResponse:
        minutes = int(round(entry.duration_seconds / 60.0))
        return TimeEntryResponse(
            id=entry.id,
            work_item_id=entry.work_item_id,
            work_unit_id=entry.work_unit_id,
            start_time=entry.start_time.isoformat(),
            end_time=entry.end_time.isoformat(),
            duration_minutes=minutes,
            duration_hours=entry.duration_hours,
            source=entry.source,
            notes=entry.notes,
        )

    async def get_active_session(self, user_id: str) -> Optional[ActiveSessionResponse]:
        session = await self.tracking_repo.get_active_session(user_id)
        if not session:
            return None

        now = datetime.now(timezone.utc)
        started = session.started_at
        if started.tzinfo is None:
            started = started.replace(tzinfo=timezone.utc)
        elapsed = int((now - started).total_seconds())

        return ActiveSessionResponse(
            id=session.id,
            work_item_id=session.work_item_id,
            work_unit_id=session.work_unit_id,
            work_item_title=session.work_item.title if session.work_item else None,
            work_unit_title=session.work_unit.title if session.work_unit else None,
            started_at=started.isoformat(),
            elapsed_seconds=max(0, elapsed),
            is_active=session.is_active,
            notes=session.notes,
        )

    async def start_session(self, user_id: str, req: SessionStartRequest) -> SessionStartResponse:
        existing = await self.tracking_repo.get_active_session(user_id)
        if existing:
            raise ConflictException(
                message="An active timer session is already running. Stop it before starting a new one.",
                code="ACTIVE_SESSION_EXISTS",
            )

        if req.work_item_id:
            item = await self.work_repo.get_by_user(req.work_item_id, user_id)
            if not item:
                raise NotFoundException(
                    message=f"Work item '{req.work_item_id}' not found.",
                    code="WORK_ITEM_NOT_FOUND",
                )

        if req.work_unit_id:
            unit = await self.work_repo.get_unit(req.work_unit_id, user_id)
            if not unit:
                raise NotFoundException(
                    message=f"Work unit '{req.work_unit_id}' not found.",
                    code="WORK_UNIT_NOT_FOUND",
                )

        session = ActiveSession(
            user_id=user_id,
            work_item_id=req.work_item_id,
            work_unit_id=req.work_unit_id,
            notes=req.notes,
            started_at=datetime.now(timezone.utc),
            is_active=True,
        )
        await self.tracking_repo.create_active_session(session)
        await self.db.commit()

        active_view = await self.get_active_session(user_id)
        return SessionStartResponse(session=active_view)  # type: ignore[arg-type]

    async def stop_session(self, user_id: str, req: SessionStopRequest) -> SessionStopResponse:
        session = await self.tracking_repo.get_active_session(user_id)
        if not session:
            raise NotFoundException(
                message="No active stopwatch session found to stop.",
                code="NO_ACTIVE_SESSION",
            )

        stop_time = datetime.now(timezone.utc)
        start_time = session.started_at
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)

        duration_sec = max(1, int((stop_time - start_time).total_seconds()))
        duration_hours = round(duration_sec / 3600.0, 2)
        duration_minutes = max(1, int(round(duration_sec / 60.0)))

        notes = req.notes or session.notes

        time_entry = TimeEntry(
            user_id=user_id,
            work_item_id=session.work_item_id,
            work_unit_id=session.work_unit_id,
            start_time=start_time,
            end_time=stop_time,
            duration_seconds=duration_sec,
            duration_hours=duration_hours,
            source="stopwatch",
            notes=notes,
        )
        await self.tracking_repo.create_entry(time_entry)

        remaining_hours = None
        if session.work_item_id:
            item = await self.work_repo.get_by_user(session.work_item_id, user_id)
            if item:
                item.total_actual_hours = round(item.total_actual_hours + duration_hours, 2)
                item.remaining_estimated_hours = max(
                    0.0, round(item.remaining_estimated_hours - duration_hours, 2)
                )
                remaining_hours = item.remaining_estimated_hours

        if session.work_unit_id:
            unit = await self.work_repo.get_unit(session.work_unit_id, user_id)
            if unit:
                unit.actual_hours = round(unit.actual_hours + duration_hours, 2)

        await self.tracking_repo.delete_active_session(session)
        await self.db.commit()

        return SessionStopResponse(
            time_entry=self._format_entry(time_entry),
            work_item_remaining_hours=remaining_hours,
            pace_factor_updated=True,
        )

    async def create_manual_entry(
        self, user_id: str, req: ManualTimeEntryCreate
    ) -> TimeEntryResponse:
        start_time = req.start_time
        end_time = req.end_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)

        duration_sec = int((end_time - start_time).total_seconds())
        if req.duration_minutes is not None:
            duration_minutes = req.duration_minutes
            duration_hours = round(duration_minutes / 60.0, 2)
            duration_sec = duration_minutes * 60
        else:
            duration_minutes = max(1, int(round(duration_sec / 60.0)))
            duration_hours = round(duration_sec / 3600.0, 2)

        if req.work_item_id:
            item = await self.work_repo.get_by_user(req.work_item_id, user_id)
            if not item:
                raise NotFoundException(
                    message=f"Work item '{req.work_item_id}' not found.",
                    code="WORK_ITEM_NOT_FOUND",
                )
            item.total_actual_hours = round(item.total_actual_hours + duration_hours, 2)
            item.remaining_estimated_hours = max(
                0.0, round(item.remaining_estimated_hours - duration_hours, 2)
            )

        if req.work_unit_id:
            unit = await self.work_repo.get_unit(req.work_unit_id, user_id)
            if not unit:
                raise NotFoundException(
                    message=f"Work unit '{req.work_unit_id}' not found.",
                    code="WORK_UNIT_NOT_FOUND",
                )
            unit.actual_hours = round(unit.actual_hours + duration_hours, 2)

        entry = TimeEntry(
            user_id=user_id,
            work_item_id=req.work_item_id,
            work_unit_id=req.work_unit_id,
            start_time=start_time,
            end_time=end_time,
            duration_seconds=duration_sec,
            duration_hours=duration_hours,
            source="manual",
            notes=req.notes,
        )
        await self.tracking_repo.create_entry(entry)
        await self.db.commit()
        return self._format_entry(entry)

    async def list_entries(
        self,
        user_id: str,
        work_item_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[TimeEntryResponse]:
        offset = (page - 1) * page_size
        entries, total = await self.tracking_repo.list_entries(
            user_id=user_id,
            work_item_id=work_item_id,
            start_date=start_date,
            end_date=end_date,
            limit=page_size,
            offset=offset,
        )
        return PaginatedResponse(
            items=[self._format_entry(e) for e in entries],
            total=total,
            page=page,
            page_size=page_size,
            has_more=(offset + len(entries)) < total,
        )
