import os
import sqlite3
import subprocess
import sys
from pathlib import Path


BACKEND = Path(__file__).resolve().parents[1]


def apply_migrations(database_url: str) -> None:
    env = {**os.environ, "DATABASE_URL": database_url, "APP_ENV": "development"}
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=BACKEND,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_initial_migration_creates_indexed_issues_table(tmp_path):
    database = tmp_path / "fresh.db"
    apply_migrations(f"sqlite:///{database}")

    with sqlite3.connect(database) as connection:
        columns = {row[1] for row in connection.execute("PRAGMA table_info(issues)")}
        indexes = {row[1] for row in connection.execute("PRAGMA index_list(issues)")}
        assert {"id", "type", "department", "status", "created_at"} <= columns
        assert {"ix_issues_type", "ix_issues_department", "ix_issues_status", "ix_issues_created_at"} <= indexes
        assert connection.execute("SELECT version_num FROM alembic_version").fetchone() == (
            "0001_legacy_issues",
        )


def test_initial_migration_preserves_legacy_issue_rows(tmp_path):
    database = tmp_path / "legacy.db"
    with sqlite3.connect(database) as connection:
        connection.execute(
            """
            CREATE TABLE issues (
                id INTEGER PRIMARY KEY,
                type VARCHAR NOT NULL,
                severity INTEGER NOT NULL,
                description VARCHAR NOT NULL,
                department VARCHAR NOT NULL,
                confidence FLOAT NOT NULL,
                lat FLOAT NOT NULL,
                lng FLOAT NOT NULL,
                image_url VARCHAR NOT NULL,
                note VARCHAR NOT NULL,
                status VARCHAR NOT NULL,
                duplicate_count INTEGER NOT NULL,
                priority_score FLOAT NOT NULL,
                created_at DATETIME NOT NULL
            )
            """
        )
        connection.execute(
            """
            INSERT INTO issues VALUES (
                42, 'pothole', 4, 'Legacy report', 'Roads', 0.8,
                22.7, 75.8, '/uploads/old.jpg', 'near park',
                'open', 2, 71.0, '2026-01-02 03:04:05'
            )
            """
        )

    apply_migrations(f"sqlite:///{database}")

    with sqlite3.connect(database) as connection:
        row = connection.execute(
            "SELECT id, type, description, status FROM issues WHERE id = 42"
        ).fetchone()
        assert row == (42, "pothole", "Legacy report", "open")
        assert connection.execute("SELECT COUNT(*) FROM issues").fetchone() == (1,)


def test_production_config_normalizes_postgres_url_and_rejects_sqlite():
    base_env = {
        **os.environ,
        "APP_ENV": "production",
        "FRONTEND_ORIGIN": "https://civiclens.example",
    }
    pg_env = {**base_env, "DATABASE_URL": "postgresql://user:pass@db.example/civiclens"}
    normalized = subprocess.run(
        [sys.executable, "-c", "from app.config import DATABASE_URL; print(DATABASE_URL)"],
        cwd=BACKEND,
        env=pg_env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert normalized.returncode == 0, normalized.stderr
    assert normalized.stdout.strip().startswith("postgresql+psycopg://")

    sqlite_env = {**base_env, "DATABASE_URL": "sqlite:///./civiclens.db"}
    rejected = subprocess.run(
        [sys.executable, "-c", "import app.config"],
        cwd=BACKEND,
        env=sqlite_env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert rejected.returncode != 0
    assert "Production requires a PostgreSQL DATABASE_URL" in rejected.stderr
