import fs from 'fs';
import path from 'path';
import type { Company, Taxonomy, TaxonomyLayer } from './schema';

const DATA_DIR = path.join(process.cwd(), 'data');
const COMPANIES_DIR = path.join(DATA_DIR, 'companies');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');

export function getTaxonomy(): Taxonomy {
  const filePath = path.join(DATA_DIR, 'taxonomy.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Taxonomy;
}

export function getLayers(): TaxonomyLayer[] {
  return getTaxonomy().layers.slice().sort((a, b) => a.order - b.order);
}

export function getLayerById(id: string): TaxonomyLayer | undefined {
  return getLayers().find((layer) => layer.id === id);
}

function readCompanyFile(filePath: string): Company[] {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (Array.isArray(parsed)) return parsed as Company[];
  if (parsed && Array.isArray(parsed.companies)) return parsed.companies as Company[];
  throw new Error(`Expected a company array in ${filePath}`);
}

export function getCompanies(): Company[] {
  const byId = new Map<string, Company>();

  if (fs.existsSync(COMPANIES_DIR)) {
    const files = fs
      .readdirSync(COMPANIES_DIR)
      .filter((name) => name.endsWith('.json'))
      .sort();
    for (const file of files) {
      for (const company of readCompanyFile(path.join(COMPANIES_DIR, file))) {
        byId.set(company.id, company);
      }
    }
  }

  if (byId.size === 0 && fs.existsSync(COMPANIES_FILE)) {
    for (const company of readCompanyFile(COMPANIES_FILE)) {
      byId.set(company.id, company);
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getCompanyById(id: string): Company | undefined {
  return getCompanies().find((company) => company.id === id);
}

export function getCompaniesByLayer(layerId: string): Company[] {
  return getCompanies().filter((company) => company.layers.includes(layerId));
}
