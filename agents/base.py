"""
全サブエージェント共通のベースクラス。
ツール使用ループを内包し、タスクを受け取って結果を返す。
"""

from __future__ import annotations

import json
from typing import Any

import anthropic


class BaseAgent:
    """サブエージェントの基底クラス。"""

    def __init__(
        self,
        client: anthropic.Anthropic,
        name: str,
        model: str,
        system_prompt: str,
        tools: list[dict] | None = None,
        tool_executor: "ToolExecutor | None" = None,
        max_tokens: int = 4096,
    ) -> None:
        self.client = client
        self.name = name
        self.model = model
        self.system_prompt = system_prompt
        self.tools = tools or []
        self.tool_executor = tool_executor
        self.max_tokens = max_tokens

    def run(self, task: str, context: str = "") -> str:
        """
        タスクを受け取り、ツール使用ループを経て結果文字列を返す。

        Args:
            task: サブエージェントに依頼するタスク内容
            context: 追加コンテキスト（任意）
        Returns:
            エージェントの最終回答文字列
        """
        user_content = task
        if context:
            user_content = f"{task}\n\n【追加コンテキスト】\n{context}"

        messages: list[dict] = [{"role": "user", "content": user_content}]

        # システムプロンプトにキャッシュを適用（長い場合のコスト削減）
        system: list[dict] | str
        if len(self.system_prompt) > 1024:
            system = [
                {
                    "type": "text",
                    "text": self.system_prompt,
                    "cache_control": {"type": "ephemeral"},
                }
            ]
        else:
            system = self.system_prompt

        while True:
            kwargs: dict[str, Any] = {
                "model": self.model,
                "max_tokens": self.max_tokens,
                "system": system,
                "messages": messages,
            }
            if self.tools:
                kwargs["tools"] = self.tools

            response = self.client.messages.create(**kwargs)

            # ツール呼び出しなしで完了
            if response.stop_reason == "end_turn":
                return self._extract_text(response)

            # ツール呼び出しが要求された場合
            if response.stop_reason == "tool_use":
                messages.append({"role": "assistant", "content": response.content})
                tool_results = self._execute_tools(response.content)
                messages.append({"role": "user", "content": tool_results})
                continue

            # その他の終了理由（max_tokens 等）
            return self._extract_text(response)

    def _extract_text(self, response: anthropic.types.Message) -> str:
        """レスポンスからテキストブロックを抽出する。"""
        texts = [block.text for block in response.content if block.type == "text"]
        return "\n".join(texts) if texts else "(応答なし)"

    def _execute_tools(self, content: list) -> list[dict]:
        """ツール呼び出しブロックを実行してツール結果リストを返す。"""
        results = []
        for block in content:
            if block.type != "tool_use":
                continue
            if self.tool_executor is None:
                result_text = f"[ツール {block.name} は未実装です]"
            else:
                try:
                    result_text = self.tool_executor.execute(block.name, block.input)
                except Exception as exc:
                    result_text = f"[エラー: {exc}]"

            results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result_text,
                }
            )
        return results


class ToolExecutor:
    """ツール実行ディスパッチャーの基底クラス。各エージェントでサブクラス化する。"""

    def execute(self, tool_name: str, tool_input: dict) -> str:
        method = getattr(self, tool_name, None)
        if method is None:
            return f"未知のツール: {tool_name}"
        return method(**tool_input)
