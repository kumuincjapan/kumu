"""
AI 経営支援エージェント体制 — エントリーポイント

使い方:
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY="sk-ant-..."
    python main.py
"""

import os
import sys

import anthropic
from dotenv import load_dotenv

from agents import (
    COOAI,
    AccountingAgent,
    ClientManagerAgent,
    ContentCreatorAgent,
    MarketingAgent,
    SecretaryAgent,
)

load_dotenv()


def build_company(client: anthropic.Anthropic) -> COOAI:
    """全エージェントを初期化して COOAI に組み込む。"""
    subagents = {
        "secretary": SecretaryAgent(client),
        "client_manager": ClientManagerAgent(client),
        "content_creator": ContentCreatorAgent(client),
        "marketing": MarketingAgent(client),
        "accounting": AccountingAgent(client),
    }
    return COOAI(client, subagents)


def print_banner() -> None:
    print(
        "\n"
        "╔══════════════════════════════════════════════════╗\n"
        "║         AI 経営支援エージェント体制  v1.0          ║\n"
        "║                                                  ║\n"
        "║  COOAI が以下のサブエージェントを統括します:        ║\n"
        "║    🗓  秘書AI        スケジュール・タスク管理       ║\n"
        "║    👥  クライアント管理AI  顧客対応・DB管理         ║\n"
        "║    ✍️  コンテンツ制作AI  ブログ・SNS・資料           ║\n"
        "║    📊  マーケAI      リサーチ・分析                ║\n"
        "║    💰  経理AI        財務・請求書管理              ║\n"
        "║                                                  ║\n"
        "║  'exit' または Ctrl+C で終了                      ║\n"
        "╚══════════════════════════════════════════════════╝\n"
    )


def main() -> None:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("エラー: 環境変数 ANTHROPIC_API_KEY が設定されていません。")
        print("  export ANTHROPIC_API_KEY='sk-ant-...'")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    coo = build_company(client)

    print_banner()
    print("社長（あなた）として、COOAI に指示を出してください。\n")

    while True:
        try:
            user_input = input("社長 > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nシステムを終了します。")
            break

        if not user_input:
            continue
        if user_input.lower() in ("exit", "quit", "終了"):
            print("システムを終了します。")
            break

        print("\nCOOAI が処理中...\n")
        try:
            response = coo.chat(user_input)
            print(f"COOAI > {response}\n")
            print("─" * 60 + "\n")
        except anthropic.APIError as e:
            print(f"APIエラー: {e}\n")
        except Exception as e:
            print(f"エラーが発生しました: {e}\n")


if __name__ == "__main__":
    main()
