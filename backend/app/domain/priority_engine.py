from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class PriorityContributingFactors:
    urgency_points: float = 0.0
    risk_points: float = 0.0
    importance_points: float = 0.0
    effort_points: float = 0.0
    modifiers_points: float = 0.0
    details: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "urgency_points": round(self.urgency_points, 2),
            "risk_points": round(self.risk_points, 2),
            "importance_points": round(self.importance_points, 2),
            "effort_points": round(self.effort_points, 2),
            "modifiers_points": round(self.modifiers_points, 2),
            "details": self.details,
        }


@dataclass
class PriorityEvaluationResult:
    priority_score: float  # 0.00 to 100.00
    priority_level: PriorityLevel
    priority_explanation: str
    contributing_factors: PriorityContributingFactors

    def to_dict(self) -> Dict[str, Any]:
        return {
            "priority_score": round(self.priority_score, 2),
            "priority_level": self.priority_level.value,
            "priority_explanation": self.priority_explanation,
            "contributing_factors": self.contributing_factors.to_dict(),
        }


@dataclass
class WorkItemPriorityInput:
    item_id: str
    title: str
    status: str
    deadline_utc: Optional[datetime]
    remaining_hours: float
    importance_weight: float = 1.0  # 0.5 to 2.0
    risk_state: str = "safe"  # safe, watch, at_risk, critical, overdue
    risk_ratio: float = 0.0
    is_hard_deadline: bool = True
    completion_pct: int = 0
    is_blocked: bool = False
    unblocks_count: int = 0


class PriorityEngine:
    """
    Deterministic Dynamic Priority Engine for Deadline Radar.
    
    Computes a transparent, reproducible multi-factor priority score (0.00 to 100.00)
    combining deadline proximity urgency, risk ratio / capacity deficit, user importance,
    effort magnitude, and executable readiness.
    """

    @classmethod
    def evaluate(
        cls,
        item: WorkItemPriorityInput,
        current_time: Optional[datetime] = None,
    ) -> PriorityEvaluationResult:
        if current_time is None:
            current_time = datetime.now(timezone.utc)
        elif current_time.tzinfo is None:
            current_time = current_time.replace(tzinfo=timezone.utc)

        factors = PriorityContributingFactors()

        # Defensive fallbacks for optional or nullable fields
        completion_pct = item.completion_pct if item.completion_pct is not None else 0
        remaining_hours = max(0.0, item.remaining_hours if item.remaining_hours is not None else 0.0)
        importance_weight = item.importance_weight if item.importance_weight is not None else 1.0
        risk_ratio = item.risk_ratio if item.risk_ratio is not None else 0.0
        norm_risk = (item.risk_state or "safe").lower().strip()
        status_str = (item.status or "todo").lower().strip()

        # Terminal / Inactive states have 0 priority
        if status_str in {"completed", "done"}:
            return PriorityEvaluationResult(
                priority_score=0.0,
                priority_level=PriorityLevel.LOW,
                priority_explanation=f"Item '{item.title}' is completed.",
                contributing_factors=factors,
            )
        if status_str in {"cancelled", "archived"}:
            return PriorityEvaluationResult(
                priority_score=0.0,
                priority_level=PriorityLevel.LOW,
                priority_explanation=f"Item '{item.title}' is cancelled.",
                contributing_factors=factors,
            )

        # 1. Deadline Proximity Urgency (0 to 35 points)
        urgency_points = 0.0
        if item.deadline_utc is None:
            urgency_points = 5.0
            factors.details.append("No deadline specified: assigned baseline urgency (+5.0 pts)")
        else:
            deadline = item.deadline_utc
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)

            time_delta = deadline - current_time
            hours_until_deadline = time_delta.total_seconds() / 3600.0

            if hours_until_deadline < 0:
                # Overdue
                urgency_points = 35.0
                factors.details.append(
                    f"Overdue by {abs(hours_until_deadline):.1f}h: maximum urgency (+35.0 pts)"
                )
            elif hours_until_deadline <= 24.0:
                # Due within 24 hours: 30 - 34 pts
                urgency_points = 30.0 + max(0.0, (24.0 - hours_until_deadline) / 24.0 * 4.0)
                factors.details.append(
                    f"Due within 24h ({hours_until_deadline:.1f}h left): immediate urgency (+{urgency_points:.1f} pts)"
                )
            elif hours_until_deadline <= 48.0:
                # Due within 48 hours: 24 - 29 pts
                urgency_points = 24.0 + ((48.0 - hours_until_deadline) / 24.0 * 5.0)
                factors.details.append(
                    f"Due within 48h ({hours_until_deadline / 24.0:.1f} days): elevated urgency (+{urgency_points:.1f} pts)"
                )
            elif hours_until_deadline <= 168.0:  # 7 days
                # Due within 7 days: 14 - 23 pts
                days_left = hours_until_deadline / 24.0
                urgency_points = 14.0 + ((7.0 - days_left) / 5.0 * 9.0)
                factors.details.append(
                    f"Due this week ({days_left:.1f} days left): moderate urgency (+{urgency_points:.1f} pts)"
                )
            elif hours_until_deadline <= 336.0:  # 14 days
                days_left = hours_until_deadline / 24.0
                urgency_points = 8.0 + ((14.0 - days_left) / 7.0 * 5.0)
                factors.details.append(
                    f"Due in 2 weeks ({days_left:.1f} days left): (+{urgency_points:.1f} pts)"
                )
            else:
                days_left = hours_until_deadline / 24.0
                urgency_points = max(2.0, 8.0 - ((days_left - 14.0) / 14.0 * 4.0))
                factors.details.append(
                    f"Far deadline ({days_left:.0f} days left): minimal urgency (+{urgency_points:.1f} pts)"
                )

            if item.is_hard_deadline and hours_until_deadline > 0:
                urgency_points = min(35.0, urgency_points + 1.5)
                factors.details.append("Hard deadline: strict cutoff bonus (+1.5 pts)")

        factors.urgency_points = min(35.0, max(0.0, urgency_points))

        # 2. Risk State / Capacity Deficit (0 to 30 points)
        risk_points = 0.0
        if norm_risk == "overdue":
            risk_points = 30.0
            factors.details.append("Work is in OVERDUE state: critical risk penalty (+30.0 pts)")
        elif norm_risk == "critical" or risk_ratio > 1.05:
            # Capacity deficit
            risk_points = 26.0 + min(4.0, (risk_ratio - 1.05) * 10.0)
            factors.details.append(
                f"CRITICAL risk ratio ({risk_ratio:.2f}x capacity): (+{risk_points:.1f} pts)"
            )
        elif norm_risk == "at_risk" or risk_ratio > 0.85:
            risk_points = 18.0 + min(7.0, (risk_ratio - 0.85) / 0.20 * 7.0)
            factors.details.append(
                f"AT RISK ratio ({risk_ratio:.2f}x capacity): (+{risk_points:.1f} pts)"
            )
        elif norm_risk == "watch" or risk_ratio > 0.60:
            risk_points = 10.0 + min(7.0, (risk_ratio - 0.60) / 0.25 * 7.0)
            factors.details.append(
                f"WATCH buffer ({risk_ratio:.2f}x capacity): (+{risk_points:.1f} pts)"
            )
        else:
            risk_points = max(2.0, min(9.0, risk_ratio * 15.0))
            factors.details.append(
                f"SAFE buffer ({risk_ratio:.2f}x capacity): (+{risk_points:.1f} pts)"
            )

        factors.risk_points = min(30.0, max(0.0, risk_points))

        # 3. User Importance Weight (0 to 20 points)
        importance_points = 0.0
        if importance_weight >= 1.5:
            importance_points = 20.0
            factors.details.append(
                f"Critical user importance ({importance_weight:.1f}x): (+20.0 pts)"
            )
        elif importance_weight >= 1.2:
            importance_points = 15.0
            factors.details.append(
                f"High user importance ({importance_weight:.1f}x): (+15.0 pts)"
            )
        elif importance_weight >= 0.9:
            importance_points = 10.0
            factors.details.append(
                f"Standard user importance ({importance_weight:.1f}x): (+10.0 pts)"
            )
        else:
            importance_points = 5.0
            factors.details.append(
                f"Low user importance ({importance_weight:.1f}x): (+5.0 pts)"
            )

        factors.importance_points = min(20.0, max(0.0, importance_points))

        # 4. Workload / Effort Magnitude (0 to 10 points)
        effort_points = 0.0
        if remaining_hours >= 10.0:
            effort_points = 10.0
            factors.details.append(
                f"Heavy workload ({remaining_hours:.1f}h remaining): early focus required (+10.0 pts)"
            )
        elif remaining_hours >= 5.0:
            effort_points = 7.0 + ((remaining_hours - 5.0) / 5.0 * 2.5)
            factors.details.append(
                f"Substantial workload ({remaining_hours:.1f}h remaining): (+{effort_points:.1f} pts)"
            )
        elif remaining_hours >= 2.0:
            effort_points = 4.0 + ((remaining_hours - 2.0) / 3.0 * 2.5)
            factors.details.append(
                f"Moderate workload ({remaining_hours:.1f}h remaining): (+{effort_points:.1f} pts)"
            )
        elif remaining_hours > 0:
            effort_points = 2.0 + (remaining_hours / 2.0 * 1.5)
            factors.details.append(
                f"Light workload ({remaining_hours:.1f}h remaining): (+{effort_points:.1f} pts)"
            )
        else:
            effort_points = 0.0

        factors.effort_points = min(10.0, max(0.0, effort_points))

        # 5. Modifiers (-20 to +10 points)
        modifiers = 0.0
        if item.is_blocked:
            modifiers -= 20.0
            factors.details.append("Blocked by dependencies: reduced executable priority (-20.0 pts)")
        else:
            unblocks_cnt = item.unblocks_count or 0
            if unblocks_cnt > 0:
                bonus = min(6.0, unblocks_cnt * 2.0)
                modifiers += bonus
                factors.details.append(
                    f"Unblocks {unblocks_cnt} other task(s): blocker clearance bonus (+{bonus:.1f} pts)"
                )

            # Near-completion finish line momentum boost
            if completion_pct >= 75 and 0.0 < remaining_hours <= 2.0:
                modifiers += 4.0
                factors.details.append(
                    f"Near completion ({completion_pct}%, {remaining_hours:.1f}h left): finish-line boost (+4.0 pts)"
                )

        factors.modifiers_points = modifiers

        # Compute Total Raw Score
        raw_score = (
            factors.urgency_points
            + factors.risk_points
            + factors.importance_points
            + factors.effort_points
            + factors.modifiers_points
        )
        total_score = round(max(0.0, min(100.0, raw_score)), 2)

        # Determine Priority Level
        if total_score >= 80.0:
            level = PriorityLevel.CRITICAL
        elif total_score >= 60.0:
            level = PriorityLevel.HIGH
        elif total_score >= 40.0:
            level = PriorityLevel.MEDIUM
        else:
            level = PriorityLevel.LOW

        # Generate Human-Readable Priority Explanation
        explanation = cls._generate_explanation(item, total_score, level, factors)

        return PriorityEvaluationResult(
            priority_score=total_score,
            priority_level=level,
            priority_explanation=explanation,
            contributing_factors=factors,
        )

    @classmethod
    def rank_items(
        cls,
        items: List[WorkItemPriorityInput],
        current_time: Optional[datetime] = None,
    ) -> List[tuple[WorkItemPriorityInput, PriorityEvaluationResult]]:
        """
        Evaluates and sorts a list of work items deterministically.
        Order: priority_score DESC, deadline_utc ASC (earliest deadline first), remaining_hours DESC.
        """
        evaluated = []
        for item in items:
            result = cls.evaluate(item, current_time=current_time)
            evaluated.append((item, result))

        def sort_key(entry: tuple[WorkItemPriorityInput, PriorityEvaluationResult]):
            it, res = entry
            score = res.priority_score
            # For secondary deadline sort, use timestamp or large number if no deadline
            deadline_val = (
                it.deadline_utc.timestamp()
                if it.deadline_utc is not None
                else float("inf")
            )
            return (-score, deadline_val, -it.remaining_hours)

        evaluated.sort(key=sort_key)
        return evaluated

    @classmethod
    def _generate_explanation(
        cls,
        item: WorkItemPriorityInput,
        score: float,
        level: PriorityLevel,
        factors: PriorityContributingFactors,
    ) -> str:
        parts = []
        if factors.urgency_points >= 30.0:
            parts.append("imminent deadline urgency")
        elif factors.urgency_points >= 20.0:
            parts.append("approaching deadline")

        if factors.risk_points >= 25.0:
            parts.append("critical capacity deficit")
        elif factors.risk_points >= 17.0:
            parts.append("tight capacity buffer")

        if factors.importance_points >= 15.0:
            parts.append("high user importance")

        if item.remaining_hours >= 8.0:
            parts.append(f"{item.remaining_hours:.1f}h workload requiring focus")

        if item.is_blocked:
            parts.append("currently blocked by dependencies")

        if not parts:
            parts.append("standard progression and scheduled buffer")

        drivers = ", ".join(parts)
        return f"{level.value.upper()} priority ({score:.1f}/100) driven by {drivers}."
