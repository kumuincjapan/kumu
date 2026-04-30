"""
CRM（顧客管理）ツール

実装メモ:
- HubSpot API を使う場合は hubspot-api-client を追加
- Notion データベースを使う場合は notion-client を追加
- Salesforce を使う場合は simple-salesforce を追加
- 現在はスタブ実装（構造確認用）
"""

from datetime import datetime

import anthropic

from agents.base import ToolExecutor


class CRMToolExecutor(ToolExecutor):
    """クライアント管理AIが使用するCRMツールの実装。"""

    def __init__(self) -> None:
        # TODO: 実際のCRMサービスのクライアントをここで初期化
        # 例: self.hubspot = HubSpot(access_token=os.getenv("HUBSPOT_TOKEN"))
        self._clients: dict[str, dict] = {}
        self._interactions: list[dict] = []
        self._client_counter = 0

    # ------------------------------------------------------------------
    # 顧客管理
    # ------------------------------------------------------------------

    def get_client(self, query: str) -> str:
        """
        TODO: CRM API で顧客を検索する
        """
        results = [
            c for c in self._clients.values()
            if query.lower() in c.get("name", "").lower()
            or query.lower() in c.get("company", "").lower()
            or query.lower() in c.get("email", "").lower()
        ]
        if not results:
            return f"「{query}」に一致する顧客は見つかりませんでした。"
        lines = [f"【検索結果: {len(results)}件】"]
        for c in results:
            lines.append(
                f"- ID: {c['id']} | {c['name']}（{c.get('company', '会社未設定')}）"
                f" | {c.get('email', 'メール未設定')}"
            )
        return "\n".join(lines)

    def create_client(
        self,
        name: str,
        company: str = "",
        email: str = "",
        phone: str = "",
        notes: str = "",
    ) -> str:
        """
        TODO: CRM API で新規顧客を作成する
        """
        self._client_counter += 1
        client_id = f"cli_{self._client_counter:04d}"
        self._clients[client_id] = {
            "id": client_id,
            "name": name,
            "company": company,
            "email": email,
            "phone": phone,
            "notes": notes,
            "created_at": datetime.now().isoformat(),
        }
        return f"顧客を登録しました: {name}（{company}）ID: {client_id}"

    def update_client(self, client_id: str, field: str, value: str) -> str:
        """
        TODO: CRM API で顧客情報を更新する
        """
        if client_id not in self._clients:
            return f"顧客 ID「{client_id}」が見つかりません。"
        self._clients[client_id][field] = value
        return f"顧客 {client_id} の {field} を「{value}」に更新しました。"

    # ------------------------------------------------------------------
    # 対話記録
    # ------------------------------------------------------------------

    def log_interaction(
        self,
        client_id: str,
        type: str,
        summary: str,
        date: str = "",
    ) -> str:
        """
        TODO: CRM API で対話記録を追加する
        """
        if client_id not in self._clients:
            return f"顧客 ID「{client_id}」が見つかりません。"
        interaction = {
            "id": f"int_{len(self._interactions) + 1}",
            "client_id": client_id,
            "type": type,
            "summary": summary,
            "date": date or datetime.now().strftime("%Y-%m-%d"),
        }
        self._interactions.append(interaction)
        client_name = self._clients[client_id]["name"]
        type_label = {"call": "電話", "email": "メール", "meeting": "面談", "other": "その他"}.get(type, type)
        return f"対話記録を追加しました: {client_name} との {type_label}（{interaction['date']}）"

    # ------------------------------------------------------------------
    # メール下書き
    # ------------------------------------------------------------------

    def draft_email(self, client_id: str, subject: str, purpose: str) -> str:
        """
        CRM から顧客情報を取得し、メールの下書き生成を促す。
        実際の文章生成は LLM（クライアント管理AI）が行う。
        """
        if client_id not in self._clients:
            return f"顧客 ID「{client_id}」が見つかりません。"
        client = self._clients[client_id]
        return (
            f"【メール下書き用情報】\n"
            f"宛先: {client['name']}（{client.get('company', '')}）\n"
            f"メール: {client.get('email', '未設定')}\n"
            f"件名: {subject}\n"
            f"目的: {purpose}\n"
            f"\n→ 上記の情報を元に、適切なメール文章を作成してください。"
        )
