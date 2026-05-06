# ECサイト改善診断アプリ

URLを入力するだけで、ECサイトの改善案をAIが自動生成するWebアプリ（MVP）。

## 機能

- ECサイトURLのスクレイピング（cheerio + axios）
- OpenAI GPT-4o による改善分析（10個以上の改善案）
- 優先度別（High / Medium / Low）レポート表示
- PDFダウンロード（ブラウザレンダリング + html2canvas + jsPDF）
- PDFをメール送信（nodemailer）

## セットアップ

### 1. 依存パッケージのインストール

```bash
cd ec-analysis-app
npm install
```

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して以下を設定：

| 変数名 | 説明 |
|--------|------|
| `OPENAI_API_KEY` | OpenAI APIキー（必須） |
| `SMTP_HOST` | SMTPサーバーホスト名（例: smtp.gmail.com） |
| `SMTP_PORT` | SMTPポート（587 or 465） |
| `SMTP_USER` | SMTPユーザー名（メールアドレス） |
| `SMTP_PASS` | SMTPパスワード（Gmailはアプリパスワード） |
| `SMTP_FROM` | 送信元メールアドレス |

#### Gmail 設定の場合

1. Googleアカウントで「2段階認証」を有効にする
2. [アプリパスワード](https://myaccount.google.com/apppasswords) を生成
3. `SMTP_PASS` にアプリパスワードを設定

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   # アプリパスワード（スペースなし）
SMTP_FROM=your-email@gmail.com
```

### 3. ローカル起動

```bash
npm run dev
```

→ http://localhost:3000 でアクセス可能

## 使い方

1. トップページでECサイトのURLとメールアドレスを入力
2. 「無料診断する」をクリック（30〜60秒）
3. 分析結果ページが表示される
4. 「PDFダウンロード」または「PDFをメールで受け取る」をクリック

## 技術スタック

- **フレームワーク**: Next.js 15（App Router）
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **スクレイピング**: cheerio + axios
- **AI分析**: OpenAI API（GPT-4o）
- **PDF生成**: html2canvas + jsPDF（クライアントサイド）
- **メール送信**: nodemailer（SMTP）

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx              # トップページ（入力フォーム）
│   ├── result/page.tsx       # 結果表示ページ
│   └── api/
│       ├── analyze/route.ts  # 分析API（スクレイピング + AI）
│       └── send-pdf/route.ts # PDF送信API
├── components/
│   ├── LoadingOverlay.tsx    # ローディング表示
│   ├── ResultDisplay.tsx     # 結果レイアウト全体
│   └── ImprovementCard.tsx   # 改善案カード
├── lib/
│   ├── scraper.ts            # Webスクレイピング
│   ├── openai.ts             # OpenAI API呼び出し
│   └── email.ts              # メール送信
└── types/
    └── analysis.ts           # 型定義
```

## 今後の改善案

1. **診断履歴の永続化** — PostgreSQL/SQLite + Prisma で診断履歴を保存
2. **Playwright対応** — JavaScript重視のSPAサイトもスクレイピング可能に
3. **認証機能** — ユーザーアカウントで複数サイトを管理
4. **比較分析** — 競合サイトとの比較レポート
5. **スコアリング** — CVRスコアを数値化して可視化
6. **Webhook通知** — Slack/Chatworkへの通知連携
7. **定期診断** — cron ジョブで定期的な改善追跡

## 注意事項

- 公開ページのみ分析可能（ログイン必要なページは不可）
- 本ツールはAIが公開情報をもとに生成した**仮説・提案**です
- 成果を保証するものではありません
- メールアドレスはPDF送付目的のみに利用します
