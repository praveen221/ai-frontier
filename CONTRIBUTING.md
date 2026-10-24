# Contributing

AI Frontier is a static directory. The site is generated from versioned JSON. A later bot can update the catalog by committing JSON; there is no scheduled updater yet.

## Data files

| File | Purpose |
| --- | --- |
| `data/taxonomy.json` | Ordered layers and subdomains. Each layer has a one-line explainer. |
| `data/companies.json` | Seed catalog. Later files in `data/companies/*.json` overlay by `id`. |

`npm run validate` reads either the single companies file or every `data/companies/*.json` file.

## Company record

```json
{
  "id": "acme",
  "name": "Acme",
  "description": "One or two sentences. What it actually does.",
  "layers": ["models-open"],
  "subdomains": ["Open language models (Llama, Mistral, Qwen)"],
  "founded": 2023,
  "founders": ["Ada Lovelace"],
  "headquarters": "Paris, France",
  "website": "https://example.com",
  "entityType": "company",
  "addedAt": "2026-10-24",
  "updatedAt": "2026-10-24",
  "funding": {
    "total": "$10M",
    "stage": "Seed",
    "investors": ["Example Ventures"],
    "source": "https://example.com/blog/seed",
    "date": "2024-06-01"
  },
  "valuation": {
    "amount": "$80M",
    "date": "2024-06-01",
    "source": "https://example.com/blog/seed",
    "notes": "Post-money at seed"
  },
  "identitySource": {
    "source": "https://example.com/about",
    "date": "2026-10-24",
    "fields": ["founders", "founded", "headquarters"]
  },
  "tags": ["open-weight"]
}
```

`entityType` is one of `company`, `research`, `institution`, `investor`. Academic and nonprofit labs use `research`. Government bodies use `institution`.

`identitySource` is optional. Add it only when the linked page actually states the listed fields (founders, founding year, and/or HQ).

## Accuracy rules

- Never invent or estimate numbers.
- Every funding total, valuation, and revenue figure needs a `source` URL and an `as-of` `date` (`YYYY-MM-DD`).
- Prefer primary sources: company posts, filings, reputable press.
- If you cannot find a public source, leave the field `null` / omit it.
- `layers` must be ids from `data/taxonomy.json`. Subdomains must belong to one of the record's layers.

## Workflow

1. Edit the JSON (keep diffs small; prefer one layer per file once the catalog is split).
2. Run `npm run validate`.
3. Open a pull request.

Do not add a scheduled data-update workflow unless a maintainer asks for one.
