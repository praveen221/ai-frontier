'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Company, TaxonomyLayer } from '@/lib/schema';
import { formatDate, hostFromUrl } from '@/lib/format';
import { Logo } from './Logo';

export function CompareClient({
  companies,
  layers,
}: {
  companies: Company[];
  layers: TaxonomyLayer[];
}) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('ids') ?? '';
    const fromUrl = raw.split(',').filter(Boolean).slice(0, 4);
    if (fromUrl.length) setIds(fromUrl);
    setReady(true);
  }, []);
  const selected = ids
    .map((id) => companies.find((company) => company.id === id))
    .filter((company): company is Company => Boolean(company));

  const add = (id: string) => {
    setIds((current) => (current.includes(id) || current.length >= 4 ? current : [...current, id]));
  };
  const remove = (id: string) => setIds((current) => current.filter((item) => item !== id));
  const layerName = (id: string) => layers.find((layer) => layer.id === id)?.name ?? id;

  return (
    <main id="main" className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Compare</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Pick 2–4 entries. Only public, sourced figures are shown.
      </p>

      <label className="mt-6 block max-w-md text-[12px] text-muted-foreground">
        Add
        <select
          className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[13px] text-foreground"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) add(event.target.value);
            event.target.value = '';
          }}
        >
          <option value="">Choose a company…</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </label>

      {!ready ? (
        <p className="mt-10 text-sm text-muted-foreground" aria-live="polite">
          Loading comparison…
        </p>
      ) : selected.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium">Nothing to compare yet.</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Choose 2–4 entries above, or tick Compare on the directory.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm text-primary">
            Back to the directory →
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-36 border-b border-border p-3 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Field
                </th>
                {selected.map((company) => (
                  <th key={company.id} className="border-b border-border p-3 text-left">
                    <div className="flex items-center gap-2">
                      <Logo name={company.name} website={company.website} />
                      <Link href={`/company/${company.id}/`} className="hover:text-primary">
                        {company.name}
                      </Link>
                    </div>
                    <button type="button" className="mt-1 text-[11px] text-muted-foreground" onClick={() => remove(company.id)}>
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="What it does" values={selected.map((c) => c.description)} />
              <Row label="Founded" values={selected.map((c) => String(c.founded))} />
              <Row label="HQ" values={selected.map((c) => c.headquarters)} />
              <Row label="Founders" values={selected.map((c) => c.founders.join(', '))} />
              <Row
                label="Layers"
                values={selected.map((c) => c.layers.map(layerName).join(', '))}
              />
              <Row
                label="Funding"
                values={selected.map((c) =>
                  c.funding.total
                    ? `${c.funding.total} (${c.funding.date ? formatDate(c.funding.date) : 'date unknown'})`
                    : '—',
                )}
              />
              <Row
                label="Valuation"
                values={selected.map((c) =>
                  c.valuation ? `${c.valuation.amount} (${formatDate(c.valuation.date)})` : '—',
                )}
              />
              <Row
                label="Investors"
                values={selected.map((c) => c.funding.investors.join(', ') || '—')}
              />
              <Row label="Website" values={selected.map((c) => hostFromUrl(c.website))} />
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="align-top">
      <th className="border-b border-border p-3 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </th>
      {values.map((value, index) => (
        <td key={`${label}-${index}`} className="border-b border-border p-3 text-muted-foreground">
          {value}
        </td>
      ))}
    </tr>
  );
}
