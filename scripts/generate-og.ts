import * as fs from 'fs';
import * as path from 'path';
import { getCompanies, getLayers } from '../lib/data';
import { SITE_URL } from '../lib/site';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function card(title: string, kicker: string, footer: string): string {
  const safeTitle = escapeXml(title.length > 42 ? `${title.slice(0, 40)}…` : title);
  const safeKicker = escapeXml(kicker);
  const safeFooter = escapeXml(footer.length > 88 ? `${footer.slice(0, 86)}…` : footer);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f8fa"/>
  <rect x="48" y="48" width="1104" height="534" fill="#ffffff" stroke="#dce1e6"/>
  <text x="96" y="160" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22" fill="#2457d6">${safeKicker}</text>
  <text x="96" y="280" font-family="ui-sans-serif, system-ui, sans-serif" font-size="56" font-weight="600" fill="#17202a">${safeTitle}</text>
  <text x="96" y="520" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="20" fill="#64707d">${safeFooter}</text>
</svg>
`;
}

async function rasterize(svg: string, pngPath: string) {
  try {
    const { Resvg } = await import('@resvg/resvg-js');
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    fs.writeFileSync(pngPath, png);
  } catch {
    // PNG conversion is optional if the native renderer is unavailable.
  }
}

function writeSitemap() {
  const urls = [
    '/',
    '/taxonomy/',
    '/compare/',
    '/recent/',
    ...getLayers().map((layer) => `/layer/${layer.id}/`),
    ...getCompanies().map((company) => `/company/${company.id}/`),
  ];
  const body = urls
    .map(
      (url) =>
        `  <url><loc>${SITE_URL}${url}</loc><changefreq>weekly</changefreq></url>`,
    )
    .join('\n');
  fs.writeFileSync(
    path.join(process.cwd(), 'public', 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  );
  fs.writeFileSync(
    path.join(process.cwd(), 'public', 'robots.txt'),
    `User-Agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  );
}

async function main() {
  const dir = path.join(process.cwd(), 'public', 'og');
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });

  const jobs: Array<{ file: string; svg: string }> = [
    {
      file: 'default',
      svg: card('The AI stack, end to end.', 'AI FRONTIER', 'chips · clouds · data · models · tools · apps'),
    },
    ...getLayers().map((layer) => ({
      file: layer.id,
      svg: card(layer.name, 'AI FRONTIER / LAYER', layer.description),
    })),
    ...getCompanies().map((company) => ({
      file: company.id,
      svg: card(company.name, 'AI FRONTIER / DIRECTORY', company.description),
    })),
  ];

  for (const job of jobs) {
    fs.writeFileSync(path.join(dir, `${job.file}.svg`), job.svg);
    await rasterize(job.svg, path.join(dir, `${job.file}.png`));
  }

  writeSitemap();
  console.log(`Wrote OG cards for ${jobs.length} pages plus sitemap.xml.`);
}

main();
