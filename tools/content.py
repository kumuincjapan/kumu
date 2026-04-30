"""
コンテンツ生成補助ツール

コンテンツ制作AIは主にLLM自身の生成能力を使うが、
このツールはファイル保存・テンプレート提供などの補助機能を担う。

実装メモ:
- WordPress REST API でブログを直接投稿することも可能
- Notion API でドキュメントとして保存も可能
"""

import os
from datetime import datetime
from pathlib import Path

from agents.base import ToolExecutor

# 生成コンテンツの保存先
OUTPUT_DIR = Path("output/content")


class ContentToolExecutor(ToolExecutor):
    """コンテンツ制作AIが使用するツールの実装。"""

    def __init__(self) -> None:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    def write_blog_post(
        self,
        title: str,
        topic: str,
        target_audience: str = "一般読者",
        keywords: list[str] | None = None,
        word_count: int = 1500,
        tone: str = "professional",
    ) -> str:
        """
        ブログ記事執筆のための構造化された指示を返す。
        LLM がこれを受け取り、実際の記事を生成する。
        """
        kw_str = "、".join(keywords) if keywords else "指定なし"
        tone_label = {
            "professional": "プロフェッショナル・専門的",
            "casual": "カジュアル・親しみやすい",
            "educational": "教育的・わかりやすい",
            "inspiring": "インスピレーションを与える",
        }.get(tone, tone)

        return (
            f"【ブログ記事執筆指示】\n"
            f"タイトル: {title}\n"
            f"トピック: {topic}\n"
            f"ターゲット読者: {target_audience}\n"
            f"含めるキーワード: {kw_str}\n"
            f"目標文字数: {word_count}文字\n"
            f"トーン: {tone_label}\n\n"
            f"構成案:\n"
            f"1. 導入（読者の課題・共感を呼ぶ）\n"
            f"2. 本論（3〜5つのセクション）\n"
            f"3. まとめ（行動喚起・次のステップ）\n\n"
            f"→ 上記の指示に従って、SEOを意識した記事を執筆してください。"
        )

    def write_sns_post(
        self,
        platform: str,
        message: str,
        include_hashtags: bool = True,
    ) -> str:
        """
        SNS投稿文作成のための指示を返す。
        """
        limits = {
            "twitter": "140文字以内（日本語）",
            "instagram": "2200文字以内、改行多め",
            "linkedin": "1300文字程度、ビジネストーン",
            "facebook": "500文字程度",
        }
        limit = limits.get(platform, "適切な長さ")
        hashtag_instruction = "関連するハッシュタグを3〜5個付ける" if include_hashtags else "ハッシュタグなし"

        return (
            f"【SNS投稿文作成指示】\n"
            f"プラットフォーム: {platform}\n"
            f"文字数目安: {limit}\n"
            f"伝えたいメッセージ: {message}\n"
            f"ハッシュタグ: {hashtag_instruction}\n\n"
            f"→ {platform} のユーザーに最適化した投稿文を作成してください。"
        )

    def create_presentation_outline(
        self,
        title: str,
        purpose: str,
        audience: str = "一般",
        duration_minutes: int = 30,
        key_messages: list[str] | None = None,
    ) -> str:
        """
        プレゼンテーションのアウトライン作成指示を返す。
        """
        msg_str = "\n".join(f"  - {m}" for m in key_messages) if key_messages else "  （未指定）"
        slides_estimate = max(5, duration_minutes // 2)

        return (
            f"【プレゼンテーションアウトライン作成指示】\n"
            f"タイトル: {title}\n"
            f"目的: {purpose}\n"
            f"対象聴衆: {audience}\n"
            f"発表時間: {duration_minutes}分（推定スライド数: {slides_estimate}枚）\n"
            f"主要メッセージ:\n{msg_str}\n\n"
            f"→ 上記の条件に合わせたプレゼン構成とスライドごとの内容を作成してください。"
        )

    def write_newsletter(
        self,
        subject: str,
        topics: list[str],
        call_to_action: str = "",
    ) -> str:
        """
        メールマガジン作成指示を返す。
        """
        topics_str = "\n".join(f"  {i+1}. {t}" for i, t in enumerate(topics))
        cta = f"\nCTA: {call_to_action}" if call_to_action else ""

        return (
            f"【メールマガジン作成指示】\n"
            f"件名: {subject}\n"
            f"掲載トピック:\n{topics_str}{cta}\n\n"
            f"構成:\n"
            f"- 挨拶・導入（2〜3行）\n"
            f"- 各トピック（見出し + 本文 100〜200文字）\n"
            f"- 締め + 行動喚起\n\n"
            f"→ 読者が最後まで読みたくなるメールマガジンを作成してください。"
        )
