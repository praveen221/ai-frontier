import { REPO_URL } from '@/lib/format';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-4 py-5 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
