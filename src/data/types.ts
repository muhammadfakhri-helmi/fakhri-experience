/**
 * Engineering data governance types.
 *
 * Pipeline:  PDF sources → Extracted candidates → Conflict registry
 *            → Engineering Data Resolver → approvedEngineeringData → Three.js scene
 *
 * Scene / UI code may only read `approvedEngineeringData` (see approved.ts).
 */

export type SourceId =
  | 'SRC-00' | 'SRC-01' | 'SRC-02' | 'SRC-02R'
  | 'SRC-03' | 'SRC-04' | 'SRC-05' | 'SRC-06' | 'SRC-07' | 'SRC-08'
  | 'VIZ';

/** Source resolution priority for calculated results (1 = highest). Visualization governance rule only. */
export enum Tier {
  FINAL_TABLE = 1,
  FINAL_FIGURE = 2,
  FINAL_NARRATIVE = 3,
  FINAL_SENSITIVITY_SUMMARY = 4,
  DESIGN_BASIS = 5,
  INTERIM_SUMMARY = 6,
}

/** How the candidate value was obtained from its source. */
export type Basis = 'reported' | 'derived' | 'illustrative';

export type Status =
  | 'REPORTED'
  | 'DERIVED'
  | 'ILLUSTRATIVE'
  | 'REPORTED_WITH_SOURCE_CONFLICT'
  | 'SUPERSEDED'
  | 'SUPERSEDED_PROPOSAL';

export type Value = number | string | boolean | number[] | string[] | Point[];
export interface Point { x: number; y: number }

export interface Candidate {
  key: string;
  value: Value;
  unit: string;
  /** '>' when the report gives a lower bound only (e.g. ">10 years"). */
  qualifier?: '>' | '<';
  source: SourceId;
  page: number | null;
  ref: string;            // table / figure / section
  case: string;           // analysis case
  tier: Tier;
  basis: Basis;
  /** Early proposal that was not part of the final analysis. */
  proposal?: boolean;
  note?: string;
}

export interface Resolved {
  key: string;
  value: Value;
  unit: string;
  qualifier?: '>' | '<';
  status: Status;
  selected: Candidate;
  /** Other candidates for the same key (agreeing or superseded). */
  others: { candidate: Candidate; relation: 'CORROBORATES' | 'SUPERSEDED' }[];
  conflictId?: string;
  conflictNote?: string;
  meaning?: string;
}

export interface Conflict {
  id: string;
  key: string;
  title: string;
  conflictingValues: { source: SourceId; ref: string; value: string }[];
  selectedValue: string;
  selectedSource: SourceId;
  supersededSources: SourceId[];
  rationale: string;
  visualizationPolicy: string;
  /** Status to apply to the selected value. */
  status: 'REPORTED_WITH_SOURCE_CONFLICT' | 'REPORTED';
}

export interface SourceDoc {
  id: SourceId;
  title: string;
  role: string;
  issue: string;
  date: string;
  defaultTier: Tier;
}
