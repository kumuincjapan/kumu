import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedData } from '@/types/analysis';

export async function scrapeECSite(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
    timeout: 20000,
    maxRedirects: 5,
    validateStatus: (status) => status < 500,
  });

  if (response.status >= 400) {
    throw new Error(`サイトにアクセスできませんでした (HTTP ${response.status})`);
  }

  const contentType = String(response.headers['content-type'] || '');
  if (!contentType.includes('html')) {
    throw new Error('HTMLページではないため解析できません');
  }

  const $ = cheerio.load(response.data);

  $('script, style, noscript, svg, img').remove();

  const title = $('title').text().trim() || '（タイトルなし）';
  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';
  const keywords = $('meta[name="keywords"]').attr('content') || '';

  const headings: string[] = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text && text.length < 200) headings.push(text);
  });

  const bodyText = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 3000);

  // 商品らしき要素を抽出
  const products: string[] = [];
  const productSelectors = [
    '[class*="product"]',
    '[class*="item"]',
    '[class*="goods"]',
    '[class*="commodity"]',
    '[itemtype*="Product"]',
  ];
  for (const selector of productSelectors) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ').substring(0, 120);
      if (text && !products.includes(text)) products.push(text);
    });
    if (products.length >= 10) break;
  }

  // CTA ボタン・リンクを抽出
  const ctaSet = new Set<string>();
  $('button, a[class*="btn"], a[class*="button"], .btn, input[type="submit"], [class*="cta"]').each(
    (_, el) => {
      const text = ($(el).text().trim() || $(el).attr('value') || '').replace(/\s+/g, ' ');
      if (text && text.length < 50) ctaSet.add(text);
    }
  );

  // 価格表記を抽出
  const allText = $('body').text();
  const priceRegex = /[¥￥]\s*[\d,]+|[\d,]+\s*円/g;
  const priceMatches = [...new Set(allText.match(priceRegex) || [])];

  const lowerText = allText;
  const shipping = lowerText.includes('送料') ? '送料情報あり' : '送料情報なし（未検出）';
  const returns =
    lowerText.includes('返品') || lowerText.includes('返金')
      ? '返品・返金情報あり'
      : '返品情報なし（未検出）';
  const faq =
    lowerText.includes('FAQ') ||
    lowerText.includes('faq') ||
    lowerText.includes('よくある') ||
    lowerText.includes('よくある質問')
      ? 'FAQ情報あり'
      : 'FAQ情報なし（未検出）';
  const reviews =
    lowerText.includes('レビュー') ||
    lowerText.includes('口コミ') ||
    lowerText.includes('評価') ||
    lowerText.includes('レーティング')
      ? 'レビュー・口コミ情報あり'
      : 'レビュー情報なし（未検出）';

  return {
    title,
    description,
    keywords,
    headings: headings.slice(0, 20),
    mainText: bodyText,
    products: products.slice(0, 10),
    ctas: [...ctaSet].slice(0, 10),
    prices: priceMatches.slice(0, 10),
    shipping,
    returns,
    faq,
    reviews,
  };
}
