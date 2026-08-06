import base64
import subprocess
import tempfile
import time
import os
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings
from app.models.submission import VerdictEnum

# Standard Language IDs supported on ce.judge0.com
LANGUAGE_MAP: Dict[str, int] = {
    "python": 71,       # Python (3.8.1)
    "cpp": 54,          # C++ (GCC 9.2.0)
    "java": 62,         # Java (OpenJDK 13.0.1)
    "javascript": 63,   # JavaScript (Node.js 12.14.0)
}

def encode_base64(text: Optional[str]) -> str:
    """Encodes string to base64 format for Judge0 transmission."""
    if not text:
        return ""
    return base64.b64encode(text.encode("utf-8")).decode("utf-8")

def decode_base64(encoded_text: Optional[str]) -> str:
    """Decodes base64 string returned by Judge0."""
    if not encoded_text:
        return ""
    try:
        return base64.b64decode(encoded_text).decode("utf-8")
    except Exception:
        return encoded_text or ""

def map_judge0_status(status_id: int) -> VerdictEnum:
    """
    Maps Judge0 numerical status code to platform VerdictEnum.
    Status Codes:
      3: Accepted
      4: Wrong Answer
      5: Time Limit Exceeded
      6: Compilation Error
      7..12: Runtime Error / Internal Error
    """
    if status_id == 3:
        return VerdictEnum.ACCEPTED
    elif status_id == 4:
        return VerdictEnum.WRONG_ANSWER
    elif status_id == 5:
        return VerdictEnum.TIME_LIMIT_EXCEEDED
    elif status_id == 6:
        return VerdictEnum.COMPILATION_ERROR
    else:
        return VerdictEnum.RUNTIME_ERROR

class Judge0Service:
    def __init__(self):
        self.api_url = settings.JUDGE0_API_URL.rstrip("/")
        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
        if settings.JUDGE0_API_KEY:
            self.headers["X-RapidAPI-Key"] = settings.JUDGE0_API_KEY
            self.headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"

    def _execute_python_local(self, code: str, stdin: str, expected_output: Optional[str]) -> Dict[str, Any]:
        """Local subprocess fallback evaluator for Python 3."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_path = f.name

        try:
            start_time = time.time()
            res = subprocess.run(
                ["python", temp_path],
                input=stdin,
                capture_output=True,
                text=True,
                timeout=2.0
            )
            duration_ms = int((time.time() - start_time) * 1000)
            
            stdout = res.stdout or ""
            stderr = res.stderr or ""

            if res.returncode != 0:
                return {
                    "verdict": VerdictEnum.RUNTIME_ERROR,
                    "stdout": stdout,
                    "stderr": stderr,
                    "compile_output": "",
                    "execution_time_ms": duration_ms,
                    "memory_kb": 12400,
                    "status_id": 11,
                }

            actual = stdout.strip()
            expected = (expected_output or "").strip()
            verdict = VerdictEnum.ACCEPTED if (not expected or actual == expected) else VerdictEnum.WRONG_ANSWER

            return {
                "verdict": verdict,
                "stdout": stdout,
                "stderr": stderr,
                "compile_output": "",
                "execution_time_ms": duration_ms,
                "memory_kb": 12400,
                "status_id": 3 if verdict == VerdictEnum.ACCEPTED else 4,
            }
        except subprocess.TimeoutExpired:
            return {
                "verdict": VerdictEnum.TIME_LIMIT_EXCEEDED,
                "stdout": "",
                "stderr": "Local Execution Timed Out after 2.0s.",
                "compile_output": "",
                "execution_time_ms": 2000,
                "memory_kb": 12400,
                "status_id": 5,
            }
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def _execute_js_local(self, code: str, stdin: str, expected_output: Optional[str]) -> Dict[str, Any]:
        """Local subprocess fallback evaluator for JavaScript (Node.js)."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            f.write(code)
            temp_path = f.name

        try:
            start_time = time.time()
            res = subprocess.run(
                ["node", temp_path],
                input=stdin,
                capture_output=True,
                text=True,
                timeout=2.0
            )
            duration_ms = int((time.time() - start_time) * 1000)
            
            stdout = res.stdout or ""
            stderr = res.stderr or ""

            if res.returncode != 0:
                return {
                    "verdict": VerdictEnum.RUNTIME_ERROR,
                    "stdout": stdout,
                    "stderr": stderr,
                    "compile_output": "",
                    "execution_time_ms": duration_ms,
                    "memory_kb": 15200,
                    "status_id": 11,
                }

            actual = stdout.strip()
            expected = (expected_output or "").strip()
            verdict = VerdictEnum.ACCEPTED if (not expected or actual == expected) else VerdictEnum.WRONG_ANSWER

            return {
                "verdict": verdict,
                "stdout": stdout,
                "stderr": stderr,
                "compile_output": "",
                "execution_time_ms": duration_ms,
                "memory_kb": 15200,
                "status_id": 3 if verdict == VerdictEnum.ACCEPTED else 4,
            }
        except subprocess.TimeoutExpired:
            return {
                "verdict": VerdictEnum.TIME_LIMIT_EXCEEDED,
                "stdout": "",
                "stderr": "Local Execution Timed Out after 2.0s.",
                "compile_output": "",
                "execution_time_ms": 2000,
                "memory_kb": 15200,
                "status_id": 5,
            }
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    async def execute_code(
        self,
        language: str,
        code: str,
        stdin: str = "",
        expected_output: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes code on Judge0 engine via synchronous wait query.
        Falls back seamlessly to local evaluation if public Judge0 instance is Cloudflare 530 rate-limited.
        """
        lang_str = language.lower()
        lang_id = LANGUAGE_MAP.get(lang_str)
        if not lang_id:
            return {
                "verdict": VerdictEnum.RUNTIME_ERROR,
                "error_message": f"Unsupported language '{language}'",
                "stdout": "",
                "stderr": f"Language '{language}' is not supported.",
                "compile_output": "",
                "execution_time_ms": 0,
                "memory_kb": 0,
                "status_id": 13,
            }

        payload = {
            "source_code": encode_base64(code),
            "language_id": lang_id,
            "stdin": encode_base64(stdin),
            "expected_output": encode_base64(expected_output) if expected_output else None,
            "cpu_time_limit": 2.0,       # 2 second CPU timeout limit
            "memory_limit": 128000,      # 128 MB memory limit
        }

        endpoint = f"{self.api_url}/submissions?base64_encoded=true&wait=true"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(endpoint, json=payload, headers=self.headers)
                
                if response.status_code not in (200, 201):
                    # Handle Cloudflare HTTP 530 or rate limits with local fallback evaluation
                    if lang_str == "python":
                        return self._execute_python_local(code, stdin, expected_output)
                    elif lang_str == "javascript":
                        return self._execute_js_local(code, stdin, expected_output)
                    else:
                        return {
                            "verdict": VerdictEnum.RUNTIME_ERROR,
                            "stdout": "",
                            "stderr": f"Judge0 Public API Service Notice (HTTP {response.status_code}): The free public endpoint ({self.api_url}) is currently experiencing Cloudflare rate-limiting. Please set JUDGE0_API_KEY in backend/.env for RapidAPI access or evaluate using Python 3 / JavaScript.",
                            "compile_output": "",
                            "execution_time_ms": 0,
                            "memory_kb": 0,
                            "status_id": 13,
                        }

                data = response.json()
                status_info = data.get("status", {})
                status_id = status_info.get("id", 13)

                stdout = decode_base64(data.get("stdout"))
                stderr = decode_base64(data.get("stderr"))
                compile_output = decode_base64(data.get("compile_output"))
                
                execution_time = data.get("time")
                execution_time_ms = int(float(execution_time) * 1000) if (execution_time is not None and execution_time != "") else 0
                raw_memory = data.get("memory")
                memory_kb = int(raw_memory) if (raw_memory is not None and raw_memory != "") else 0

                verdict = map_judge0_status(status_id)

                if expected_output and stdout.strip() != expected_output.strip() and verdict == VerdictEnum.ACCEPTED:
                    verdict = VerdictEnum.WRONG_ANSWER

                return {
                    "verdict": verdict,
                    "stdout": stdout,
                    "stderr": stderr,
                    "compile_output": compile_output,
                    "execution_time_ms": execution_time_ms,
                    "memory_kb": memory_kb,
                    "status_id": status_id,
                }
        except Exception as exc:
            if lang_str == "python":
                return self._execute_python_local(code, stdin, expected_output)
            elif lang_str == "javascript":
                return self._execute_js_local(code, stdin, expected_output)
            else:
                return {
                    "verdict": VerdictEnum.RUNTIME_ERROR,
                    "stdout": "",
                    "stderr": f"Failed to connect to Judge0 execution engine: {str(exc)}",
                    "compile_output": "",
                    "execution_time_ms": 0,
                    "memory_kb": 0,
                    "status_id": 13,
                }

judge0_service = Judge0Service()
