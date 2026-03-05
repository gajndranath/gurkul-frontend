const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.gurukulselfstudycentre.in'; // Corrected to .in with www as per Search Console

const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/student/login', changefreq: 'monthly', priority: 0.5 },
  { url: '/student/register', changefreq: 'monthly', priority: 0.5 },
  { url: '/student/verify-otp', changefreq: 'monthly', priority: 0.3 },
  { url: '/student/resend-otp', changefreq: 'monthly', priority: 0.3 },
];

function generateSitemap() {
  console.log('Generating sitemap...');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    return `  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  const publicDir = path.join(__dirname, '..', 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap generated successfully at ${sitemapPath}`);
}

generateSitemap();
