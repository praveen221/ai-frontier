'use client';

import { useState } from 'react';
import { initials, logoUrl } from '@/lib/format';

function tone(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hues = [217, 198, 162, 28, 340, 152];
  return `hsl(${hues[hash % hues.length]} 38% 40%)`;
}

export function Logo({
  name,
  website,
  size = 32,
}: {
  name: string;
  website: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl(website);
  const pad = Math.max(5, Math.round(size * 0.2));

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#d5d9e2] ring-1 ring-inset ring-black/10 dark:bg-secondary dark:ring-white/10"
      style={{ width: size, height: size, padding: failed || !src ? 0 : pad }}
      aria-hidden="true"
    >
      {failed || !src ? (
        <span
          className="flex h-full w-full items-center justify-center font-semibold text-white"
          style={{ background: tone(name), fontSize: Math.max(11, size * 0.36) }}
        >
          {initials(name)}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
