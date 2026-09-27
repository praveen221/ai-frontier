# AI Frontier

AI Frontier is a static, GitHub Pages-friendly prototype for exploring the companies, technologies, capital, and research shaping the AI ecosystem.

## Run locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Publish on GitHub Pages

Push this repository to GitHub, then choose **Settings → Pages → Deploy from a branch → main → / (root)**. No build step is required.

## Pages

- `index.html` — company directory with search, filters, and a persistent company detail pane.
- `taxonomy.html` — the full taxonomy map: 10 domains and 80 subdomains.
- `companies.json` — 61 seed records across 12 domains; this is the editable research dataset, separate from the UI.

## Next step

The company and category data currently lives in `script.js` so the prototype is easy to edit. A future version can move the data to JSON and add an ingestion service without changing the front-end.
