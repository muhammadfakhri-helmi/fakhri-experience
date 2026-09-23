/* Data governance audit: `npm run audit:data`. Fails (throws) if any unregistered source conflict exists. */
import { approvedEngineeringData as A } from './resolver';
const all = A.all();
const by: Record<string, number> = {};
all.forEach(r => { by[r.status] = (by[r.status] || 0) + 1; });
console.log('Resolved keys:', all.length, by);
console.log('Registered conflicts:', A.conflicts().map(c => c.id).join(', '));
console.log('Unused conflict entries:', A.unusedConflicts());
console.log('Superseded proposals:', A.proposals().map(p => `${p.key}=${JSON.stringify(p.value)}`));
