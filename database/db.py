"""
Database Engine for InsightFlow AI.
Manages in-memory analytical SQL storage using DuckDB (with SQLite fallback),
data registration, security query guardrails, and schema reflection.
"""

import time
import re
from typing import Tuple, Dict, Any, Optional
import pandas as pd

try:
    import duckdb
    HAS_DUCKDB = True
except ImportError:
    HAS_DUCKDB = False

import sqlite3


class DatabaseEngine:
    def __init__(self, prefer_duckdb: bool = True):
        self.use_duckdb = HAS_DUCKDB and prefer_duckdb
        self.duck_conn = None
        self.sqlite_conn = None
        self._init_connection()

    def _init_connection(self):
        if self.use_duckdb:
            self.duck_conn = duckdb.connect(database=":memory:")
        else:
            self.sqlite_conn = sqlite3.connect(":memory:", check_same_thread=False)

    def register_dataframe(self, df: pd.DataFrame, table_name: str = "dataset"):
        """Registers a pandas DataFrame into the SQL engine."""
        # Sanitize column names for SQL safety
        safe_df = df.copy()
        safe_df.columns = [re.sub(r"[^\w]", "_", str(c)) for c in safe_df.columns]

        if self.use_duckdb:
            self.duck_conn.register(table_name, safe_df)
        else:
            safe_df.to_sql(table_name, self.sqlite_conn, if_exists="replace", index=False)

    def execute_query(self, sql: str, max_rows: int = 1000) -> Tuple[pd.DataFrame, float, Optional[str]]:
        """
        Executes a read-only analytical SQL query against the registered dataset.
        
        Returns:
            (result_df, execution_time_ms, error_message)
        """
        sql_clean = sql.strip().rstrip(";")
        
        # Security Guardrail: Read-Only Enforcement
        forbidden_patterns = [
            r"\bDROP\b", r"\bDELETE\b", r"\bTRUNCATE\b", r"\bUPDATE\b",
            r"\bALTER\b", r"\bINSERT\b", r"\bATTACH\b", r"\bDETACH\b",
            r"\bCOPY\b", r"\bPRAGMA\b", r"\bEXEC\b"
        ]
        for pattern in forbidden_patterns:
            if re.search(pattern, sql_clean, re.IGNORECASE):
                return pd.DataFrame(), 0.0, f"Security Violation: Query contains prohibited keyword '{pattern}'."

        if not re.match(r"^(SELECT|WITH)\b", sql_clean, re.IGNORECASE):
            return pd.DataFrame(), 0.0, "Security Violation: Only SELECT or WITH (CTE) queries are permitted."

        start_t = time.perf_counter()
        try:
            if self.use_duckdb:
                result_df = self.duck_conn.execute(sql_clean).fetchdf()
            else:
                result_df = pd.read_sql_query(sql_clean, self.sqlite_conn)

            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
            if len(result_df) > max_rows:
                result_df = result_df.head(max_rows)
            return result_df, elapsed_ms, None
        except Exception as e:
            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
            return pd.DataFrame(), elapsed_ms, str(e)

    def get_table_schema(self, table_name: str = "dataset") -> Dict[str, str]:
        """Returns column names and their inferred SQL datatypes."""
        try:
            if self.use_duckdb:
                schema_df = self.duck_conn.execute(f"DESCRIBE {table_name}").fetchdf()
                return dict(zip(schema_df["column_name"], schema_df["column_type"]))
            else:
                cursor = self.sqlite_conn.cursor()
                cursor.execute(f"PRAGMA table_info({table_name});")
                rows = cursor.fetchall()
                return {row[1]: row[2] for row in rows}
        except Exception:
            return {}

