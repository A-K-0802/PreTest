from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.models.question import DifficultyEnum
from app.schemas.testcase import TestcaseCreate, TestcaseResponse

class QuestionCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    difficulty: DifficultyEnum
    constraints: List[str] = []
    input_format: str
    output_format: str
    tags: List[str] = []
    testcases: List[TestcaseCreate] = []

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[DifficultyEnum] = None
    constraints: Optional[List[str]] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    tags: Optional[List[str]] = None

class QuestionListItemResponse(BaseModel):
    id: UUID
    title: str
    title_slug: str
    difficulty: DifficultyEnum
    tags: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class QuestionDetailResponse(BaseModel):
    id: UUID
    title: str
    title_slug: str
    description: str
    difficulty: DifficultyEnum
    constraints: List[str]
    input_format: str
    output_format: str
    tags: List[str]
    sample_cases: List[TestcaseResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
