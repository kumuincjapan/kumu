"""
コンテンツ制作AI — ブログ・SNS・資料作成専門エージェント
"""

import anthropic

from config import MODEL_SUBAGENT, SYSTEM_PROMPTS
from tools.content import ContentToolExecutor

_TOOLS = [
    {
        "name": "write_blog_post",
        "description": "ブログ記事を執筆する",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "記事タイトル"},
                "topic": {"type": "string", "description": "記事のトピック・テーマ"},
                "target_audience": {"type": "string", "description": "ターゲット読者層"},
                "keywords": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "含めるべきキーワード",
                },
                "word_count": {"type": "integer", "description": "目標文字数"},
                "tone": {
                    "type": "string",
                    "enum": ["professional", "casual", "educational", "inspiring"],
                    "description": "文章のトーン",
                },
            },
            "required": ["title", "topic"],
        },
    },
    {
        "name": "write_sns_post",
        "description": "SNS投稿文を作成する",
        "input_schema": {
            "type": "object",
            "properties": {
                "platform": {
                    "type": "string",
                    "enum": ["twitter", "instagram", "linkedin", "facebook"],
                    "description": "投稿するSNSプラットフォーム",
                },
                "message": {"type": "string", "description": "伝えたいメッセージ・内容"},
                "include_hashtags": {
                    "type": "boolean",
                    "description": "ハッシュタグを含めるか",
                },
            },
            "required": ["platform", "message"],
        },
    },
    {
        "name": "create_presentation_outline",
        "description": "プレゼンテーションの構成・アウトラインを作成する",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "プレゼンのタイトル"},
                "purpose": {"type": "string", "description": "プレゼンの目的"},
                "audience": {"type": "string", "description": "対象聴衆"},
                "duration_minutes": {
                    "type": "integer",
                    "description": "プレゼン時間（分）",
                },
                "key_messages": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "伝えたい主要メッセージ",
                },
            },
            "required": ["title", "purpose"],
        },
    },
    {
        "name": "write_newsletter",
        "description": "メールマガジンの本文を作成する",
        "input_schema": {
            "type": "object",
            "properties": {
                "subject": {"type": "string", "description": "メールの件名"},
                "topics": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "含めるトピックのリスト",
                },
                "call_to_action": {
                    "type": "string",
                    "description": "読者に促したいアクション",
                },
            },
            "required": ["subject", "topics"],
        },
    },
]


class ContentCreatorAgent:
    """コンテンツ制作AI：各種コンテンツ生成専門エージェント。"""

    name = "コンテンツ制作AI"

    def __init__(self, client: anthropic.Anthropic) -> None:
        from agents.base import BaseAgent

        self._agent = BaseAgent(
            client=client,
            name=self.name,
            model=MODEL_SUBAGENT,
            system_prompt=SYSTEM_PROMPTS["content_creator"],
            tools=_TOOLS,
            tool_executor=ContentToolExecutor(),
        )

    def run(self, task: str, context: str = "") -> str:
        return self._agent.run(task, context)
