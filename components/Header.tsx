'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconMoon, IconSun } from './Icons';
import { REPO_URL } from '@/lib/format';

const NAV = [
  { href: '/', label: 'Directory' },
  { href: '/taxonomy/', label: 'Taxonomy' },
  { href: '/compare/', label: 'Compare' },
  { href: '/recent/', label: 'Recent' },
];

export function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDark(next);
  };

  const active = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.replace(/\/$/, ''));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-[17px] font-semibold tracking-tight">
          AI <span className="font-normal text-muted-foreground">Frontier</span>
        </Link>
        <p className="hidden border-l border-border pl-4 text-[11px] text-muted-foreground lg:block">
          The AI stack, end to end
        </p>
        <nav className="ml-auto flex items-center gap-1 sm:gap-3" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2 py-1 text-[13px] ${
                active(item.href)
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden px-2 py-1 text-[13px] text-muted-foreground hover:text-foreground sm:inline"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={toggle}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
        </nav>
      </div>
    </header>
  );
}
