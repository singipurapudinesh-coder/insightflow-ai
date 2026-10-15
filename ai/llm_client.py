"""
LLM Client for InsightFlow AI.
Connects with Google Gemini API (or OpenAI), and includes a robust
offline NLP heuristic fallback engine for offline campus demonstrations.
"""

import os
import re
import json
from typing import Dict, Any, Optional

from ai.prompt_templates import get_copilot_system_prompt, build_question_prompt


class LLMClient:
    def __init__(
        self,
        gemini_api_key: Optional[str] = None,
        openai_api_key: Optional[str] = None,
        preferred_provider: str = "gemini"
    ):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.provider = preferred_provider

    def query_copilot(self, question: str, schema_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Translates a natural language question into a structured JSON query plan.
        Tries active LLM provider first; falls back to Smart Rule-Based Engine if offline.
        """
        # Try Gemini API if key is present
        if self.gemini_api_key and self.provider == "gemini":
            try:
                return self._call_gemini(question, schema_info)
            except Exception as e:
                # Fallback to heuristic parser with notification
                fallback_plan = self._heuristic_parse(question, schema_info)
                fallback_plan["explanation"] += f" (Note: Gemini API fallback used due to: {str(e)[:60]}...)"
                return fallback_plan

        # Try OpenAI API if key is present
        if self.openai_api_key and self.provider == "openai":
            try:
                return self._call_openai(question, schema_info)
            except Exception as e:
                fallback_plan = self._heuristic_parse(question, schema_info)
                fallback_plan["explanation"] += f" (Note: OpenAI API fallback used due to: {str(e)[:60]}...)"
                return fallback_plan

        # Offline / Demo Mode: Heuristic NLP Parser
        return self._heuristic_parse(question, schema_info)

    def _call_gemini(self, question: str, schema_info: Dict[str, Any]) -> Dict[str, Any]:
        """Uses google-genai or google.generativeai SDK."""
        prompt = build_question_prompt(question, schema_info)
        system_inst = get_copilot_system_prompt()

        try:
            from google import genai
            client = genai.Client(api_key=self.gemini_api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"system_instruction": system_inst, "temperature": 0.1}
            )
            raw_text = response.text
        except Exception:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=self.gemini_api_key)
            model = legacy_genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_inst
            )
            response = model.generate_content(prompt)
            raw_text = response.text

        return self._clean_and_parse_json(raw_text)

    def _call_openai(self, question: str, schema_info: Dict[str, Any]) -> Dict[str, Any]:
        from openai import OpenAI
        client = OpenAI(api_key=self.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": get_copilot_system_prompt()},
                {"role": "user", "content": build_question_prompt(question, schema_info)}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)

    def _clean_and_parse_json(self, raw_text: str) -> Dict[str, Any]:
        """Extracts JSON substring from markdown-wrapped response."""
        cleaned = re.sub(r"^```(?:json)?", "", raw_text.strip(), flags=re.MULTILINE)
        cleaned = re.sub(r"```$", "", cleaned.strip(), flags=re.MULTILINE).strip()
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(cleaned)

    def _heuristic_parse(self, question: str, schema_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Smart Rule-Based NLP Parser.
        Operates without internet/API keys by inspecting schema columns and question tokens.
        """
        q_lower = question.lower()
        num_cols = schema_info.get("numeric_columns", [])
        cat_cols = schema_info.get("categorical_columns", [])
        dt_cols = schema_info.get("datetime_columns", [])
        all_cols = [c["name"] for c in schema_info.get("columns", [])]

        # 1. Identify Target Metric
        detected_metric = None
        for col in num_cols:
            if col.lower() in q_lower or col.lower().replace("_", " ") in q_lower:
                detected_metric = col
                break
        if not detected_metric and num_cols:
            # Common synonyms
            if any(w in q_lower for w in ["revenue", "turnover", "sales", "income"]):
                sales_candidates = [c for c in num_cols if "sale" in c.lower() or "rev" in c.lower()]
                detected_metric = sales_candidates[0] if sales_candidates else num_cols[0]
            elif any(w in q_lower for w in ["profit", "margin", "gain"]):
                profit_candidates = [c for c in num_cols if "profit" in c.lower() or "margin" in c.lower()]
                detected_metric = profit_candidates[0] if profit_candidates else num_cols[0]
            elif any(w in q_lower for w in ["order", "volume", "quantity", "units"]):
                qty_candidates = [c for c in num_cols if "qty" in c.lower() or "quant" in c.lower()]
                detected_metric = qty_candidates[0] if qty_candidates else num_cols[0]
            else:
                detected_metric = num_cols[0]

        # 2. Identify Dimension / Group By
        detected_dim = None
        for col in (cat_cols + dt_cols):
            if col.lower() in q_lower or col.lower().replace("_", " ") in q_lower:
                detected_dim = col
                break
        if not detected_dim:
            if any(w in q_lower for w in ["monthly", "daily", "trend", "over time", "yearly", "year", "date"]):
                detected_dim = dt_cols[0] if dt_cols else None
            elif any(w in q_lower for w in ["region", "area", "zone"]):
                reg_c = [c for c in cat_cols if "region" in c.lower() or "zone" in c.lower()]
                detected_dim = reg_c[0] if reg_c else None
            elif any(w in q_lower for w in ["category", "type", "department"]):
                cat_c = [c for c in cat_cols if "cat" in c.lower() or "type" in c.lower()]
                detected_dim = cat_c[0] if cat_c else None
            elif any(w in q_lower for w in ["state", "province"]):
                st_c = [c for c in cat_cols if "state" in c.lower()]
                detected_dim = st_c[0] if st_c else None
            elif any(w in q_lower for w in ["customer", "client"]):
                cust_c = [c for c in cat_cols if "cust" in c.lower()]
                detected_dim = cust_c[0] if cust_c else None

        # 3. Identify Aggregation
        aggregation = "sum"
        if any(w in q_lower for w in ["average", "avg", "mean"]):
            aggregation = "mean"
        elif any(w in q_lower for w in ["count", "how many", "number of"]):
            aggregation = "count"
        elif any(w in q_lower for w in ["minimum", "lowest price", "min"]):
            aggregation = "min"
        elif any(w in q_lower for w in ["maximum", "max"]):
            aggregation = "max"

        # 4. Sorting & Ranking
        sort_order = "desc" if any(w in q_lower for w in ["highest", "top", "best", "most", "maximum", "peak"]) else \
                     "asc" if any(w in q_lower for w in ["lowest", "bottom", "worst", "least", "minimum"]) else "desc"

        # 5. Chart Selection
        if detected_dim in dt_cols or any(w in q_lower for w in ["trend", "over time", "timeline"]):
            chart_type = "line"
        elif not detected_dim:
            chart_type = "kpi"
        elif any(w in q_lower for w in ["share", "percentage", "proportion", "breakdown", "pie"]):
            chart_type = "pie"
        else:
            chart_type = "bar"

        limit = 10
        limit_match = re.search(r"top\s+(\d+)", q_lower)
        if limit_match:
            limit = int(limit_match.group(1))

        title = f"{aggregation.title()} {detected_metric or 'Count'}" + (f" by {detected_dim}" if detected_dim else "")

        # Build SQL
        sql_agg = "AVG" if aggregation == "mean" else aggregation.upper()
        if detected_dim and detected_metric:
            sql_query = f"SELECT {detected_dim}, {sql_agg}({detected_metric}) AS {aggregation}_{detected_metric} FROM dataset GROUP BY {detected_dim} ORDER BY {aggregation}_{detected_metric} {sort_order.upper()} LIMIT {limit}"
        elif detected_metric:
            sql_query = f"SELECT {sql_agg}({detected_metric}) AS total_{detected_metric} FROM dataset"
        else:
            sql_query = "SELECT COUNT(*) AS total_rows FROM dataset"

        return {
            "metric": detected_metric,
            "aggregation": aggregation,
            "group_by": detected_dim,
            "filters": [],
            "sort_order": sort_order,
            "limit": limit,
            "chart_type": chart_type,
            "title": title,
            "sql_query": sql_query,
            "explanation": f"Calculated {aggregation} of {detected_metric or 'rows'} grouped by {detected_dim or 'dataset'}."
        }

