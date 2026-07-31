import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TestPrep DSA Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Supabase credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://ofgmfcjlwvzhkpgdkspr.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")

    # Judge0 credentials (Default to free public Judge0 CE API)
    JUDGE0_API_URL: str = os.getenv("JUDGE0_API_URL", "https://ce.judge0.com")
    JUDGE0_API_KEY: str = os.getenv("JUDGE0_API_KEY", "")

    # CORS Origin list
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
