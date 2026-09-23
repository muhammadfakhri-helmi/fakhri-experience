import { approvedEngineeringData as A, fmtValue } from '../data/resolver';
import { SOURCES, STATUS_LABEL } from '../data/sources';
import { Resolved } from '../data/types';

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const statusClass = (s: string) => s.toLowerCase().replace(/_/g, '-');

/** A clickable engineering value. Every displayed value goes through here so it is auditable. */
export function v(key: string, override?: string): string {
  const r = A.get(key);
  const text = override ?? fmtValue(r);
  const warn = r.status === 'REPORTED_WITH_SOURCE_CONFLICT' ? '<i class="cf" title="Source conflict">!</i>' : '';
  return `<button class="v ${statusClass(r.status)}" data-key="${esc(key)}">${esc(text)}${warn}</button>`;
}
/** Lifetime in years with qualifier, clickable. */
export function lifeV(key: string): string {
  const r = A.get(key);
  return v(key, `${r.qualifier ?? ''}${r.value} y`);
}
/** Template: "{{key}}" or "{{key|override text}}" become clickable values. */
export function tpl(s: string): string {
  return s.replace(/\{\{([^}|]+)(?:\|([^}]+))?\}\}/g, (_, k: string, o?: string) => v(k.trim(), o));
}
export const chip = (status: string) => `<span class="chip ${statusClass(status)}">${STATUS_LABEL[status] ?? status}</span>`;

// ---------------- Provenance popover ----------------
const pop = document.getElementById('prov') as HTMLElement;
function candRow(c: Resolved['selected'], rel?: string) {
  const src = SOURCES[c.source];
  return `<tr><td>${esc(src.id)}</td><td>${esc(src.title)}<small>${esc(src.issue)} · ${esc(src.date)}</small></td>
    <td>${c.page ?? '—'}</td><td>${esc(c.ref)}</td><td>${esc(Array.isArray(c.value) ? `${c.value.length} values` : `${c.qualifier ?? ''}${String(c.value)}`)} ${esc(c.unit)}</td>
    <td>${rel ? `<span class="rel ${rel.toLowerCase()}">${rel}</span>` : ''}</td></tr>`;
}
export function showProvenance(key: string, anchor?: HTMLElement) {
  const r = A.get(key); const s = r.selected; const src = SOURCES[s.source];
  const props = A.proposals().filter(p => p.key === key);
  pop.innerHTML = `
    <header><div><small>Provenance</small><h3>${esc(key)}</h3></div><button class="x" aria-label="Close">×</button></header>
    <div class="pv-main"><b>${esc(fmtValue(r))}</b>${chip(r.status)}</div>
    <dl>
      <dt>Source document</dt><dd>${esc(src.id)} — ${esc(src.title)} (${esc(src.issue)}, ${esc(src.date)})</dd>
      <dt>Page</dt><dd>${s.page ?? '—'}</dd>
      <dt>Table / figure</dt><dd>${esc(s.ref)}</dd>
      <dt>Analysis case</dt><dd>${esc(s.case)}</dd>
      <dt>Source role</dt><dd>${esc(src.role)}</dd>
      ${s.note ? `<dt>Note</dt><dd>${esc(s.note)}</dd>` : ''}
    </dl>
    ${r.conflictNote ? `<div class="conflict"><b>${esc(r.conflictId!)} — source conflict</b><p>${esc(r.conflictNote)}</p></div>` : ''}
    ${r.others.length || props.length ? `<h4>All candidates for this value</h4><table class="cands"><tr><th>ID</th><th>Document</th><th>Pg</th><th>Ref</th><th>Value</th><th></th></tr>
      ${candRow(s, 'SELECTED')}${r.others.map(o => candRow(o.candidate, o.relation)).join('')}${props.map(p => candRow(p.selected, 'SUPERSEDED_PROPOSAL')).join('')}</table>` : ''}`;
  pop.hidden = false;
  const rect = anchor?.getBoundingClientRect();
  const w = Math.min(520, innerWidth - 24);
  pop.style.width = w + 'px';
  pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, (rect?.left ?? innerWidth / 2) - w / 2)) + 'px';
  pop.style.top = Math.min(innerHeight - 40, (rect?.bottom ?? 120) + 8) + 'px';
  requestAnimationFrame(() => { const h = pop.offsetHeight; if ((rect?.bottom ?? 0) + h + 20 > innerHeight) pop.style.top = Math.max(12, (rect?.top ?? 0) - h - 8) + 'px'; });
  (pop.querySelector('.x') as HTMLElement).onclick = () => { pop.hidden = true; };
}
document.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest('.v') as HTMLElement | null;
  if (b) { e.stopPropagation(); showProvenance(b.dataset.key!, b); return; }
  if (!pop.hidden && !(e.target as HTMLElement).closest('#prov')) pop.hidden = true;
});
addEventListener('keydown', e => { if (e.key === 'Escape') pop.hidden = true; });
