from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class TestcaseCreate(BaseModel):
    input: str
    expected_output: str
    is_hidden: bool = False

class TestcaseResponse(BaseModel):
    id: UUID
    question_id: UUID
    input: str
    expected_output: str
    is_hidden: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
