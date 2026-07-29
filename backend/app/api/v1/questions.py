import re
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.question import Question, DifficultyEnum
from app.models.testcase import Testcase
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionListItemResponse,
    QuestionDetailResponse,
)
from app.schemas.testcase import TestcaseCreate, TestcaseResponse
from app.core.security import get_current_user, require_admin, UserSession

router = APIRouter(prefix="/questions", tags=["Questions"])

def slugify(text: str) -> str:
    """Helper function to convert problem title into URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text)

@router.get("", response_model=List[QuestionListItemResponse])
async def list_questions(
    search: Optional[str] = Query(None, description="Search by title or tag"),
    difficulty: Optional[DifficultyEnum] = Query(None, description="Filter by difficulty"),
    tag: Optional[str] = Query(None, description="Filter by specific tag"),
    db: Session = Depends(get_db),
):
    """
    Public Endpoint: List all questions with optional search, difficulty, and tag filtering.
    """
    query = db.query(Question)

    if difficulty:
        query = query.filter(Question.difficulty == difficulty)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Question.title.ilike(search_filter),
                Question.description.ilike(search_filter)
            )
        )

    if tag:
        query = query.filter(Question.tags.any(tag))

    questions = query.order_by(Question.created_at.desc()).all()
    return questions


@router.get("/{id_or_slug}", response_model=QuestionDetailResponse)
async def get_question_detail(
    id_or_slug: str,
    db: Session = Depends(get_db),
):
    """
    Public Endpoint: Get detailed question information by UUID or title_slug.
    Only returns non-hidden sample testcases to learners.
    """
    # Try finding by UUID or title_slug
    try:
        uuid_obj = UUID(id_or_slug)
        question = db.query(Question).filter(Question.id == uuid_obj).first()
    except ValueError:
        question = db.query(Question).filter(Question.title_slug == id_or_slug).first()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    # Fetch non-hidden sample test cases for user IDE testing
    sample_cases = db.query(Testcase).filter(
        Testcase.question_id == question.id,
        Testcase.is_hidden == False
    ).all()

    return QuestionDetailResponse(
        id=question.id,
        title=question.title,
        title_slug=question.title_slug,
        description=question.description,
        difficulty=question.difficulty,
        constraints=question.constraints or [],
        input_format=question.input_format,
        output_format=question.output_format,
        tags=question.tags or [],
        sample_cases=sample_cases,
        created_at=question.created_at,
        updated_at=question.updated_at,
    )


@router.post("", response_model=QuestionDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_in: QuestionCreate,
    db: Session = Depends(get_db),
    admin: UserSession = Depends(require_admin),
):
    """
    Admin Only Endpoint: Create a new question with optional public/hidden testcases.
    """
    slug = slugify(question_in.title)

    # Check for existing title_slug
    existing = db.query(Question).filter(Question.title_slug == slug).first()
    if existing:
        slug = f"{slug}-{int(Question.created_at.timestamp()) if hasattr(Question, 'created_at') else '1'}"

    new_question = Question(
        title=question_in.title,
        title_slug=slug,
        description=question_in.description,
        difficulty=question_in.difficulty,
        constraints=question_in.constraints,
        input_format=question_in.input_format,
        output_format=question_in.output_format,
        tags=question_in.tags,
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    # Add attached test cases
    created_testcases = []
    for tc in question_in.testcases:
        testcase_obj = Testcase(
            question_id=new_question.id,
            input=tc.input,
            expected_output=tc.expected_output,
            is_hidden=tc.is_hidden,
        )
        db.add(testcase_obj)
        created_testcases.append(testcase_obj)

    if created_testcases:
        db.commit()

    sample_cases = [tc for tc in created_testcases if not tc.is_hidden]

    return QuestionDetailResponse(
        id=new_question.id,
        title=new_question.title,
        title_slug=new_question.title_slug,
        description=new_question.description,
        difficulty=new_question.difficulty,
        constraints=new_question.constraints or [],
        input_format=new_question.input_format,
        output_format=new_question.output_format,
        tags=new_question.tags or [],
        sample_cases=sample_cases,
        created_at=new_question.created_at,
        updated_at=new_question.updated_at,
    )


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: UUID,
    db: Session = Depends(get_db),
    admin: UserSession = Depends(require_admin),
):
    """
    Admin Only Endpoint: Delete a question and associated testcases/submissions.
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    db.delete(question)
    db.commit()
    return None
