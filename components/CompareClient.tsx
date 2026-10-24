'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Company, TaxonomyLayer } from '@/lib/schema';
import { formatDate, hostFromUrl } from '@/lib/format';
import { SHELL, shortLayerName } from '@/lib/stack';
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
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('ids') ?? '';
    const fromUrl = raw.split(',').filter(Boolean).slice(0, 4);
    if (fromUrl.length) setIds(fromUrl);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const next = ids.length ? `/compare/?ids=${ids.join(',')}` : '/compare/';
    window.history.replaceState(null, '', next);
  }, [ids, ready]);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = ids
    .map((id) => companies.find((company) => company.id === id))
    .filter((company): company is Company => Boolean(company));

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies
      .filter((company) => !ids.includes(company.id))
      .filter(
        (company) =>
          !q ||
          company.name.toLowerCase().includes(q) ||
          company.headquarters.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [companies, ids, query]);

  const add = (id: string) => {
    setIds((current) => (current.includes(id) || current.length >= 4 ? current : [...current, id]));
    setQuery('');
    setOpen(false);
  };
  const remove = (id: string) => setIds((current) => current.filter((item) => item !== id));
  const layerName = (id: string) =>
    shortLayerName(layers.find((layer) => layer.id === id)?.name ?? id);

  return (
    <main id="main" className={`${SHELL} py-10`}>
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-primary">Compare</p>
      <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.03em]">Side by side</h1>
      <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
        Pick 2–4 entries. Only public, sourced figures are shown.
      </p>

      {ids.length < 4 && (
        <div ref={box} className="relative mt-6 max-w-md">
          <label className="block text-[14px] text-muted-foreground">
            Add a company
            <input
              type="search"
              role="combobox"
              aria-expanded={open}
              aria-controls="compare-options"
              aria-autocomplete="list"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search a name…"
              className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-[15px] outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          {open && (
            <ul
              id="compare-options"
              role="listbox"
              className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-background shadow-lg"
            >
              {matches.length === 0 ? (
                <li className="px-3 py-2.5 text-[14px] text-muted-foreground">No matches</li>
              ) : (
                matches.map((company) => (
                  <li key={company.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-accent"
                      onClick={() => add(company.id)}
                    >
                      <Logo name={company.name} website={company.website} />
                      <span>{company.name}</span>
                      <span className="ml-auto text-[13px] text-muted-foreground">{company.headquarters}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {!ready ? (
        <p className="mt-10 text-[15px] text-muted-foreground" aria-live="polite">
          Loading comparison…
        </p>
      ) : selected.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-[16px] font-medium">Nothing to compare yet.</p>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Search above, or tick Compare on the directory.
          </p>
          <Link href="/" className="mt-5 inline-block text-[14px] text-primary">
            Back to the directory →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:hidden">
            {selected.map((company) => (
              <article key={company.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Logo name={company.name} website={company.website} />
                    <Link href={`/company/${company.id}/`} className="text-[16px] font-medium">
                      {company.name}
                    </Link>
                  </div>
                  <button
                    type="button"
                    className="min-h-11 px-2 text-[14px] text-muted-foreground"
                    onClick={() => remove(company.id)}
                  >
                    Remove
                  </button>
                </div>
                <dl className="mt-4 space-y-3 text-[14px]">
                  <MobileRow label="What it does" value={company.description} />
                  <MobileRow label="Founded" value={String(company.founded)} />
                  <MobileRow label="HQ" value={company.headquarters} />
                  <MobileRow label="Founders" value={company.founders.join(', ')} />
                  <MobileRow label="Layers" value={company.layers.map(layerName).join(', ')} />
                  <MobileRow label="Funding" value={company.funding.total ?? '—'} />
                  <MobileRow label="Valuation" value={company.valuation?.amount ?? '—'} />
                  <MobileRow label="Website" value={hostFromUrl(company.website)} />
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-[15px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-36 bg-background p-3 text-left text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
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
                      <button
                        type="button"
                        className="mt-1 min-h-11 text-[14px] text-muted-foreground"
                        onClick={() => remove(company.id)}
                      >
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
                <Row label="Layers" values={selected.map((c) => c.layers.map(layerName).join(', '))} />
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
                <Row label="Investors" values={selected.map((c) => c.funding.investors.join(', ') || '—')} />
                <Row label="Website" values={selected.map((c) => hostFromUrl(c.website))} />
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="align-top">
      <th className="sticky left-0 z-10 bg-background p-3 text-left text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
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

function MobileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
