'use client';

import { useState } from 'react';
import { initials, logoUrl } from '@/lib/format';

export function Logo({
  name,
  website,
  size = 28,
}: {
  name: string;
  website: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl(website);

  if (failed || !src) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-secondary text-[10px] font-semibold text-muted-foreground"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-md bg-white"
      onError={() => setFailed(true)}
    />
  );
}
