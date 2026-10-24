# AI Frontier

A static, browsable directory of the AI ecosystem — chips through applications — so someone who knows only a little deep learning can see every layer and who is building it.

The site is a Next.js App Router app with `output: 'export'`. There is no backend and no runtime API. All data lives in versioned JSON.

## Browse

- `/` — visual stack map, directory list, filters, and a detail pane
- `/taxonomy/` — the full layer map
- `/layer/[id]/` — deep link for one layer
- `/company/[id]/` — shareable company page (sources next to every figure)
- `/compare/` — side-by-side view of 2–4 entries
- `/recent/` — added/updated dates from the data files

Search is client-side (⌘K). Theme follows the system and can be toggled.

## Data format

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the record shape and accuracy rules.

- `data/taxonomy.json` — non-overlapping layers, bottom-up
- `data/companies.json` — seed catalog
- `data/companies/*.json` — extra records, one file per batch/layer (merged at build time)

```bash
npm run validate
```

A scheduled bot can later update the catalog by committing JSON. That workflow is intentionally not included yet.

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build   # validates, then writes static files to out/
```

## Deploy

### Vercel (production)

The project is static and should be served from the **root path**.

1. Import the GitHub repo in Vercel.
2. Framework preset: Next.js. Build command: `npm run build`. Output: `out`.
3. Leave `NEXT_PUBLIC_BASE_PATH` unset.
4. Optional: set `NEXT_PUBLIC_SITE_URL` to the production origin for sitemap / Open Graph URLs.
5. Production branch: `main`.

### GitHub Pages (optional)

If you ever serve the export from `https://<user>.github.io/ai-frontier/`:

```bash
NEXT_PUBLIC_BASE_PATH=/ai-frontier NEXT_PUBLIC_SITE_URL=https://<user>.github.io/ai-frontier npm run build
```

`next.config.ts` reads `NEXT_PUBLIC_BASE_PATH` for `basePath` and `assetPrefix`.

## License

[MIT](./LICENSE)
