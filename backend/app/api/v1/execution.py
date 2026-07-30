from typing import List
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
        stdin=request.stdin or "",
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
    and records submission verdict in database.
    """
    question = db.query(Question).filter(Question.id == request.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    testcases = db.query(Testcase).filter(Testcase.question_id == request.question_id).all()
    if not testcases:
        # Fallback testcase if question has no configured testcases yet
        testcases = [Testcase(input="2 3", expected_output="5", is_hidden=False)]

    passed_count = 0
    total_count = len(testcases)
    final_verdict = VerdictEnum.ACCEPTED
    max_time_ms = 0
    max_memory_kb = 0
    error_msg = None

    for tc in testcases:
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
            error_msg = exec_result["stderr"] or exec_result["compile_output"] or f"Failed on testcase input: {tc.input}"
            break  # Stop execution on first failing test case (LeetCode style)

    # Persist submission to PostgreSQL database
    new_submission = Submission(
        user_id=UUID(current_user.user_id),
        question_id=request.question_id,
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

    return SubmitCodeResponse(
        submission_id=new_submission.id,
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
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == UUID(current_user.user_id))
        .order_by(Submission.created_at.desc())
        .all()
    )
    return submissions
