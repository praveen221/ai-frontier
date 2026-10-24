/**
 * Assert the live-review UI fixes against a running server.
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npx tsx scripts/verify-ui.ts
 */
import { chromium, type Page } from 'playwright';

const BASE = (process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

const failures: string[] = [];
const passes: string[] = [];

function ok(name: string, cond: boolean, detail = '') {
  if (cond) passes.push(name);
  else failures.push(detail ? `${name}: ${detail}` : name);
}

async function measureOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      client: doc.clientWidth,
      scroll: doc.scrollWidth,
      body: document.body.scrollWidth,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20_000);

  // Desktop home
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  const h1s = await page.locator('h1').allTextContents();
  ok('home single H1', h1s.length === 1, `h1s=${JSON.stringify(h1s)}`);

  const selectedRows = await page.locator('[aria-selected="true"]').count();
  ok('no default company selected', selectedRows === 0, `selected=${selectedRows}`);

  const firstLogo = page.locator('ul li span.inline-flex').first();
  const logoBox = await firstLogo.boundingBox();
  ok('list logo is 32px tile', Boolean(logoBox && Math.abs(logoBox.width - 32) < 2 && Math.abs(logoBox.height - 32) < 2), JSON.stringify(logoBox));

  const logoBg = await firstLogo.evaluate((el) => getComputedStyle(el).backgroundColor);
  ok('logo tile is not white', logoBg !== 'rgb(255, 255, 255)' && logoBg !== 'rgba(0, 0, 0, 0)', logoBg);

  const sidebarGroups = await page.locator('aside >> text=Compute').count();
  ok('sidebar groups under stack headings', sidebarGroups > 0);

  const safetyAfterAgents = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('aside button')].map((el) => el.textContent || '');
    const agents = labels.findIndex((t) => t.includes('Agents'));
    const safety = labels.findIndex((t) => t.includes('Safety'));
    const apps = labels.findIndex((t) => t.includes('Coding') || t.includes('Applications'));
    return { agents, safety, apps, labels };
  });
  ok(
    'Safety is not between Agents and Applications',
    safetyAfterAgents.safety > safetyAfterAgents.apps && safetyAfterAgents.apps > safetyAfterAgents.agents,
    JSON.stringify(safetyAfterAgents),
  );

  const prefixes = await page.locator('aside button:has-text("Foundation Models:")').count();
  ok('sidebar drops Foundation Models prefixes', prefixes === 0, `count=${prefixes}`);

  await page.locator('#directory-search').fill('anthropic');
  await page.waitForTimeout(200);
  const afterSearch = await page.locator('[aria-live="polite"]').first().innerText();
  ok('counts update with search', /1 of 1/.test(afterSearch) || /matching/.test(afterSearch), afterSearch);
  const frontierCount = await page.getByRole('button', { name: /Frontier Labs/i }).innerText();
  ok('sidebar count is search-aware', /1\s*$/.test(frontierCount.trim()) || frontierCount.includes('1'), frontierCount);

  await page.locator('#directory-search').fill('');
  await page.getByText(/of 495/).first().waitFor();
  const amdRow = page.locator('li').filter({ has: page.getByRole('link', { name: 'AMD', exact: true }) });
  await amdRow.locator('input[type="checkbox"]').check();
  await page.getByRole('link', { name: /Open compare/ }).waitFor();
  const href = await page.getByRole('link', { name: /Open compare/ }).getAttribute('href');
  ok('compare link carries ids', Boolean(href && href.includes('/compare/') && href.includes('ids=') && href.includes('amd')), href || 'missing');

  await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
  const url = page.url();
  ok('compare page keeps ids in URL', url.includes('ids=') && url.includes('amd'), url);
  const combo = await page.locator('[role="combobox"]').count();
  const fatSelect = await page.locator('select option').count();
  ok('compare uses searchable combobox', combo >= 1, `combo=${combo}`);
  ok('compare is not a 495-option select', fatSelect < 30, `options=${fatSelect}`);

  // Layer page: single header
  await page.goto(`${BASE}/layer/models-video/`, { waitUntil: 'networkidle' });
  const layerH1 = await page.locator('h1').allTextContents();
  ok('layer page has layer-specific H1 only', layerH1.length === 1 && /Video/i.test(layerH1[0]), JSON.stringify(layerH1));
  const generic = await page.locator('text=Who is building each layer of AI').count();
  ok('layer page hides generic home H1', generic === 0);

  // Company page
  await page.goto(`${BASE}/company/nvidia/`, { waitUntil: 'networkidle' });
  const notDisclosed = await page.locator('text=Not disclosed').count();
  ok('company page hides Not disclosed', notDisclosed === 0);
  const sourcePlain = await page.locator('text=Source ·').count();
  ok('source is not shouted as Source · date', sourcePlain === 0);
  const added = await page.locator('text=Added').count();
  const updated = await page.locator('text=Updated').count();
  ok('hides identical added/updated', added === 0 && updated === 0, `added=${added} updated=${updated}`);
  const companyWidth = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? { max: getComputedStyle(main).maxWidth, cls: main.className } : { max: '', cls: '' };
  });
  ok('company uses 1440 shell', companyWidth.max === '1440px' || companyWidth.cls.includes('shell'), JSON.stringify(companyWidth));

  await page.goto(`${BASE}/company/scale-ai/`, { waitUntil: 'networkidle' });
  const subdomain = await page.locator('text=Data labeling & annotation').count();
  ok('Scale AI subdomain appears once', subdomain === 1, `count=${subdomain}`);

  // Recent
  await page.goto(`${BASE}/recent/`, { waitUntil: 'networkidle' });
  const recentCopy = await page.locator('main p').nth(1).innerText();
  ok('recent subtitle is plain sourced copy', /sourced/i.test(recentCopy) && !/addedAt|updatedAt/.test(recentCopy), recentCopy);
  const headings = await page.locator('main h2').allTextContents();
  ok('recent groups by sourced as-of dates', headings.length >= 2, JSON.stringify(headings));
  ok(
    'recent is not a single import-day dump',
    headings.some((h) => !/Oct 24, 2026/.test(h)),
    JSON.stringify(headings),
  );

  // Theme toggle label
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const theme = page.getByRole('button', { name: /light mode|dark mode/i });
  ok('theme toggle is labelled', (await theme.count()) >= 1);

  // Ctrl-K palette
  await page.keyboard.press('Control+K');
  const palette = page.getByRole('dialog', { name: /command palette/i });
  ok('Ctrl-K opens command palette', await palette.isVisible());
  await page.keyboard.press('Escape');

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const hamburger = page.getByRole('button', { name: /Open menu/i });
  ok('mobile has collapsed nav', await hamburger.isVisible());
  const clippedNav = await page.locator('header nav:visible').count();
  ok('desktop nav hidden on mobile', clippedNav === 0, `visible nav=${clippedNav}`);
  const stack = page.getByText('Bottom-up, no overlapping buckets');
  ok('mobile hides stack strip', (await stack.count()) === 0 || !(await stack.isVisible()));
  const overflow = await measureOverflow(page);
  ok('home has no page-level horizontal overflow', overflow.scroll <= overflow.client + 1, JSON.stringify(overflow));

  await hamburger.click();
  ok('mobile menu reveals Recent', await page.getByRole('link', { name: 'Recent' }).isVisible());
  ok('mobile menu reveals GitHub', await page.getByRole('link', { name: 'GitHub' }).isVisible());

  await page.goto(`${BASE}/compare/?ids=openai,anthropic,nvidia`, { waitUntil: 'networkidle' });
  const tableVisible = await page.locator('table').isVisible().catch(() => false);
  const cards = await page.locator('article').count();
  ok('mobile compare uses stacked cards', !tableVisible && cards >= 3, `tableVisible=${tableVisible} cards=${cards}`);
  const compareOverflow = await measureOverflow(page);
  ok(
    'mobile compare has no page-level overflow',
    compareOverflow.scroll <= compareOverflow.client + 1,
    JSON.stringify(compareOverflow),
  );

  await page.goto(`${BASE}/company/nvidia/`, { waitUntil: 'networkidle' });
  const nvidiaOverflow = await measureOverflow(page);
  ok(
    'mobile company has no page-level overflow',
    nvidiaOverflow.scroll <= nvidiaOverflow.client + 1,
    JSON.stringify(nvidiaOverflow),
  );

  const bodySize = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
  ok('body is at least 14px', bodySize >= 14, `fontSize=${bodySize}`);

  await browser.close();

  console.log(`\nUI verify: ${passes.length} passed, ${failures.length} failed`);
  for (const name of passes) console.log(`  PASS  ${name}`);
  for (const name of failures) console.log(`  FAIL  ${name}`);
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
