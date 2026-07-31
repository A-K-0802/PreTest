import pytest

def test_run_code_cpp_success(client):
    """Test POST /api/v1/execution/run with valid C++ solution."""
    cpp_code = """#include <iostream>
using namespace std;
int main() {
    int n, a, b, c, d, k;
    if (cin >> n >> a >> b >> c >> d >> k) {
        cout << "0 1" << endl;
    }
    return 0;
}"""

    response = client.post("/api/v1/execution/run", json={
        "code": cpp_code,
        "language": "cpp",
        "stdin": "4\n2 7 11 15\n9",
        "expected_output": "0 1"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "ACCEPTED"
    assert "0 1" in data["stdout"]

def test_run_code_cpp_wrong_answer(client):
    """Test POST /api/v1/execution/run with cout << 'Hi' returns WRONG_ANSWER."""
    cpp_hi_code = """#include <iostream>
using namespace std;
int main() {
    cout << "Hi" << endl;
    return 0;
}"""

    response = client.post("/api/v1/execution/run", json={
        "code": cpp_hi_code,
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
    """Test POST /api/v1/execution/submit with valid Authorization header and question_id '1'."""
    cpp_solution = """#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int comp = target - nums[i];
        if (seen.count(comp)) {
            cout << seen[comp] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}"""

    headers = {"Authorization": f"Bearer {learner_token}"}
    response = client.post("/api/v1/execution/submit", json={
        "question_id": "1",
        "language": "cpp",
        "code": cpp_solution
    }, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert "submission_id" in data
    assert data["passed_cases"] >= 1
    assert "total_cases" in data
