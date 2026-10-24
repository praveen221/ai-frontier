'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconMenu, IconMoon, IconSun, IconClose } from './Icons';
import { REPO_URL } from '@/lib/format';
import { SHELL_WIDTH } from '@/lib/stack';

const NAV = [
  { href: '/', label: 'Directory' },
  { href: '/taxonomy/', label: 'Taxonomy' },
  { href: '/compare/', label: 'Compare' },
  { href: '/recent/', label: 'Recent' },
];

export function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className={`${SHELL_WIDTH} flex h-14 items-center gap-5 px-4 sm:px-6`}>
        <Link href="/" className="shrink-0 text-[15px] font-semibold tracking-[-0.02em]">
          AI Frontier
        </Link>
        <p className="hidden border-l border-border pl-5 text-[12px] text-muted-foreground xl:block">
          The AI stack, end to end
        </p>
        <nav className="ml-auto hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? 'page' : undefined}
              className={`rounded-md px-2.5 py-1.5 text-[13px] ${
                active(item.href)
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={toggle}
            className="ml-1 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
        </nav>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={toggle}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(item.href) ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-[14px] ${
                  active(item.href) ? 'bg-secondary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="px-3 py-2 text-[14px] text-muted-foreground">
              GitHub
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
