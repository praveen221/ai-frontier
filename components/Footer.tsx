import { REPO_URL } from '@/lib/format';
import { SHELL } from '@/lib/stack';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className={`${SHELL} flex flex-col gap-2 py-5 text-[14px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between`}>
        <p>
          <span className="font-medium text-foreground">AI Frontier</span>
          <span className="mx-2">·</span>
          Open-source directory of the AI ecosystem
        </p>
        <div className="flex gap-4">
          <a href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} className="hover:text-foreground">
            Contribute data
          </a>
          <a href={`${REPO_URL}/blob/main/LICENSE`} className="hover:text-foreground">
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}
