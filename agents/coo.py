"""
COOAI — AI 総括・実行責任者

社長（唯一の人間）からの指示を受け、5 つのサブエージェントを
ツールとして呼び出してオーケストレーションを行う。
"""

from __future__ import annotations

import anthropic

from config import MODEL_COO, SUBAGENT_TOOL_DEFINITIONS, SYSTEM_PROMPTS


class COOAI:
    """
    オーケストレーターエージェント。
    サブエージェントをツール呼び出しで委任し、結果を統合して社長に返す。
    """

    def __init__(
        self,
        client: anthropic.Anthropic,
        subagents: dict[str, "BaseAgent"],  # noqa: F821
        max_tokens: int = 8192,
    ) -> None:
        self.client = client
        self.subagents = subagents  # {"secretary": SecretaryAgent, ...}
        self.max_tokens = max_tokens

        # サブエージェント名 → ツール名のマッピング
        self._tool_map = {
            "call_secretary": "secretary",
            "call_client_manager": "client_manager",
            "call_content_creator": "content_creator",
            "call_marketing": "marketing",
            "call_accounting": "accounting",
        }

        # システムプロンプトはプロンプトキャッシュを適用
        self._system = [
            {
                "type": "text",
                "text": SYSTEM_PROMPTS["coo"],
                "cache_control": {"type": "ephemeral"},
            }
        ]

    # ------------------------------------------------------------------
    # 公開インターフェース
    # ------------------------------------------------------------------

    def chat(self, user_message: str) -> str:
        """
        社長からのメッセージを受け取り、最終回答を返す。
        必要に応じてサブエージェントを自動的に呼び出す。
        """
        messages = [{"role": "user", "content": user_message}]
        return self._run_loop(messages)

    # ------------------------------------------------------------------
    # 内部ループ
    # ------------------------------------------------------------------

    def _run_loop(self, messages: list[dict]) -> str:
        """サブエージェント委任ループを実行する。"""
        while True:
            response = self.client.messages.create(
                model=MODEL_COO,
                max_tokens=self.max_tokens,
                thinking={"type": "adaptive"},   # Opus 4.7: 必要な場合のみ深く考える
                system=self._system,
                tools=SUBAGENT_TOOL_DEFINITIONS,
                messages=messages,
            )

            if response.stop_reason == "end_turn":
                return self._extract_text(response)

            if response.stop_reason == "tool_use":
                messages.append({"role": "assistant", "content": response.content})
                tool_results = self._dispatch_subagents(response.content)
                messages.append({"role": "user", "content": tool_results})
                continue

            # max_tokens 等
            return self._extract_text(response)

    def _dispatch_subagents(self, content: list) -> list[dict]:
        """ツール呼び出しブロックを解析し、対応するサブエージェントを実行する。"""
        results = []
        for block in content:
            if block.type != "tool_use":
                continue

            agent_key = self._tool_map.get(block.name)
            if agent_key is None:
                result_text = f"[未知のツール: {block.name}]"
            else:
                agent = self.subagents.get(agent_key)
                if agent is None:
                    result_text = f"[エージェント '{agent_key}' が登録されていません]"
                else:
                    task = block.input.get("task", "")
                    context = block.input.get("context", "")
                    print(f"  → [{agent.name}] に委任中...")
                    result_text = agent.run(task, context)

            results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result_text,
                }
            )
        return results

    def _extract_text(self, response: anthropic.types.Message) -> str:
        texts = [block.text for block in response.content if block.type == "text"]
        return "\n".join(texts) if texts else "(応答なし)"
