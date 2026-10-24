import { formatDate } from '@/lib/format';
import { IconExternal } from './Icons';

export function SourceLink({
  href,
  date,
  showDate = true,
}: {
  href: string;
  date: string;
  showDate?: boolean;
}) {
  const label = `Source, ${formatDate(date)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
    >
      <IconExternal />
      {showDate && <span className="text-[12px]">{formatDate(date)}</span>}
    </a>
  );
}
