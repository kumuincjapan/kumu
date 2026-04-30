"""
財務管理ツール

実装メモ:
- 会計ソフト連携: freee API, マネーフォワード API, 弥生 API
- スプレッドシート連携: Google Sheets API
- 現在はスタブ実装（構造確認用）
"""

import json
from datetime import datetime
from pathlib import Path

from agents.base import ToolExecutor

DATA_DIR = Path("output/finance")


class FinanceToolExecutor(ToolExecutor):
    """経理AIが使用する財務管理ツールの実装。"""

    def __init__(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        # TODO: 会計APIクライアントをここで初期化
        # 例: self.freee = freee.AccountingApi(...)
        self._transactions: list[dict] = []
        self._invoices: list[dict] = []
        self._expenses: list[dict] = []
        self._invoice_counter = 0

    # ------------------------------------------------------------------
    # 取引記録
    # ------------------------------------------------------------------

    def record_transaction(
        self,
        type: str,
        amount: float,
        category: str,
        date: str,
        description: str = "",
    ) -> str:
        """
        TODO: freee API / マネーフォワード API で取引を記録する
        """
        txn = {
            "id": f"txn_{len(self._transactions) + 1:04d}",
            "type": type,
            "amount": amount,
            "category": category,
            "description": description,
            "date": date,
            "recorded_at": datetime.now().isoformat(),
        }
        self._transactions.append(txn)
        type_label = "収入" if type == "income" else "支出"
        return (
            f"取引を記録しました\n"
            f"  種別: {type_label}\n"
            f"  金額: ¥{amount:,.0f}\n"
            f"  カテゴリ: {category}\n"
            f"  日付: {date}\n"
            f"  ID: {txn['id']}"
        )

    # ------------------------------------------------------------------
    # 財務サマリー
    # ------------------------------------------------------------------

    def get_financial_summary(
        self,
        period: str,
        year: int,
        month: int | None = None,
    ) -> str:
        """
        TODO: 会計APIから期間の財務データを集計して返す
        """
        income = sum(t["amount"] for t in self._transactions if t["type"] == "income")
        expense = sum(t["amount"] for t in self._transactions if t["type"] == "expense")
        profit = income - expense

        period_label = {
            "monthly": f"{year}年{month}月" if month else f"{year}年",
            "quarterly": f"{year}年",
            "yearly": f"{year}年",
        }.get(period, period)

        return (
            f"【財務サマリー: {period_label}】\n"
            f"  総収入: ¥{income:>12,.0f}\n"
            f"  総支出: ¥{expense:>12,.0f}\n"
            f"  ─────────────────────\n"
            f"  純利益: ¥{profit:>12,.0f}\n\n"
            f"※ TODO: 実際のデータは会計API から取得してください。"
        )

    # ------------------------------------------------------------------
    # 請求書
    # ------------------------------------------------------------------

    def create_invoice(
        self,
        client_name: str,
        items: list[dict],
        due_date: str = "",
    ) -> str:
        """
        TODO: 会計API で請求書を発行する
        """
        self._invoice_counter += 1
        invoice_no = f"INV-{datetime.now().strftime('%Y%m')}-{self._invoice_counter:03d}"
        subtotal = sum(item["quantity"] * item["unit_price"] for item in items)
        tax = subtotal * 0.10
        total = subtotal + tax

        lines = [
            f"【請求書 #{invoice_no}】",
            f"請求先: {client_name}",
            f"発行日: {datetime.now().strftime('%Y-%m-%d')}",
            f"支払期限: {due_date or '請求日より30日以内'}",
            "",
            "明細:",
        ]
        for item in items:
            subtotal_item = item["quantity"] * item["unit_price"]
            lines.append(
                f"  - {item['description']}: "
                f"{item['quantity']}個 × ¥{item['unit_price']:,.0f} = ¥{subtotal_item:,.0f}"
            )
        lines.extend([
            "",
            f"小計: ¥{subtotal:,.0f}",
            f"消費税 (10%): ¥{tax:,.0f}",
            f"合計: ¥{total:,.0f}",
        ])

        self._invoices.append({
            "invoice_no": invoice_no,
            "client_name": client_name,
            "total": total,
            "due_date": due_date,
        })
        return "\n".join(lines)

    # ------------------------------------------------------------------
    # 経費精算
    # ------------------------------------------------------------------

    def process_expense(
        self,
        submitter: str,
        amount: float,
        category: str,
        date: str,
        receipt_description: str = "",
    ) -> str:
        """
        TODO: 経費精算システムに記録する
        """
        expense = {
            "id": f"exp_{len(self._expenses) + 1:04d}",
            "submitter": submitter,
            "amount": amount,
            "category": category,
            "receipt_description": receipt_description,
            "date": date,
            "status": "pending",
        }
        self._expenses.append(expense)
        return (
            f"経費精算を受け付けました\n"
            f"  申請者: {submitter}\n"
            f"  金額: ¥{amount:,.0f}\n"
            f"  カテゴリ: {category}\n"
            f"  日付: {date}\n"
            f"  ステータス: 承認待ち\n"
            f"  ID: {expense['id']}"
        )

    # ------------------------------------------------------------------
    # 財務レポート
    # ------------------------------------------------------------------

    def generate_financial_report(self, report_type: str, period: str) -> str:
        """
        財務レポートのテンプレートとデータを返す。実際のレポート文章はLLMが生成する。
        """
        type_label = {
            "profit_loss": "損益計算書",
            "cash_flow": "キャッシュフロー計算書",
            "expense_breakdown": "経費内訳レポート",
            "budget_vs_actual": "予算対実績レポート",
        }.get(report_type, report_type)

        income = sum(t["amount"] for t in self._transactions if t["type"] == "income")
        expense = sum(t["amount"] for t in self._transactions if t["type"] == "expense")

        return (
            f"【{type_label}: {period}】\n"
            f"集計データ:\n"
            f"  総収入: ¥{income:,.0f}\n"
            f"  総支出: ¥{expense:,.0f}\n"
            f"  純利益: ¥{income - expense:,.0f}\n"
            f"  取引件数: {len(self._transactions)}件\n\n"
            f"→ 上記データを元に、{type_label}を作成してください。\n"
            f"  ※ TODO: 実際のデータは会計API から取得してください。"
        )
