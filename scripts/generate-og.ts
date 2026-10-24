import * as fs from 'fs';
import * as path from 'path';
import { getCompanies, getLayers } from '../lib/data';

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
  const safeFooter = escapeXml(footer);
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

function writeOg(fileName: string, svg: string) {
  const dir = path.join(process.cwd(), 'public', 'og');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, fileName), svg);
}

function main() {
  writeOg(
    'default.svg',
    card('The AI stack, end to end.', 'AI FRONTIER', 'chips · clouds · data · models · tools · apps'),
  );

  for (const layer of getLayers()) {
    writeOg(`${layer.id}.svg`, card(layer.name, 'AI FRONTIER / LAYER', layer.description));
  }

  for (const company of getCompanies()) {
    writeOg(
      `${company.id}.svg`,
      card(company.name, 'AI FRONTIER / DIRECTORY', company.description),
    );
  }

  console.log(`Wrote OG images for ${getCompanies().length} entries and ${getLayers().length} layers.`);
}

main();
