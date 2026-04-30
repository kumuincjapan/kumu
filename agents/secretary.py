"""
秘書AI — スケジュール・タスク管理専門エージェント
"""

import anthropic

from config import MODEL_SUBAGENT, SYSTEM_PROMPTS
from tools.calendar import CalendarToolExecutor

# 秘書AIが使用できるツール定義
_TOOLS = [
    {
        "name": "create_event",
        "description": "カレンダーに新しいイベント（会議・アポイントメント）を登録する",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "イベントのタイトル"},
                "date": {"type": "string", "description": "日付（例: 2025-06-15）"},
                "time": {"type": "string", "description": "時刻（例: 14:00）"},
                "duration_minutes": {"type": "integer", "description": "所要時間（分）"},
                "description": {"type": "string", "description": "詳細・メモ"},
            },
            "required": ["title", "date", "time"],
        },
    },
    {
        "name": "list_events",
        "description": "指定期間のカレンダーイベントを一覧表示する",
        "input_schema": {
            "type": "object",
            "properties": {
                "start_date": {"type": "string", "description": "開始日（例: 2025-06-01）"},
                "end_date": {"type": "string", "description": "終了日（例: 2025-06-30）"},
            },
            "required": ["start_date", "end_date"],
        },
    },
    {
        "name": "create_task",
        "description": "タスクリストに新しいタスクを追加する",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "タスクのタイトル"},
                "due_date": {"type": "string", "description": "期限日（例: 2025-06-20）"},
                "priority": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "優先度",
                },
                "description": {"type": "string", "description": "タスクの詳細"},
            },
            "required": ["title"],
        },
    },
    {
        "name": "list_tasks",
        "description": "タスクリストを表示する",
        "input_schema": {
            "type": "object",
            "properties": {
                "filter_status": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "description": "表示するタスクのステータスでフィルタ",
                },
            },
            "required": [],
        },
    },
    {
        "name": "set_reminder",
        "description": "リマインダーを設定する",
        "input_schema": {
            "type": "object",
            "properties": {
                "message": {"type": "string", "description": "リマインダーのメッセージ"},
                "remind_at": {
                    "type": "string",
                    "description": "リマインド日時（例: 2025-06-15 09:00）",
                },
            },
            "required": ["message", "remind_at"],
        },
    },
]


class SecretaryAgent:
    """秘書AI：スケジュール・タスク管理専門エージェント。"""

    name = "秘書AI"

    def __init__(self, client: anthropic.Anthropic) -> None:
        from agents.base import BaseAgent

        self._agent = BaseAgent(
            client=client,
            name=self.name,
            model=MODEL_SUBAGENT,
            system_prompt=SYSTEM_PROMPTS["secretary"],
            tools=_TOOLS,
            tool_executor=CalendarToolExecutor(),
        )

    def run(self, task: str, context: str = "") -> str:
        return self._agent.run(task, context)
