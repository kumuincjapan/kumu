"""
カレンダー・タスク管理ツール

実装メモ:
- Google Calendar API を使う場合は google-auth, google-api-python-client を追加
- Notion API を使う場合は notion-client を追加
- 現在はスタブ実装（構造確認用）
"""

import json
from datetime import datetime

from agents.base import ToolExecutor


class CalendarToolExecutor(ToolExecutor):
    """秘書AIが使用するカレンダー・タスク管理ツールの実装。"""

    def __init__(self) -> None:
        # TODO: 実際のカレンダーサービスのクライアントをここで初期化
        # 例: self.gcal = build("calendar", "v3", credentials=creds)
        self._events: list[dict] = []
        self._tasks: list[dict] = []
        self._reminders: list[dict] = []

    # ------------------------------------------------------------------
    # カレンダーイベント
    # ------------------------------------------------------------------

    def create_event(
        self,
        title: str,
        date: str,
        time: str,
        duration_minutes: int = 60,
        description: str = "",
    ) -> str:
        """
        TODO: Google Calendar API で実際にイベントを作成する
            event = self.gcal.events().insert(calendarId="primary", body={...}).execute()
        """
        event = {
            "id": f"evt_{len(self._events) + 1}",
            "title": title,
            "date": date,
            "time": time,
            "duration_minutes": duration_minutes,
            "description": description,
            "created_at": datetime.now().isoformat(),
        }
        self._events.append(event)
        return f"イベントを登録しました: {title}（{date} {time}）ID: {event['id']}"

    def list_events(self, start_date: str, end_date: str) -> str:
        """
        TODO: Google Calendar API でイベント一覧を取得する
        """
        filtered = [
            e for e in self._events
            if start_date <= e["date"] <= end_date
        ]
        if not filtered:
            return f"{start_date} 〜 {end_date} の期間にイベントはありません。"
        lines = [f"【{start_date} 〜 {end_date} のイベント一覧】"]
        for e in filtered:
            lines.append(f"- {e['date']} {e['time']} | {e['title']} ({e['duration_minutes']}分)")
        return "\n".join(lines)

    # ------------------------------------------------------------------
    # タスク管理
    # ------------------------------------------------------------------

    def create_task(
        self,
        title: str,
        due_date: str = "",
        priority: str = "medium",
        description: str = "",
    ) -> str:
        """
        TODO: Todoist / Notion / Asana API でタスクを作成する
        """
        task = {
            "id": f"task_{len(self._tasks) + 1}",
            "title": title,
            "due_date": due_date,
            "priority": priority,
            "description": description,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
        }
        self._tasks.append(task)
        priority_label = {"high": "🔴高", "medium": "🟡中", "low": "🟢低"}.get(priority, priority)
        return f"タスクを追加しました: {title}（優先度: {priority_label}、期限: {due_date or '未設定'}）"

    def list_tasks(self, filter_status: str = "all") -> str:
        """
        TODO: タスク管理サービスからタスク一覧を取得する
        """
        tasks = self._tasks if filter_status == "all" else [
            t for t in self._tasks if t["status"] == filter_status
        ]
        if not tasks:
            return "タスクはありません。"
        lines = ["【タスク一覧】"]
        for t in tasks:
            status_icon = "✅" if t["status"] == "completed" else "⏳"
            lines.append(
                f"{status_icon} [{t['priority'].upper()}] {t['title']} "
                f"（期限: {t['due_date'] or '未設定'}）"
            )
        return "\n".join(lines)

    # ------------------------------------------------------------------
    # リマインダー
    # ------------------------------------------------------------------

    def set_reminder(self, message: str, remind_at: str) -> str:
        """
        TODO: 通知サービス（Slack / LINE / メール）でリマインダーを設定する
        """
        reminder = {
            "id": f"rem_{len(self._reminders) + 1}",
            "message": message,
            "remind_at": remind_at,
        }
        self._reminders.append(reminder)
        return f"リマインダーを設定しました: 「{message}」→ {remind_at}"
