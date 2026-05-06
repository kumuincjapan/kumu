import nodemailer from 'nodemailer';

interface SendReportEmailOptions {
  to: string;
  url: string;
  pdfBuffer: Buffer;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    throw new Error('メール設定が不完全です。環境変数 SMTP_HOST, SMTP_USER, SMTP_PASS を設定してください。');
  }

  return { transporter: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), from };
}

export async function sendReportEmail({ to, url, pdfBuffer }: SendReportEmailOptions): Promise<void> {
  const { transporter, from } = createTransporter();

  const analyzedDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.6; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #4f46e5; padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
    .header p { color: #c7d2fe; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; }
    .url-box { background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0; word-break: break-all; font-size: 14px; color: #4f46e5; }
    .note { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400e; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .cta { display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ECサイト改善診断レポート</h1>
      <p>${analyzedDate} 作成</p>
    </div>
    <div class="body">
      <p>この度は無料診断をご利用いただきありがとうございます。</p>
      <p>以下のECサイトの診断レポートをPDFで添付いたします。<br>改善施策の検討にご活用ください。</p>

      <p><strong>診断URL</strong></p>
      <div class="url-box">${url}</div>

      <div class="note">
        <strong>ご注意</strong><br>
        本レポートはAIが公開情報をもとに生成した仮説・提案です。成果を保証するものではありません。
        施策実施の際は、実際のデータ分析や専門家への相談も合わせてご検討ください。
      </div>

      <p>診断レポート（PDF）を本メールに添付しております。</p>
    </div>
    <div class="footer">
      <p>本メールはECサイト改善診断サービスより送信されました。</p>
      <p>お問い合わせはこちらのメールアドレスへご返信ください。</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"EC改善診断" <${from}>`,
    to,
    subject: `ECサイト改善診断レポート - ${new URL(url).hostname}`,
    html,
    attachments: [
      {
        filename: `ec-analysis-report-${new URL(url).hostname}-${Date.now()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}
