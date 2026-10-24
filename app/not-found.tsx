import Link from 'next/link';
import { SHELL } from '@/lib/stack';

export default function NotFound() {
  return (
    <main className={`${SHELL} py-24 text-center`}>
      <p className="text-[12px] uppercase tracking-[0.12em] text-primary">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page is not in the stack.</h1>
      <Link href="/" className="mt-6 inline-block text-primary">
        Back to the directory →
      </Link>
    </main>
  );
}
