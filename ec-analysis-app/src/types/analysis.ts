export interface Improvement {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  example: string;
}

export interface AnalysisResult {
  url: string;
  analyzedAt: string;
  siteSummary: string;
  productEstimate: string;
  targetAudience: string;
  strengths: string[];
  concerns: string[];
  improvements: Improvement[];
  firstViewAdvice: string;
  productPageAdvice: string;
  ctaAdvice: string;
  trustAdvice: string;
  summary: string;
}

export interface ScrapedData {
  title: string;
  description: string;
  keywords: string;
  headings: string[];
  mainText: string;
  products: string[];
  ctas: string[];
  prices: string[];
  shipping: string;
  returns: string;
  faq: string;
  reviews: string;
}

export interface AnalyzeRequest {
  url: string;
  email: string;
}

export interface SendPdfRequest {
  email: string;
  pdfBase64: string;
  url: string;
}
