'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Company, TaxonomyLayer } from '@/lib/schema';
import { entityLabel, formatDate, hostFromUrl } from '@/lib/format';
import { IconClose, IconExternal, IconSearch } from './Icons';
import { Logo } from './Logo';

type SortKey = 'name' | 'founded' | 'funding' | 'updated';

function fundingValue(total: string | null): number {
  if (!total) return 0;
  const match = total.replace(/,/g, '').match(/([\d.]+)\s*([TtBbMmKk])?/);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();
  const mul = unit === 'T' ? 1e12 : unit === 'B' ? 1e9 : unit === 'M' ? 1e6 : unit === 'K' ? 1e3 : 1;
  return n * mul;
}

export function Directory({
  companies,
  layers,
  initialLayer = 'all',
}: {
  companies: Company[];
  layers: TaxonomyLayer[];
  initialLayer?: string;
}) {
  const [query, setQuery] = useState('');
  const [layerId, setLayerId] = useState(initialLayer);
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [selectedId, setSelectedId] = useState<string | null>(companies[0]?.id ?? null);
  const [compare, setCompare] = useState<string[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [visible, setVisible] = useState(40);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('directory-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: companies.length };
    for (const layer of layers) {
      next[layer.id] = companies.filter((c) => c.layers.includes(layer.id)).length;
    }
    return next;
  }, [companies, layers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = companies.filter((company) => {
      if (layerId !== 'all' && !company.layers.includes(layerId)) return false;
      if (!q) return true;
      const hay = [
        company.name,
        company.fullName,
        company.description,
        company.headquarters,
        company.founders.join(' '),
        company.funding.investors.join(' '),
        company.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    rows.sort((a, b) => {
      if (sortBy === 'founded') return b.founded - a.founded;
      if (sortBy === 'updated') return b.updatedAt.localeCompare(a.updatedAt);
      if (sortBy === 'funding') return fundingValue(b.funding.total) - fundingValue(a.funding.total);
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [companies, layerId, query, sortBy]);

  useEffect(() => {
    setVisible(40);
  }, [query, layerId, sortBy]);

  useEffect(() => {
    if (selectedId && !filtered.some((c) => c.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const visibleRows = filtered.slice(0, visible);

  const selected = filtered.find((c) => c.id === selectedId) ?? null;
  const layerName = (id: string) => layers.find((layer) => layer.id === id)?.name ?? id;

  const toggleCompare = (id: string) => {
    setCompare((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[1500px] grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
      <aside className="border-b border-border lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Layers</p>
          <button type="button" className="text-[12px] text-primary" onClick={() => setMobileFilters((v) => !v)}>
            {mobileFilters ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className={`px-3 pb-4 ${mobileFilters ? 'block' : 'hidden'} lg:block`}>
          <p className="hidden px-2 pb-3 pt-5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground lg:block">
            Browse layers
          </p>
          <LayerButton
            active={layerId === 'all'}
            label="All entries"
            count={counts.all}
            onClick={() => setLayerId('all')}
          />
          <div className="mt-1 flex gap-1 overflow-x-auto lg:block lg:overflow-visible">
            {layers.map((layer) => (
              <LayerButton
                key={layer.id}
                active={layerId === layer.id}
                label={layer.name}
                count={counts[layer.id] ?? 0}
                onClick={() => setLayerId(layer.id)}
              />
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="border-b border-border px-4 py-8 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.12em] text-primary">Directory</p>
          <h1 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Who is building each layer of AI.
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            {companies.length} sourced entries. Filter by layer, search anything, or open a card
            beside the list.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="pointer-events-none absolute left-3 text-muted-foreground">
              <IconSearch />
            </span>
            <input
              id="directory-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, founder, investor…"
              aria-label="Search companies, founders, and investors"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-16 text-[13px] outline-none focus:ring-2 focus:ring-ring"
            />
            <kbd className="pointer-events-none absolute right-2 hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
              ⌘K
            </kbd>
          </label>
          <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Sort
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="h-9 rounded-md border border-border bg-background px-2 text-[13px] text-foreground"
            >
              <option value="name">Name</option>
              <option value="founded">Founded</option>
              <option value="funding">Funding</option>
              <option value="updated">Updated</option>
            </select>
          </label>
          <p className="text-[11px] text-muted-foreground" aria-live="polite">
            {filtered.length} of {companies.length}
          </p>
        </div>

        {compare.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-2 text-[12px] sm:px-6">
            <p>{compare.length} selected for compare</p>
            <Link href={`/compare/?ids=${compare.join(',')}`} className="text-primary">
              Open compare →
            </Link>
          </div>
        )}

        <ul className="divide-y divide-border">
          {filtered.length === 0 ? (
            <li className="px-6 py-16 text-center">
              <p className="text-sm font-medium">No matches in this slice of the stack.</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Try another layer, or search a founder or investor.
              </p>
              <button
                type="button"
                className="mt-4 text-sm text-primary"
                onClick={() => {
                  setQuery('');
                  setLayerId('all');
                }}
              >
                Clear filters
              </button>
            </li>
          ) : (
            visibleRows.map((company) => (
              <li key={company.id}>
                <div
                  className={`flex cursor-pointer gap-3 px-4 py-4 sm:px-6 ${
                    selectedId === company.id ? 'bg-primary/5' : 'hover:bg-accent/60'
                  }`}
                  onClick={() => setSelectedId(company.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedId(company.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <Logo name={company.name} website={company.website} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/company/${company.id}/`} className="font-medium hover:text-primary">
                          {company.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          {entityLabel(company.entityType)} · {company.headquarters}
                        </p>
                      </div>
                      <label className="flex items-center gap-1 text-[11px] text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={compare.includes(company.id)}
                          onChange={() => toggleCompare(company.id)}
                        />
                        Compare
                      </label>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{company.description}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {company.founded}
                      {company.funding.total ? ` · raised ${company.funding.total}` : ''}
                      {company.valuation ? ` · val ${company.valuation.amount}` : ''}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        {visible < filtered.length && (
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <button
              type="button"
              className="text-sm text-primary"
              onClick={() => setVisible((count) => count + 40)}
            >
              Show more ({filtered.length - visible} remaining)
            </button>
          </div>
        )}
      </div>

      <aside className="border-t border-border lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:border-l lg:border-t-0">
        {selected ? (
          <article className="px-5 py-6">
            <div className="flex items-start justify-between gap-3">
              <Logo name={selected.name} website={selected.website} size={36} />
              <button
                type="button"
                className="lg:hidden"
                onClick={() => setSelectedId(null)}
                aria-label="Close detail"
              >
                <IconClose />
              </button>
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.08em] text-primary">
              {selected.layers.map(layerName).join(' · ')}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{selected.name}</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {selected.headquarters} · Founded {selected.founded}
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{selected.description}</p>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-[13px]">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Funding</dt>
                <dd className="mt-1 font-medium">{selected.funding.total ?? 'Not disclosed'}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Stage</dt>
                <dd className="mt-1 font-medium">{selected.funding.stage}</dd>
              </div>
              {selected.valuation && (
                <div className="col-span-2">
                  <dt className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Valuation</dt>
                  <dd className="mt-1 font-medium">{selected.valuation.amount}</dd>
                  <p className="text-[11px] text-muted-foreground">as of {formatDate(selected.valuation.date)}</p>
                </div>
              )}
            </dl>

            <section className="mt-4">
              <h3 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Founders</h3>
              <p className="mt-1 text-[13px]">{selected.founders.join(', ')}</p>
            </section>
            {selected.funding.investors.length > 0 && (
              <section className="mt-4">
                <h3 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Investors</h3>
                <p className="mt-1 text-[13px]">{selected.funding.investors.join(', ')}</p>
              </section>
            )}

            <div className="mt-6 flex flex-col gap-2 text-[13px]">
              <Link href={`/company/${selected.id}/`} className="text-primary">
                Open full profile →
              </Link>
              <a
                href={selected.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary"
              >
                {hostFromUrl(selected.website)}
                <IconExternal />
              </a>
            </div>
          </article>
        ) : (
          <p className="px-5 py-16 text-center text-[12px] text-muted-foreground">Select a company to inspect it.</p>
        )}
      </aside>
    </div>
  );
}

function LayerButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-0.5 flex w-auto shrink-0 items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-[12px] lg:w-full ${
        active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="font-mono text-[10px]">{count}</span>
    </button>
  );
}
