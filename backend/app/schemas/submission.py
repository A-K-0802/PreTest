from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.submission import VerdictEnum

class RunCodeRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""
    expected_output: Optional[str] = None

class RunCodeResponse(BaseModel):
    verdict: VerdictEnum
    stdout: str
    stderr: str
    compile_output: str
    execution_time_ms: int
    memory_kb: int

class SubmitCodeRequest(BaseModel):
    question_id: UUID
    language: str
    code: str

class SubmitCodeResponse(BaseModel):
    submission_id: UUID
    verdict: VerdictEnum
    passed_cases: int
    total_cases: int
    execution_time_ms: int
    memory_kb: int
    error_message: Optional[str] = None

class SubmissionListItemResponse(BaseModel):
    id: UUID
    question_id: UUID
    language: str
    verdict: VerdictEnum
    execution_time_ms: Optional[int]
    memory_kb: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
