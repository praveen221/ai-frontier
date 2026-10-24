import { z } from 'zod';

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const EntityTypeSchema = z.enum([
  'company',
  'research',
  'institution',
  'investor',
]);

export const TaxonomySubdomainSchema = z.string().min(1);

export const TaxonomyLayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().positive(),
  subdomains: z.array(TaxonomySubdomainSchema).min(1),
});

export const TaxonomySchema = z.object({
  layers: z.array(TaxonomyLayerSchema).min(1),
});

const SourcedAmount = {
  source: z.string().url(),
  date: z.string().regex(DATE_RE, 'Use YYYY-MM-DD'),
};

export const FundingSchema = z
  .object({
    total: z.string().nullable(),
    stage: z.string(),
    investors: z.array(z.string()),
    source: z.string().url().optional(),
    date: z.string().regex(DATE_RE).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.total && (!value.source || !value.date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Funding totals must include a source URL and as-of date',
        path: ['source'],
      });
    }
  });

export const ValuationSchema = z.object({
  amount: z.string().min(1),
  notes: z.string().optional(),
  ...SourcedAmount,
});

export const RevenueSchema = z.object({
  amount: z.string().min(1),
  period: z.string().min(1),
  notes: z.string().optional(),
  ...SourcedAmount,
});

export const IdentitySourceSchema = z.object({
  source: z.string().url(),
  date: z.string().regex(DATE_RE, 'Use YYYY-MM-DD'),
  fields: z.array(z.enum(['founders', 'founded', 'headquarters'])).min(1),
});

export const CompanySchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Use kebab-case ids'),
  name: z.string().min(1),
  fullName: z.string().optional(),
  description: z.string().min(10),
  layers: z.array(z.string()).min(1),
  subdomains: z.array(z.string()).min(1),
  founded: z.number().int().min(1900).max(new Date().getFullYear()),
  founders: z.array(z.string()).min(1),
  headquarters: z.string().min(1),
  website: z.string().url(),
  entityType: EntityTypeSchema,
  addedAt: z.string().regex(DATE_RE),
  updatedAt: z.string().regex(DATE_RE),
  identitySource: IdentitySourceSchema.optional(),
  funding: FundingSchema,
  valuation: ValuationSchema.optional(),
  revenue: RevenueSchema.optional(),
  tags: z.array(z.string()).min(1),
});

export const CompaniesSchema = z.object({
  companies: z.array(CompanySchema).min(1),
});

export type EntityType = z.infer<typeof EntityTypeSchema>;
export type Taxonomy = z.infer<typeof TaxonomySchema>;
export type TaxonomyLayer = z.infer<typeof TaxonomyLayerSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Companies = z.infer<typeof CompaniesSchema>;
export type Funding = z.infer<typeof FundingSchema>;
export type Valuation = z.infer<typeof ValuationSchema>;
export type Revenue = z.infer<typeof RevenueSchema>;
