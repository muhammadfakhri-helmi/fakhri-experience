import { AXIAL } from './axial';
import { conflictByKey, CONFLICTS } from './conflicts';
import { ENVIRONMENT } from './environment';
import { FATIGUE } from './fatigue';
import { GEOMETRY } from './geometry';
import { OFFSET } from './offset';
import { SENSITIVITIES } from './sensitivities';
import { Candidate, Resolved, Status, Value } from './types';
import { VISUAL } from './visual';

const ALL_CANDIDATES: Candidate[] = [
  ...GEOMETRY, ...ENVIRONMENT, ...FATIGUE, ...OFFSET, ...AXIAL, ...SENSITIVITIES, ...VISUAL,
];

const same = (a: Candidate, b: Candidate) =>
  JSON.stringify(a.value) === JSON.stringify(b.value) && (a.qualifier ?? '') === (b.qualifier ?? '') && a.unit === b.unit;

export interface ResolverOutput {
  approved: Map<string, Resolved>;
  proposals: Resolved[];
  unusedConflicts: string[];
}

/**
 * ENGINEERING DATA RESOLVER
 * 1. Groups candidates by key.
 * 2. Separates early proposals (SUPERSEDED_PROPOSAL, audit only).
 * 3. Selects the highest-priority candidate (lowest Tier).
 * 4. Any disagreeing candidate must be covered by the conflict registry, otherwise resolution fails.
 */
export function resolve(candidates: Candidate[] = ALL_CANDIDATES): ResolverOutput {
  const byKey = new Map<string, Candidate[]>();
  for (const c of candidates) byKey.set(c.key, [...(byKey.get(c.key) ?? []), c]);

  const approved = new Map<string, Resolved>();
  const proposals: Resolved[] = [];
  const errors: string[] = [];
  const usedConflicts = new Set<string>();

  for (const [key, list] of byKey) {
    const final = list.filter(c => !c.proposal).sort((a, b) => a.tier - b.tier);
    const early = list.filter(c => c.proposal);
    if (!final.length) { errors.push(`${key}: only proposal candidates exist`); continue; }

    const selected = final[0];
    const sameTierDisagree = final.filter(c => c.tier === selected.tier && c.source === selected.source && !same(c, selected));
    if (sameTierDisagree.length) errors.push(`${key}: two candidates in the same source and tier disagree`);

    const others = final.slice(1).map(candidate => ({
      candidate, relation: (same(candidate, selected) ? 'CORROBORATES' : 'SUPERSEDED') as 'CORROBORATES' | 'SUPERSEDED',
    }));
    const disagreement = others.some(o => o.relation === 'SUPERSEDED') || early.some(p => !same(p, selected));
    const conflict = conflictByKey(key);
    if (disagreement && !conflict) errors.push(`${key}: sources disagree but no conflict is registered`);
    if (conflict) usedConflicts.add(conflict.id);

    let status: Status = 'REPORTED';
    if (selected.basis === 'illustrative') status = 'ILLUSTRATIVE';
    else if (selected.basis === 'derived') status = 'DERIVED';
    else if (conflict && disagreement) status = conflict.status;

    approved.set(key, {
      key, value: selected.value, unit: selected.unit, qualifier: selected.qualifier, status, selected, others,
      conflictId: conflict?.id,
      conflictNote: conflict ? `${conflict.title}. ${conflict.rationale} Policy: ${conflict.visualizationPolicy}` : undefined,
    });
    for (const p of early) {
      proposals.push({ key, value: p.value, unit: p.unit, status: 'SUPERSEDED_PROPOSAL', selected: p, others: [], conflictId: conflict?.id });
    }
  }

  if (errors.length) throw new Error('Engineering Data Resolver failed:\n' + errors.join('\n'));
  const unusedConflicts = CONFLICTS.filter(c => !usedConflicts.has(c.id)).map(c => c.id);
  return { approved, proposals, unusedConflicts };
}

const OUT = resolve();

/**
 * approvedEngineeringData — the ONLY object the Three.js scene and UI may read engineering values from.
 */
export const approvedEngineeringData = {
  get(key: string): Resolved {
    const r = OUT.approved.get(key);
    if (!r) throw new Error(`approvedEngineeringData: unknown key "${key}"`);
    return r;
  },
  has: (key: string) => OUT.approved.has(key),
  num(key: string): number {
    const v = this.get(key).value;
    if (typeof v !== 'number') throw new Error(`${key} is not numeric`);
    return v;
  },
  arr<T = number>(key: string): T[] { return this.get(key).value as unknown as T[]; },
  str(key: string): string { return String(this.get(key).value); },
  /** Fatigue life helper: returns {years, gt} where gt=true means ">years". */
  life(key: string): { years: number; gt: boolean; res: Resolved } {
    const r = this.get(key);
    return { years: r.value as number, gt: r.qualifier === '>', res: r };
  },
  all: () => [...OUT.approved.values()],
  proposals: () => OUT.proposals,
  conflicts: () => CONFLICTS,
  unusedConflicts: () => OUT.unusedConflicts,
};

export type Approved = typeof approvedEngineeringData;
export const fmtValue = (r: Resolved): string => {
  const v: Value = r.value;
  const q = r.qualifier ?? '';
  if (Array.isArray(v)) return v.length > 6 ? `${v.length} values` : v.map(x => (typeof x === 'object' ? '·' : String(x))).join(' / ');
  if (typeof v === 'number') return `${q}${v.toLocaleString('en-US')}${r.unit ? ' ' + r.unit : ''}`;
  return `${q}${String(v)}${r.unit && typeof v !== 'string' ? ' ' + r.unit : ''}`;
};
