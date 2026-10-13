from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Issue
from app.schemas import IssueOut, IssuePatch, StatsOut
from app.routes.auth import require_admin

router = APIRouter()

VALID_STATUSES = {"open", "assigned", "in_progress", "resolved"}


@router.get("/api/health")
def health():
    return {"ok": True}


@router.get("/api/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    total = db.query(func.count(Issue.id)).scalar()
    open_count = db.query(func.count(Issue.id)).filter(Issue.status == "open").scalar()
    in_progress = db.query(func.count(Issue.id)).filter(Issue.status == "in_progress").scalar()
    resolved = db.query(func.count(Issue.id)).filter(Issue.status == "resolved").scalar()

    rows = db.query(Issue.type, func.count(Issue.id)).group_by(Issue.type).all()
    by_type = {row[0]: row[1] for row in rows}

    return StatsOut(
        total=total or 0,
        open=open_count or 0,
        in_progress=in_progress or 0,
        resolved=resolved or 0,
        by_type=by_type,
    )


@router.get("/api/issues", response_model=list[IssueOut])
def list_issues(status: Optional[str] = None, db: Session = Depends(get_db), _=Depends(require_admin)):
    query = db.query(Issue)
    if status:
        if status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status. Use: {', '.join(VALID_STATUSES)}")
        query = query.filter(Issue.status == status)
    else:
        # Non-resolved first, resolved at the bottom — both sorted by priority desc
        issues = query.order_by(
            (Issue.status == "resolved").asc(),
            Issue.priority_score.desc(),
        ).all()
        return issues

    return query.order_by(Issue.priority_score.desc()).all()


@router.get("/api/issues/{issue_id}", response_model=IssueOut)
def get_issue(issue_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


VALID_DEPARTMENTS = {
    "Roads & Public Works",
    "Electricity Board",
    "Water & Drainage",
    "Sanitation",
    "General",
}


@router.patch("/api/issues/{issue_id}", response_model=IssueOut)
def update_issue(issue_id: int, body: IssuePatch, db: Session = Depends(get_db), _=Depends(require_admin)):
    if body.status is None and body.department is None:
        raise HTTPException(status_code=400, detail="Provide at least one field to update (status or department).")
    if body.status is not None and body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Use: {', '.join(VALID_STATUSES)}")
    if body.department is not None and body.department not in VALID_DEPARTMENTS:
        raise HTTPException(status_code=400, detail=f"Invalid department. Use: {', '.join(VALID_DEPARTMENTS)}")
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if body.status is not None:
        issue.status = body.status
    if body.department is not None:
        issue.department = body.department
    db.commit()
    db.refresh(issue)
    return issue
