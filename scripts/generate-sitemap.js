import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// قائمة الصفحات الثابتة
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/tools', priority: '0.9', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'weekly' },
  { url: '/news', priority: '0.8', changefreq: 'daily' },
  { url: '/guide', priority: '0.7', changefreq: 'weekly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/contact', priority: '0.6', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/terms', priority: '0.5', changefreq: 'yearly' },
];

// الدومينات المتاحة
const domains = [
  'https://tolzy.me',
  'https://tolzy.vercel.app',
  'https://neovex.vercel.app'
];

// رابط الموقع الأساسي (الدومين الرئيسي)
const baseUrl = domains[0];

// تاريخ اليوم
const today = new Date().toISOString().split('T')[0];

// إنشاء محتوى sitemap.xml
function generateSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  // إضافة الصفحات الثابتة
  staticPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    
    // إضافة روابط بديلة للدومينات الأخرى
    domains.forEach(domain => {
      sitemap += `    <xhtml:link rel="alternate" hreflang="ar" href="${domain}${page.url}" />\n`;
    });
    
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';

  return sitemap;
}

// إنشاء sitemap index للدومينات المتعددة
function generateSitemapIndex() {
  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  domains.forEach(domain => {
    sitemapIndex += '  <sitemap>\n';
    sitemapIndex += `    <loc>${domain}/sitemap.xml</loc>\n`;
    sitemapIndex += `    <lastmod>${today}</lastmod>\n`;
    sitemapIndex += '  </sitemap>\n';
  });

  sitemapIndex += '</sitemapindex>';

  return sitemapIndex;
}

// كتابة الملفات
const sitemapContent = generateSitemap();
const sitemapIndexContent = generateSitemapIndex();
const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
const indexOutputPath = join(__dirname, '..', 'public', 'sitemap-index.xml');

try {
  writeFileSync(outputPath, sitemapContent, 'utf-8');
  console.log('✅ تم إنشاء sitemap.xml بنجاح في:', outputPath);
  
  writeFileSync(indexOutputPath, sitemapIndexContent, 'utf-8');
  console.log('✅ تم إنشاء sitemap-index.xml بنجاح في:', indexOutputPath);
} catch (error) {
  console.error('❌ خطأ في إنشاء sitemap:', error);
  process.exit(1);
}
