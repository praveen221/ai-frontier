/**
 * Merge partial sourced-field patches onto existing company records
 * in the JSON file that already owns each id.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Company } from '../lib/schema';

const PATCH_PATH = path.join(process.cwd(), 'data/sourcing-patches.json');
const ROOT = path.join(process.cwd(), 'data');

type Patch = Partial<Omit<Company, 'valuation' | 'revenue'>> & {
  id: string;
  valuation?: Company['valuation'] | null;
  revenue?: Company['revenue'] | null;
};

type CompanyFile = Company[] | { companies: Company[] };

function readCompanies(filePath: string): { raw: CompanyFile; list: Company[] } {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as CompanyFile;
  if (Array.isArray(raw)) return { raw, list: raw };
  if (raw && Array.isArray(raw.companies)) return { raw, list: raw.companies };
  throw new Error(`No companies array in ${filePath}`);
}

function companyFiles(): string[] {
  const files = [path.join(ROOT, 'companies.json')];
  const dir = path.join(ROOT, 'companies');
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
    files.push(path.join(dir, name));
  }
  return files;
}

const patches = JSON.parse(fs.readFileSync(PATCH_PATH, 'utf8')) as { companies: Patch[] };
const files = companyFiles();
const owners = new Map<string, { file: string; index: number }>();

for (const file of files) {
  const { list } = readCompanies(file);
  list.forEach((company, index) => {
    if (!owners.has(company.id)) owners.set(company.id, { file, index });
  });
}

const dirty = new Map<string, ReturnType<typeof readCompanies>>();
let applied = 0;

for (const patch of patches.companies) {
  const owner = owners.get(patch.id);
  if (!owner) throw new Error(`Unknown company id: ${patch.id}`);
  const loaded = dirty.get(owner.file) ?? readCompanies(owner.file);
  dirty.set(owner.file, loaded);
  const current = loaded.list[owner.index];
  loaded.list[owner.index] = {
    ...current,
    ...patch,
    funding: { ...current.funding, ...(patch.funding ?? {}) },
    valuation: patch.valuation === null ? undefined : (patch.valuation ?? current.valuation),
    revenue: patch.revenue === null ? undefined : (patch.revenue ?? current.revenue),
    identitySource: patch.identitySource ?? current.identitySource,
    tags: patch.tags ?? current.tags,
    subdomains: [...new Set(patch.subdomains ?? current.subdomains)],
    updatedAt: patch.updatedAt ?? current.updatedAt,
  };
  applied += 1;
}

for (const [file, loaded] of dirty) {
  const payload: CompanyFile = Array.isArray(loaded.raw)
    ? loaded.list
    : { ...loaded.raw, companies: loaded.list };
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Updated ${file}`);
}

console.log(`Applied ${applied} patches.`);
