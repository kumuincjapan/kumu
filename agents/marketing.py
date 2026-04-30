"""
マーケAI — リサーチ・分析専門エージェント
"""

import anthropic

from config import MODEL_SUBAGENT, SYSTEM_PROMPTS
from tools.search import SearchToolExecutor

_TOOLS = [
    {
        "name": "web_search",
        "description": "ウェブ上の情報をリサーチ・検索する",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "検索クエリ"},
                "search_type": {
                    "type": "string",
                    "enum": ["general", "news", "competitor", "trend"],
                    "description": "検索の種類",
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "analyze_competitors",
        "description": "競合他社の情報を収集・分析する",
        "input_schema": {
            "type": "object",
            "properties": {
                "company_names": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "分析対象の競合会社名リスト",
                },
                "analysis_points": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "分析する観点（例: pricing, features, marketing）",
                },
            },
            "required": ["company_names"],
        },
    },
    {
        "name": "research_keywords",
        "description": "SEO・マーケティング用キーワードをリサーチする",
        "input_schema": {
            "type": "object",
            "properties": {
                "seed_keyword": {"type": "string", "description": "ベースとなるキーワード"},
                "industry": {"type": "string", "description": "業界・ジャンル"},
            },
            "required": ["seed_keyword"],
        },
    },
    {
        "name": "generate_report",
        "description": "市場調査・分析レポートを生成する",
        "input_schema": {
            "type": "object",
            "properties": {
                "report_type": {
                    "type": "string",
                    "enum": ["market_analysis", "competitor_analysis", "trend_report", "kpi_summary"],
                    "description": "レポートの種類",
                },
                "data": {"type": "string", "description": "レポートのベースとなるデータや情報"},
                "period": {"type": "string", "description": "対象期間（例: 2025年Q2）"},
            },
            "required": ["report_type", "data"],
        },
    },
]


class MarketingAgent:
    """マーケAI：リサーチ・分析専門エージェント。"""

    name = "マーケAI"

    def __init__(self, client: anthropic.Anthropic) -> None:
        from agents.base import BaseAgent

        self._agent = BaseAgent(
            client=client,
            name=self.name,
            model=MODEL_SUBAGENT,
            system_prompt=SYSTEM_PROMPTS["marketing"],
            tools=_TOOLS,
            tool_executor=SearchToolExecutor(),
        )

    def run(self, task: str, context: str = "") -> str:
        return self._agent.run(task, context)
