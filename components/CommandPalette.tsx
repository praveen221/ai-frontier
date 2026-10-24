'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Item = { id: string; name: string; href: string; group: string };

export function CommandPalette({
  companies,
  layers,
}: {
  companies: { id: string; name: string }[];
  layers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const rows: Item[] = [
      { id: 'dir', name: 'Directory', href: '/', group: 'Pages' },
      { id: 'tax', name: 'Taxonomy', href: '/taxonomy/', group: 'Pages' },
      { id: 'cmp', name: 'Compare', href: '/compare/', group: 'Pages' },
      { id: 'rec', name: 'Recent', href: '/recent/', group: 'Pages' },
      ...layers.map((layer) => ({
        id: `layer-${layer.id}`,
        name: layer.name,
        href: `/layer/${layer.id}/`,
        group: 'Layers',
      })),
      ...companies.map((company) => ({
        id: `co-${company.id}`,
        name: company.name,
        href: `/company/${company.id}/`,
        group: 'Companies',
      })),
    ];
    if (!q) return rows.slice(0, 12);
    return rows.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 20);
  }, [companies, layers, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
        setQuery('');
        setActive(0);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" className="absolute inset-0 bg-foreground/40" aria-label="Close command palette" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-label="Command palette"
        className="absolute left-1/2 top-[12vh] w-[min(560px,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActive((value) => Math.min(items.length - 1, value + 1));
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActive((value) => Math.max(0, value - 1));
            }
            if (event.key === 'Enter' && items[active]) go(items[active].href);
          }}
          placeholder="Go to a company, layer, or page…"
          className="h-12 w-full border-b border-border bg-transparent px-4 text-[15px] outline-none"
        />
        <ul className="max-h-[50vh] overflow-y-auto p-1">
          {items.length === 0 ? (
            <li className="px-3 py-4 text-[14px] text-muted-foreground">No matches</li>
          ) : (
            items.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(item.href)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[14px] ${
                    index === active ? 'bg-accent' : ''
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-[12px] text-muted-foreground">{item.group}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
