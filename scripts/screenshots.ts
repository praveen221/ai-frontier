/**
 * Visual baseline for AI Frontier.
 *
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run screenshots
 *   npm run screenshots -- --out docs/screenshots/after
 *
 * Captures desktop (1440×900) and mobile (390×844) across the core
 * browsing states so PRs can ship before/after pairs.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Page } from 'playwright';

const BASE = (process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const OUT = (() => {
  const flag = process.argv.indexOf('--out');
  if (flag >= 0 && process.argv[flag + 1]) return process.argv[flag + 1];
  return process.env.PLAYWRIGHT_OUT || 'docs/screenshots/current';
})();

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

type Shot = {
  name: string;
  path: string;
  setup?: (page: Page) => Promise<void>;
  fullPage?: boolean;
};

const SHOTS: Shot[] = [
  { name: 'home-fold', path: '/', fullPage: false },
  { name: 'home', path: '/' },
  { name: 'taxonomy', path: '/taxonomy/' },
  { name: 'layer-models-frontier', path: '/layer/models-frontier/' },
  { name: 'layer-models-video', path: '/layer/models-video/' },
  { name: 'layer-apps-vertical', path: '/layer/apps-vertical/' },
  { name: 'company-openai', path: '/company/openai/' },
  { name: 'company-nvidia', path: '/company/nvidia/' },
  { name: 'company-mistral', path: '/company/mistral-ai/' },
  { name: 'company-scale-ai', path: '/company/scale-ai/' },
  { name: 'company-cerebras', path: '/company/cerebras/' },
  { name: 'company-harvey', path: '/company/harvey/' },
  { name: 'company-anduril', path: '/company/anduril/' },
  { name: 'company-elevenlabs', path: '/company/elevenlabs/' },
  { name: 'recent', path: '/recent/' },
  { name: 'compare-empty', path: '/compare/' },
  { name: 'compare-3', path: '/compare/?ids=openai,anthropic,nvidia' },
  {
    name: 'search',
    path: '/',
    setup: async (page) => {
      const box = page.locator('#directory-search');
      await box.waitFor({ state: 'visible' });
      await box.fill('anthropic');
      await page.waitForTimeout(250);
    },
  },
  {
    name: 'filters',
    path: '/',
    setup: async (page) => {
      const button = page.getByRole('button', { name: /Frontier Labs/i });
      if (await button.isVisible().catch(() => false)) {
        await button.click();
      } else {
        await page.locator('aside select').selectOption('models-frontier');
      }
      await page.waitForTimeout(250);
    },
  },
  {
    name: 'compare-selected',
    path: '/',
    setup: async (page) => {
      const chips = page.getByRole('button', { name: /Chips/i });
      if (await chips.isVisible().catch(() => false)) {
        await chips.click();
      } else {
        await page.locator('aside select').selectOption('chips-silicon');
      }
      await page.waitForTimeout(200);
      for (const name of ['AMD', 'Apple', 'Arm']) {
        const row = page.locator('li').filter({ hasText: name }).first();
        const box = row.locator('input[type="checkbox"]');
        if (await box.count()) await box.check();
      }
      await page.waitForTimeout(200);
    },
  },
  {
    name: 'empty-search',
    path: '/',
    setup: async (page) => {
      const box = page.locator('#directory-search');
      await box.waitFor({ state: 'visible' });
      await box.fill('zzzz-no-such-company');
      await page.waitForTimeout(250);
    },
  },
];

async function shoot(page: Page, viewport: keyof typeof VIEWPORTS, shot: Shot) {
  await page.setViewportSize(VIEWPORTS[viewport]);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.addStyleTag({
    content: '*, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; }',
  });
  if (shot.setup) await shot.setup(page);
  const file = join(OUT, `${viewport}-${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: shot.fullPage !== false });
  console.log(`  ${file}`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`Screenshotting ${BASE} → ${OUT}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20_000);

  for (const viewport of Object.keys(VIEWPORTS) as Array<keyof typeof VIEWPORTS>) {
    for (const shot of SHOTS) {
      try {
        await shoot(page, viewport, shot);
      } catch (error) {
        console.error(`  FAIL ${viewport}-${shot.name}:`, (error as Error).message);
      }
    }
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
