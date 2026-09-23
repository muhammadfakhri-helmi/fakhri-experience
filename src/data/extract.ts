import { Basis, Candidate, SourceId, Tier, Value } from './types';

/** Terse candidate constructor used by the extracted-data modules. */
export function cand(
  key: string, value: Value, unit: string,
  source: SourceId, page: number | null, ref: string, kase: string,
  tier: Tier, basis: Basis = 'reported',
  extra: Partial<Candidate> = {},
): Candidate {
  return { key, value, unit, source, page, ref, case: kase, tier, basis, ...extra };
}

/** Fatigue lifetime helper: `null` means the report states ">10 years". */
export function life(
  key: string, years: number | null, source: SourceId, page: number, ref: string, kase: string, tier: Tier,
  extra: Partial<Candidate> = {},
): Candidate {
  return years === null
    ? cand(key, 10, 'years', source, page, ref, kase, tier, 'reported', { qualifier: '>', ...extra })
    : cand(key, years, 'years', source, page, ref, kase, tier, 'reported', extra);
}
