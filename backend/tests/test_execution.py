import pytest
from unittest.mock import patch
from app.models.submission import VerdictEnum

def test_run_code_cpp_success(client):
    """Test POST /api/v1/execution/run with valid C++ solution."""
    mock_result = {
        "verdict": VerdictEnum.ACCEPTED,
        "stdout": "0 1\n",
        "stderr": "",
        "compile_output": "",
        "execution_time_ms": 3,
        "memory_kb": 1040,
        "status_id": 3
    }

    with patch("app.services.judge0.judge0_service.execute_code", return_value=mock_result):
        response = client.post("/api/v1/execution/run", json={
            "code": "int main() {}",
            "language": "cpp",
            "stdin": "4\n2 7 11 15\n9",
            "expected_output": "0 1"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["verdict"] == "ACCEPTED"
        assert "0 1" in data["stdout"]

def test_run_code_cpp_wrong_answer(client):
    """Test POST /api/v1/execution/run with wrong output returns WRONG_ANSWER."""
    mock_result = {
        "verdict": VerdictEnum.WRONG_ANSWER,
        "stdout": "Hi\n",
        "stderr": "",
        "compile_output": "",
        "execution_time_ms": 3,
        "memory_kb": 1040,
        "status_id": 4
    }

    with patch("app.services.judge0.judge0_service.execute_code", return_value=mock_result):
        response = client.post("/api/v1/execution/run", json={
            "code": "int main() {}",
            "language": "cpp",
            "stdin": "4\n2 7 11 15\n9",
            "expected_output": "0 1"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["verdict"] == "WRONG_ANSWER"
        assert "Hi" in data["stdout"]

def test_run_code_unsupported_language(client):
    """Test POST /api/v1/execution/run with unsupported language returns RUNTIME_ERROR."""
    response = client.post("/api/v1/execution/run", json={
        "code": "print('hello')",
        "language": "rust",
        "stdin": ""
    })

    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "RUNTIME_ERROR"
    assert "Language 'rust' is not supported." in data["stderr"]

def test_submit_code_unauthenticated_returns_403(client):
    """Test POST /api/v1/execution/submit without Authorization header returns 403 Forbidden."""
    response = client.post("/api/v1/execution/submit", json={
        "question_id": "1",
        "language": "cpp",
        "code": "int main() { return 0; }"
    })

    assert response.status_code == 403

def test_submit_code_authenticated_success(client, learner_token):
    """Test POST /api/v1/execution/submit with valid Authorization header."""
    mock_result = {
        "verdict": VerdictEnum.ACCEPTED,
        "stdout": "0 1\n",
        "stderr": "",
        "compile_output": "",
        "execution_time_ms": 3,
        "memory_kb": 1040,
        "status_id": 3
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
        assert data["verdict"] == "ACCEPTED"
        assert data["passed_cases"] == 1
