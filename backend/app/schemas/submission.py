from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Union, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.submission import VerdictEnum

class RunCodeRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = Field(default="", alias="stdin")
    input: Optional[str] = None
    expected_output: Optional[str] = None

    def get_stdin(self) -> str:
        return self.stdin or self.input or ""

class RunCodeResponse(BaseModel):
    verdict: VerdictEnum
    stdout: str
    stderr: str
    compile_output: str
    execution_time_ms: int
    memory_kb: int

class SubmitCodeRequest(BaseModel):
    question_id: Union[UUID, str]
    question_slug: Optional[str] = None
    language: str
    code: str
    custom_testcases: Optional[List[Dict[str, Any]]] = None

class SubmitCodeResponse(BaseModel):
    submission_id: UUID
    verdict: VerdictEnum
    passed_cases: int
    total_cases: int
    execution_time_ms: int
    memory_kb: int
    error_message: Optional[str] = None
    compile_output: Optional[str] = None
    stderr: Optional[str] = None
    stdout: Optional[str] = None

class SubmissionListItemResponse(BaseModel):
    id: UUID
    question_id: UUID
    language: str
    verdict: VerdictEnum
    execution_time_ms: Optional[int]
    memory_kb: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
