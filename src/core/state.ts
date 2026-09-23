export type ChapterId =
  | 'overview' | 'stackup' | 'load' | 'axial' | 'offset' | 'wave' | 'viv' | 'combined' | 'cement' | 'heading' | 'summary';
export type Mode = 'story' | 'explore';
export type CurrentCase = 'noCurrent' | 'current1yr';
export type HsCase = '1yr' | '100yr';
export type FatigueMode = 'viv' | 'wave' | 'combined';

export interface AppState {
  mode: Mode;
  chapter: ChapterId;
  offset: number;
  current: CurrentCase;
  hs: HsCase;
  cementCase: number;
  heading: number;
  loadStep: number;         // 1..5
  fatigueMode: FatigueMode;
  vivMode: number;          // 1..3
  selected: string | null;  // component id
  playing: boolean;
}

type Listener = (s: AppState, changed: (keyof AppState)[]) => void;

class Store {
  s: AppState = {
    mode: 'story', chapter: 'overview', offset: 0, current: 'noCurrent', hs: '1yr', cementCase: 0, heading: 0,
    loadStep: 5, fatigueMode: 'combined', vivMode: 1, selected: null, playing: false,
  };
  private ls: Listener[] = [];
  on(l: Listener) { this.ls.push(l); }
  set(patch: Partial<AppState>) {
    const changed = (Object.keys(patch) as (keyof AppState)[]).filter(k => this.s[k] !== patch[k]);
    if (!changed.length) return;
    this.s = { ...this.s, ...patch };
    this.ls.forEach(l => l(this.s, changed));
  }
}
export const store = new Store();
