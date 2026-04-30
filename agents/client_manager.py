"""
クライアント管理AI — 顧客対応・データベース更新専門エージェント
"""

import anthropic

from config import MODEL_SUBAGENT, SYSTEM_PROMPTS
from tools.crm import CRMToolExecutor

_TOOLS = [
    {
        "name": "get_client",
        "description": "顧客情報を検索・取得する",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "顧客名・会社名・メールなどで検索"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "create_client",
        "description": "新規顧客を登録する",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "顧客名"},
                "company": {"type": "string", "description": "会社名"},
                "email": {"type": "string", "description": "メールアドレス"},
                "phone": {"type": "string", "description": "電話番号"},
                "notes": {"type": "string", "description": "備考・メモ"},
            },
            "required": ["name"],
        },
    },
    {
        "name": "update_client",
        "description": "既存顧客情報を更新する",
        "input_schema": {
            "type": "object",
            "properties": {
                "client_id": {"type": "string", "description": "顧客ID"},
                "field": {"type": "string", "description": "更新するフィールド名"},
                "value": {"type": "string", "description": "新しい値"},
            },
            "required": ["client_id", "field", "value"],
        },
    },
    {
        "name": "log_interaction",
        "description": "顧客との対話記録を追加する",
        "input_schema": {
            "type": "object",
            "properties": {
                "client_id": {"type": "string", "description": "顧客ID"},
                "type": {
                    "type": "string",
                    "enum": ["call", "email", "meeting", "other"],
                    "description": "対話の種類",
                },
                "summary": {"type": "string", "description": "対話内容の要約"},
                "date": {"type": "string", "description": "対話日（例: 2025-06-15）"},
            },
            "required": ["client_id", "type", "summary"],
        },
    },
    {
        "name": "draft_email",
        "description": "顧客向けメールの下書きを作成する",
        "input_schema": {
            "type": "object",
            "properties": {
                "client_id": {"type": "string", "description": "送信先顧客ID"},
                "subject": {"type": "string", "description": "メールの件名"},
                "purpose": {"type": "string", "description": "メールの目的・内容の指示"},
            },
            "required": ["client_id", "subject", "purpose"],
        },
    },
]


class ClientManagerAgent:
    """クライアント管理AI：顧客対応・CRM専門エージェント。"""

    name = "クライアント管理AI"

    def __init__(self, client: anthropic.Anthropic) -> None:
        from agents.base import BaseAgent

        self._agent = BaseAgent(
            client=client,
            name=self.name,
            model=MODEL_SUBAGENT,
            system_prompt=SYSTEM_PROMPTS["client_manager"],
            tools=_TOOLS,
            tool_executor=CRMToolExecutor(),
        )

    def run(self, task: str, context: str = "") -> str:
        return self._agent.run(task, context)
