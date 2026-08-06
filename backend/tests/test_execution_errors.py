import pytest
from unittest.mock import patch
from app.models.submission import VerdictEnum

def test_run_code_syntax_compilation_error(client):
    """Test POST /api/v1/execution/run with invalid syntax returns COMPILATION_ERROR."""
    mock_result = {
        "verdict": VerdictEnum.COMPILATION_ERROR,
        "stdout": "",
        "stderr": "syntax error near unexpected token",
        "compile_output": "error: expected primary-expression before '{' token",
        "execution_time_ms": 0,
        "memory_kb": 0,
        "status_id": 6
    }

    with patch("app.services.judge0.judge0_service.execute_code", return_value=mock_result):
        response = client.post("/api/v1/execution/run", json={
            "code": "int main( {",
            "language": "cpp",
            "stdin": "4\n2 7 11 15\n9",
            "expected_output": "0 1"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["verdict"] == "COMPILATION_ERROR"
        assert len(data["compile_output"]) > 0 or len(data["stderr"]) > 0

def test_run_code_python_runtime_error(client):
    """Test POST /api/v1/execution/run with division by zero returns RUNTIME_ERROR."""
    response = client.post("/api/v1/execution/run", json={
        "code": "import sys\nx = 1 / 0\n",
        "language": "python",
        "stdin": "",
        "expected_output": "0"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "RUNTIME_ERROR"
    assert "ZeroDivisionError" in data["stderr"] or "ZeroDivisionError" in data["stdout"] or len(data["stderr"]) > 0

def test_submit_code_wrong_answer_returns_error_message(client, learner_token):
    """Test POST /api/v1/execution/submit with wrong code returns WRONG_ANSWER and detailed error_message."""
    mock_result = {
        "verdict": VerdictEnum.WRONG_ANSWER,
        "stdout": "999 999\n",
        "stderr": "",
        "compile_output": "",
        "execution_time_ms": 3,
        "memory_kb": 1040,
        "status_id": 4
    }

    headers = {"Authorization": f"Bearer {learner_token}"}
    with patch("app.services.judge0.judge0_service.execute_code", return_value=mock_result):
        response = client.post("/api/v1/execution/submit", json={
            "question_id": "two-sum",
            "question_slug": "two-sum",
            "language": "cpp",
            "code": "int main() {}",
            "custom_testcases": [{"input": "4\n2 7 11 15\n9", "expected_output": "0 1"}]
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["verdict"] == "WRONG_ANSWER"
        assert data["passed_cases"] == 0
        assert data["error_message"] is not None
