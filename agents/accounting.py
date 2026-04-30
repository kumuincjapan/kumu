"""
経理AI — システム・財務管理専門エージェント
"""

import anthropic

from config import MODEL_SUBAGENT, SYSTEM_PROMPTS
from tools.finance import FinanceToolExecutor

_TOOLS = [
    {
        "name": "record_transaction",
        "description": "収支の取引を記録する",
        "input_schema": {
            "type": "object",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": ["income", "expense"],
                    "description": "取引の種類（収入 or 支出）",
                },
                "amount": {"type": "number", "description": "金額（円）"},
                "category": {
                    "type": "string",
                    "description": "カテゴリ（例: 売上、広告費、人件費）",
                },
                "description": {"type": "string", "description": "取引の詳細・摘要"},
                "date": {"type": "string", "description": "取引日（例: 2025-06-15）"},
            },
            "required": ["type", "amount", "category", "date"],
        },
    },
    {
        "name": "get_financial_summary",
        "description": "指定期間の財務サマリーを取得する",
        "input_schema": {
            "type": "object",
            "properties": {
                "period": {
                    "type": "string",
                    "enum": ["monthly", "quarterly", "yearly"],
                    "description": "集計期間",
                },
                "year": {"type": "integer", "description": "対象年"},
                "month": {
                    "type": "integer",
                    "description": "対象月（monthly の場合）",
                },
            },
            "required": ["period", "year"],
        },
    },
    {
        "name": "create_invoice",
        "description": "請求書を作成する",
        "input_schema": {
            "type": "object",
            "properties": {
                "client_name": {"type": "string", "description": "請求先クライアント名"},
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "description": {"type": "string"},
                            "quantity": {"type": "number"},
                            "unit_price": {"type": "number"},
                        },
                        "required": ["description", "quantity", "unit_price"],
                    },
                    "description": "請求項目リスト",
                },
                "due_date": {"type": "string", "description": "支払期限（例: 2025-07-31）"},
            },
            "required": ["client_name", "items"],
        },
    },
    {
        "name": "process_expense",
        "description": "経費精算を処理する",
        "input_schema": {
            "type": "object",
            "properties": {
                "submitter": {"type": "string", "description": "申請者名"},
                "amount": {"type": "number", "description": "経費金額（円）"},
                "category": {"type": "string", "description": "経費カテゴリ"},
                "receipt_description": {"type": "string", "description": "領収書の詳細"},
                "date": {"type": "string", "description": "経費発生日"},
            },
            "required": ["submitter", "amount", "category", "date"],
        },
    },
    {
        "name": "generate_financial_report",
        "description": "財務レポートを生成する",
        "input_schema": {
            "type": "object",
            "properties": {
                "report_type": {
                    "type": "string",
                    "enum": ["profit_loss", "cash_flow", "expense_breakdown", "budget_vs_actual"],
                    "description": "レポートの種類",
                },
                "period": {"type": "string", "description": "対象期間（例: 2025年上半期）"},
            },
            "required": ["report_type", "period"],
        },
    },
]


class AccountingAgent:
    """経理AI：財務管理専門エージェント。"""

    name = "経理AI"

    def __init__(self, client: anthropic.Anthropic) -> None:
        from agents.base import BaseAgent

        self._agent = BaseAgent(
            client=client,
            name=self.name,
            model=MODEL_SUBAGENT,
            system_prompt=SYSTEM_PROMPTS["accounting"],
            tools=_TOOLS,
            tool_executor=FinanceToolExecutor(),
        )

    def run(self, task: str, context: str = "") -> str:
        return self._agent.run(task, context)
