import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "DSA Practice Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Supabase credentials (loaded from env)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")

    # Judge0 credentials
    JUDGE0_API_URL: str = os.getenv("JUDGE0_API_URL", "http://localhost:2358")
    JUDGE0_API_KEY: str = os.getenv("JUDGE0_API_KEY", "")

    # CORS Origin list
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
