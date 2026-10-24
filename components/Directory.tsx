'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import type { Company, TaxonomyLayer } from '@/lib/schema';
import { entityLabel, hostFromUrl } from '@/lib/format';
import { SHELL_WIDTH, STACK_GROUPS, shortLayerName } from '@/lib/stack';
import { IconClose, IconExternal, IconSearch } from './Icons';
import { Logo } from './Logo';

type SortKey = 'name' | 'founded' | 'funding' | 'updated';

const PAGE = 80;

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
  hideHero = false,
}: {
  companies: Company[];
  layers: TaxonomyLayer[];
  initialLayer?: string;
  hideHero?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [layerId, setLayerId] = useState(initialLayer);
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [visible, setVisible] = useState(PAGE);
  const [sheet, setSheet] = useState(false);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((company) => {
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
  }, [companies, query]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: searched.length };
    for (const layer of layers) {
      next[layer.id] = searched.filter((c) => c.layers.includes(layer.id)).length;
    }
    return next;
  }, [layers, searched]);

  const groupedLayers = useMemo(() => {
    const byId = new Map(layers.map((layer) => [layer.id, layer]));
    const used = new Set<string>();
    const groups = STACK_GROUPS.map((group) => ({
      title: group.title,
      layers: group.ids
        .map((id) => byId.get(id))
        .filter((layer): layer is TaxonomyLayer => Boolean(layer)),
    })).filter((group) => group.layers.length > 0);
    for (const group of groups) {
      for (const layer of group.layers) used.add(layer.id);
    }
    const leftover = layers.filter((layer) => !used.has(layer.id));
    if (leftover.length) groups.push({ title: 'Other', layers: leftover });
    return groups;
  }, [layers]);

  const filtered = useMemo(() => {
    const rows =
      layerId === 'all' ? searched.slice() : searched.filter((company) => company.layers.includes(layerId));

    rows.sort((a, b) => {
      if (sortBy === 'founded') return b.founded - a.founded;
      if (sortBy === 'updated') return b.updatedAt.localeCompare(a.updatedAt);
      if (sortBy === 'funding') return fundingValue(b.funding.total) - fundingValue(a.funding.total);
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [layerId, searched, sortBy]);

  useEffect(() => {
    setVisible(layerId === 'all' && !query ? PAGE : filtered.length);
  }, [query, layerId, sortBy, filtered.length]);

  useEffect(() => {
    if (selectedId && !filtered.some((c) => c.id === selectedId)) {
      setSelectedId(null);
      setSheet(false);
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

  const openRow = (id: string) => {
    setSelectedId(id);
    setSheet(true);
  };

  return (
    <div className={`${SHELL_WIDTH} grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_340px]`}>
      <aside className="border-b border-border lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="px-4 py-3 lg:hidden">
          <label className="block text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Layer
            <select
              value={layerId}
              onChange={(event) => setLayerId(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-md border border-border bg-background px-3 text-[14px] text-foreground"
            >
              <option value="all">All entries ({counts.all})</option>
              {groupedLayers.map((group) => (
                <optgroup key={group.title} label={group.title}>
                  {group.layers.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {shortLayerName(layer.name)} ({counts[layer.id] ?? 0})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>
        <div className="hidden px-3 pb-6 pt-5 lg:block">
          <p className="px-2 pb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Browse layers
          </p>
          <LayerButton
            active={layerId === 'all'}
            label="All entries"
            count={counts.all}
            onClick={() => setLayerId('all')}
          />
          <div className="mt-3 space-y-4">
            {groupedLayers.map((group) => (
              <div key={group.title}>
                <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {group.title}
                </p>
                {group.layers.map((layer) => (
                  <LayerButton
                    key={layer.id}
                    active={layerId === layer.id}
                    label={shortLayerName(layer.name)}
                    count={counts[layer.id] ?? 0}
                    onClick={() => setLayerId(layer.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {!hideHero && (
          <div className="border-b border-border px-4 py-7 sm:px-6">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-primary">Directory</p>
            <h1 className="mt-2 max-w-xl text-[32px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[36px]">
              Who is building each layer of AI.
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              {companies.length} sourced entries. Filter by layer, search anything, or open a card beside
              the list.
            </p>
          </div>
        )}

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
              className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-16 text-[14px] outline-none focus:ring-2 focus:ring-ring"
            />
            <kbd className="pointer-events-none absolute right-2 hidden rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:block">
              ⌘K
            </kbd>
          </label>
          <label className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Sort
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="h-11 rounded-md border border-border bg-background px-2 text-[14px] text-foreground"
            >
              <option value="name">Name</option>
              <option value="founded">Founded</option>
              <option value="funding">Funding</option>
              <option value="updated">Updated</option>
            </select>
          </label>
          <p className="text-[14px] text-muted-foreground" aria-live="polite">
            {filtered.length} of {searched.length}
            {query.trim() && searched.length !== companies.length ? ` matching “${query.trim()}”` : ''}
          </p>
        </div>

        {compare.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/70 px-4 py-3 text-[14px] sm:px-6">
            <p>{compare.length} selected for compare</p>
            <a href={`/compare/?ids=${compare.join(',')}`} className="min-h-11 font-medium text-primary">
              Open compare →
            </a>
          </div>
        )}

        <ul className="divide-y divide-border">
          {filtered.length === 0 ? (
            <li className="px-6 py-20 text-center">
              <p className="text-[16px] font-medium">No matches in this slice of the stack.</p>
              <p className="mt-1 text-[14px] text-muted-foreground">
                Try another layer, or search a founder or investor.
              </p>
              <button
                type="button"
                className="mt-5 text-[14px] text-primary"
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
                  className={`flex cursor-pointer items-center gap-3 px-4 py-3 sm:px-6 ${
                    selectedId === company.id
                      ? 'bg-primary/[0.07] ring-1 ring-inset ring-primary/20'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => openRow(company.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openRow(company.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-selected={selectedId === company.id}
                >
                  <Logo name={company.name} website={company.website} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/company/${company.id}/`}
                        className="truncate text-[15px] font-medium hover:text-primary"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {company.name}
                      </Link>
                      <label
                        className="flex min-h-11 shrink-0 items-center gap-2 text-[14px] text-muted-foreground"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={compare.includes(company.id)}
                          onChange={() => toggleCompare(company.id)}
                          aria-label={`Compare ${company.name}`}
                        />
                        <span className="hidden sm:inline">Compare</span>
                      </label>
                    </div>
                    <p className="mt-0.5 truncate text-[14px] text-muted-foreground">
                      {entityLabel(company.entityType)} · {company.headquarters}
                      {company.funding.total ? ` · ${company.funding.total}` : ''}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        {visible < filtered.length && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-6">
            <p className="text-[14px] text-muted-foreground">
              Showing {visible} of {filtered.length}
            </p>
            <button
              type="button"
              className="min-h-11 rounded-md border border-border px-3 text-[14px] hover:bg-accent"
              onClick={() => setVisible((count) => count + PAGE)}
            >
              Show {Math.min(PAGE, filtered.length - visible)} more
            </button>
          </div>
        )}
      </div>

      <aside className="hidden border-l border-border lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
        {selected ? (
          <Detail company={selected} layerName={layerName} />
        ) : (
          <p className="px-5 py-16 text-center text-[14px] text-muted-foreground">
            Select a company to inspect it.
          </p>
        )}
      </aside>

      {sheet && selected && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            aria-label="Close detail"
            onClick={() => setSheet(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-2xl bg-background shadow-2xl">
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                className="min-h-11 min-w-11 rounded-md p-2 text-muted-foreground"
                onClick={() => setSheet(false)}
                aria-label="Close detail"
              >
                <IconClose />
              </button>
            </div>
            <Detail
              company={selected}
              layerName={layerName}
              compare={
                <label className="mt-4 flex min-h-11 items-center gap-2 text-[14px] text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={compare.includes(selected.id)}
                    onChange={() => toggleCompare(selected.id)}
                  />
                  Add to compare
                </label>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({
  company,
  layerName,
  compare,
}: {
  company: Company;
  layerName: (id: string) => string;
  compare?: ReactNode;
}) {
  return (
    <article className="px-5 pb-8 pt-2 lg:pt-6">
      <Logo name={company.name} website={company.website} size={40} />
      <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.1em] text-primary">
        {company.layers.map((id) => shortLayerName(layerName(id))).join(' · ')}
      </p>
      <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.03em]">{company.name}</h2>
      <p className="mt-1 text-[14px] text-muted-foreground">
        {company.headquarters} · Founded {company.founded}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{company.description}</p>
      {compare}

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-4 text-[15px]">
        {company.funding.total && (
          <div>
            <dt className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">Funding</dt>
            <dd className="mt-1 font-medium">{company.funding.total}</dd>
          </div>
        )}
        {company.funding.stage && company.funding.stage !== 'Unknown' && (
          <div>
            <dt className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">Stage</dt>
            <dd className="mt-1 font-medium">{company.funding.stage}</dd>
          </div>
        )}
        {company.valuation && (
          <div className="col-span-2">
            <dt className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">Valuation</dt>
            <dd className="mt-1 font-medium">{company.valuation.amount}</dd>
          </div>
        )}
      </dl>

      <section className="mt-4">
        <h3 className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">Founders</h3>
        <p className="mt-1 text-[15px]">{company.founders.join(', ')}</p>
      </section>
      {company.funding.investors.length > 0 && (
        <section className="mt-4">
          <h3 className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">Investors</h3>
          <p className="mt-1 text-[15px]">{company.funding.investors.join(', ')}</p>
        </section>
      )}

      <div className="mt-6 flex flex-col gap-2 text-[15px]">
        <Link href={`/company/${company.id}/`} className="text-primary">
          Open full profile →
        </Link>
        <a
          href={company.website}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary"
        >
          {hostFromUrl(company.website)}
          <IconExternal />
        </a>
      </div>
    </article>
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
      className={`mb-0.5 flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-[13px] leading-snug ${
        active ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-accent'
      }`}
    >
      <span className="min-w-0">{label}</span>
      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{count}</span>
    </button>
  );
}
