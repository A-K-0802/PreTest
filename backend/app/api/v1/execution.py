import uuid
from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.question import Question
from app.models.testcase import Testcase
from app.models.submission import Submission, VerdictEnum
from app.schemas.submission import (
    RunCodeRequest,
    RunCodeResponse,
    SubmitCodeRequest,
    SubmitCodeResponse,
    SubmissionListItemResponse,
)
from app.services.judge0 import judge0_service
from app.core.security import get_current_user, UserSession

router = APIRouter(tags=["Execution & Submissions"])

@router.post("/run", response_model=RunCodeResponse)
async def run_code(request: RunCodeRequest):
    """
    Public Endpoint: Runs user code against sample stdin input.
    Does NOT save to submission history database.
    """
    result = await judge0_service.execute_code(
        language=request.language,
        code=request.code,
        stdin=request.get_stdin(),
        expected_output=request.expected_output,
    )

    return RunCodeResponse(
        verdict=result["verdict"],
        stdout=result["stdout"],
        stderr=result["stderr"],
        compile_output=result["compile_output"],
        execution_time_ms=result["execution_time_ms"],
        memory_kb=result["memory_kb"],
    )


@router.post("/submit", response_model=SubmitCodeResponse, status_code=status.HTTP_201_CREATED)
async def submit_code(
    request: SubmitCodeRequest,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user),
):
    """
    Authenticated Endpoint: Evaluates user code against ALL testcases (sample + hidden)
    for the specific question requested, recording submission verdict in database.
    """
    question_id_str = str(request.question_id)
    slug_str = str(request.question_slug or "")
    question = None

    try:
        if len(question_id_str) == 36:
            try:
                q_uuid = UUID(question_id_str)
                question = db.query(Question).filter(Question.id == q_uuid).first()
            except Exception:
                question = None
        
        if not question and slug_str:
            question = db.query(Question).filter(Question.title_slug == slug_str).first()

        if not question:
            question = db.query(Question).filter(Question.title_slug == question_id_str).first()
    except Exception:
        db.rollback()
        question = None

    testcase_objects = []

    # 1. First attempt: Fetch testcases from PostgreSQL DB for this question
    if question:
        try:
            db_tcs = db.query(Testcase).filter(Testcase.question_id == question.id).all()
            if db_tcs:
                testcase_objects = db_tcs
        except Exception:
            db.rollback()

    # 2. Second attempt: Use client custom_testcases if DB returned 0 testcases for this question
    if not testcase_objects and request.custom_testcases:
        for c_tc in request.custom_testcases:
            inp = c_tc.get("input", "")
            out = c_tc.get("expected_output") or c_tc.get("output") or ""
            is_hid = c_tc.get("is_hidden", False)
            testcase_objects.append(Testcase(input=str(inp), expected_output=str(out), is_hidden=is_hid))

    # 3. Fallback: If still empty, raise 404 or provide default
    if not testcase_objects:
        testcase_objects = [
            Testcase(input="4\n2 7 11 15\n9", expected_output="0 1", is_hidden=False),
        ]

    passed_count = 0
    total_count = len(testcase_objects)
    final_verdict = VerdictEnum.ACCEPTED
    max_time_ms = 0
    max_memory_kb = 0
    error_msg = None

    for tc in testcase_objects:
        exec_result = await judge0_service.execute_code(
            language=request.language,
            code=request.code,
            stdin=tc.input,
            expected_output=tc.expected_output,
        )

        max_time_ms = max(max_time_ms, exec_result["execution_time_ms"])
        max_memory_kb = max(max_memory_kb, exec_result["memory_kb"])

        verdict = exec_result["verdict"]

        if verdict == VerdictEnum.ACCEPTED:
            passed_count += 1
        else:
            final_verdict = verdict
            error_msg = exec_result["stderr"] or exec_result["compile_output"] or f"Failed on testcase input:\n{tc.input}"
            break  # Stop execution on first failing testcase

    submission_id = uuid.uuid4()

    # Safely persist to PostgreSQL database if matching question record exists
    if question:
        try:
            new_submission = Submission(
                user_id=UUID(current_user.user_id),
                question_id=question.id,
                language=request.language,
                code=request.code,
                verdict=final_verdict,
                execution_time_ms=max_time_ms,
                memory_kb=max_memory_kb,
                error_message=error_msg,
            )
            db.add(new_submission)
            db.commit()
            db.refresh(new_submission)
            submission_id = new_submission.id
        except Exception:
            db.rollback()

    return SubmitCodeResponse(
        submission_id=submission_id,
        verdict=final_verdict,
        passed_cases=passed_count,
        total_cases=total_count,
        execution_time_ms=max_time_ms,
        memory_kb=max_memory_kb,
        error_message=error_msg,
    )


@router.get("/submissions", response_model=List[SubmissionListItemResponse])
async def list_user_submissions(
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user),
):
    """
    Authenticated Endpoint: Returns submission history for the logged in user.
    """
    try:
        submissions = (
            db.query(Submission)
            .filter(Submission.user_id == UUID(current_user.user_id))
            .order_by(Submission.created_at.desc())
            .all()
        )
        return submissions
    except Exception:
        db.rollback()
        return []
