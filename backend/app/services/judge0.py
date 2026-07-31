import base64
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
        }
        if settings.JUDGE0_API_KEY:
            self.headers["X-RapidAPI-Key"] = settings.JUDGE0_API_KEY
            self.headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"

    async def execute_code(
        self,
        language: str,
        code: str,
        stdin: str = "",
        expected_output: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes code on Judge0 engine via synchronous wait query.
        Returns dictionary containing verdict, stdout, stderr, compile_output, time, memory.
        """
        lang_id = LANGUAGE_MAP.get(language.lower())
        if not lang_id:
            return {
                "verdict": VerdictEnum.RUNTIME_ERROR,
                "error_message": f"Unsupported language '{language}'",
                "stdout": "",
                "stderr": f"Language '{language}' is not supported.",
                "execution_time_ms": 0,
                "memory_kb": 0,
            }

        payload = {
            "source_code": encode_base64(code),
            "language_id": lang_id,
            "stdin": encode_base64(stdin),
            "expected_output": encode_base64(expected_output) if expected_output else None,
            "cpu_time_limit": 2.0,       # 2 second CPU timeout limit
            "memory_limit": 128000,      # 128 MB memory limit
        }

        # Query Judge0 with base64_encoded=true and wait=true for immediate response
        endpoint = f"{self.api_url}/submissions?base64_encoded=true&wait=true"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(endpoint, json=payload, headers=self.headers)
                
                if response.status_code not in (200, 201):
                    return {
                        "verdict": VerdictEnum.RUNTIME_ERROR,
                        "stdout": "",
                        "stderr": f"Judge0 API Returned HTTP Status {response.status_code}",
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
                execution_time_ms = int(float(execution_time) * 1000) if execution_time else 0
                memory_kb = data.get("memory", 0)

                verdict = map_judge0_status(status_id)

                # Cross-check stdout vs expected_output if present
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
