/**
 * Centralized Affiliate Configuration and Contextual Matching Engine
 * 
 * Supports approved affiliate programs (such as NordVPN) with transparent
 * disclosures, safe URL generation, and strict relevance auditing.
 */

import { Tool } from '../types/tool';

export interface AffiliateProgramConfig {
  id: string;
  name: string;
  affiliateUrl: string;
  isConfigured: boolean;
  disclosureAr: string;
  shortDisclosureAr: string;
  badgeTextAr: string;
}

// Official approved NordVPN affiliate tracking link
export const OFFICIAL_NORDVPN_AFFILIATE_URL = 'https://go.nordvpn.net/aff_c?offer_id=15&aff_id=141557';

// NordVPN Affiliate Configuration
// Uses NEXT_PUBLIC_NORDVPN_AFFILIATE_URL from environment if overridden,
// otherwise uses the verified approved official tracking link.
const configuredNordVpnUrl = process.env.NEXT_PUBLIC_NORDVPN_AFFILIATE_URL?.trim() || '';
const isConfiguredFromEnv = Boolean(
  configuredNordVpnUrl && 
  !configuredNordVpnUrl.includes('placeholder') &&
  !configuredNordVpnUrl.includes('example.com')
);

export const NORDVPN_CONFIG: AffiliateProgramConfig = {
  id: 'nordvpn',
  name: 'NordVPN',
  affiliateUrl: isConfiguredFromEnv ? configuredNordVpnUrl : OFFICIAL_NORDVPN_AFFILIATE_URL,
  isConfigured: true,
  disclosureAr: 'إفصاح الشفافية: قد يحصل تولزي على عمولة تسويقية عند الاشتراك عبر هذا الرابط، دون أي تكلفة إضافية عليك. نوصي فقط بالخدمات الموثوقة التي تفيد أمان اتصالك وتصفحك.',
  shortDisclosureAr: 'رابط إحالة معتمد — قد يحصل تولزي على عمولة دون تكلفة إضافية عليك.',
  badgeTextAr: 'توصية موثوقة للخصوصية والأمان',
};

/**
 * Returns the NordVPN tracking link with optional campaign or placement tracking.
 * Strictly preserves the required parameters (offer_id=15&aff_id=141557).
 */
export function getNordVpnAffiliateUrl(placement?: string): string {
  const baseUrl = NORDVPN_CONFIG.affiliateUrl;
  if (!placement) return baseUrl;

  try {
    const url = new URL(baseUrl);
    // Preserves offer_id and aff_id intact while adding HasOffers sub-placement tracking
    if (!url.searchParams.has('aff_sub')) {
      url.searchParams.set('aff_sub', placement);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Types of legitimate privacy/VPN contexts for audited tools
 */
export type PrivacyContextType = 
  | 'cybersecurity'
  | 'remote_ai_productivity'
  | 'sensitive_legal_data';

export interface ToolPrivacyContext {
  type: PrivacyContextType;
  headlineAr: string;
  noteAr: string;
  confidence: 'High' | 'Medium-High';
}

// Strict list of audited high-relevance tool identifiers & name patterns
const HIGH_PROFILE_REMOTE_TOOLS = [
  'chatgpt',
  'claude',
  'cursor',
  'copilot',
  'perplexity',
  'deepseek',
  'notion',
  'brave',
  'zoom',
  'canva',
  'figma'
];

/**
 * Audit evaluator: determines whether a specific tool legitimately warrants
 * a contextual privacy/VPN advisory recommendation.
 * Returns null if the tool is not relevant (ensuring zero forced recommendations).
 */
export function getToolPrivacyContext(tool: Tool | null | undefined): ToolPrivacyContext | null {
  if (!tool) return null;

  const cats = (Array.isArray(tool.category) ? tool.category : [tool.category])
    .filter(Boolean)
    .map((c) => String(c).toLowerCase());
  const subcats = (Array.isArray(tool.subcategory) ? tool.subcategory : [tool.subcategory])
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  const name = (tool.name || '').toLowerCase();
  const tags = (tool.tags || []).map((t) => String(t).toLowerCase());

  // 1. Cybersecurity & Privacy Tools (Highest Confidence)
  const isSecurityCat = 
    cats.includes('cybersecurity') || 
    cats.includes('security') ||
    subcats.some((s) => s.includes('security') || s.includes('privacy') || s.includes('vulnerability') || s.includes('auth')) ||
    tags.some((t) => t.includes('security') || t.includes('حماية') || t.includes('أمن') || t.includes('خصوصية'));

  if (isSecurityCat) {
    return {
      type: 'cybersecurity',
      headlineAr: 'حماية إضافية للخصوصية وتشفير حركة المرور',
      noteAr: `يتكامل استخدام شبكة VPN موثوقة مع أدوات الحماية لتشفير حركة المرور ومنع تسريب بيانات DNS على مستوى الشبكة بالكامل.`,
      confidence: 'High',
    };
  }

  // 2. High-Profile Cloud AI & Remote Productivity Platforms
  const isHighProfileRemote = HIGH_PROFILE_REMOTE_TOOLS.some((pattern) => name.includes(pattern));
  const isProductivityCloud = 
    cats.includes('productivity') && 
    subcats.some((s) => s.includes('collaboration') || s.includes('browser') || s.includes('meetings') || s.includes('writing'));

  if (isHighProfileRemote || isProductivityCloud) {
    return {
      type: 'remote_ai_productivity',
      headlineAr: 'تأمين الاتصال أثناء العمل عن بُعد',
      noteAr: `إذا كنت تستخدم أداة ${tool.name} عبر شبكات Wi-Fi العامة في المقاهي ومساحات العمل المشتركة، يُنصح بتشفير اتصالك عبر VPN لحماية جلساتك وبياناتك.`,
      confidence: 'High',
    };
  }

  // 3. LegalTech & Sensitive Document Platforms
  const isSensitiveData = 
    cats.includes('legaltech') || 
    subcats.some((s) => s.includes('compliance') || s.includes('contracts') || s.includes('finance'));

  if (isSensitiveData) {
    return {
      type: 'sensitive_legal_data',
      headlineAr: 'حماية سرية البيانات والمعاملات الحساسة',
      noteAr: `عند التعامل مع مستندات أو سجلات حساسة، يساعدك استخدام اتصال VPN مشفر في منع التنصت أو اعتراض البيانات على الشبكات غير الآمنة.`,
      confidence: 'Medium-High',
    };
  }

  return null;
}

/**
 * Quick boolean check if a tool is eligible for contextual recommendation.
 */
export function isNordVpnRelevantTool(tool: Tool | null | undefined): boolean {
  return getToolPrivacyContext(tool) !== null;
}
