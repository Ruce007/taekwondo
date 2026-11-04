// Lineage: who taught whom, which kwan an annex grew from, and which schools descend from whom.
// The relationships are declared once in each page's front matter and every list and chart below is
// derived from them:
//   people:  teachers: [Name, ...]   kwan: Kwan Title
//   kwans:   annexOf: Kwan Title     founders: Name, Name
//   schools: kwan: Kwan Title        founders: [Name, ...]
// Values are page titles (or aliases). An unknown title stops the build.

import { esc, asArray } from './util.mjs';

const names = (v) => (typeof v === 'string' && v.includes(',') ? v.split(',').map((s) => s.trim()) : asArray(v)).filter(Boolean);

export function buildLineage(pages, resolve, errors) {
  const L = { teachers: new Map(), kwanOf: new Map(), annexOf: new Map(), founders: new Map(), pages };
  const link = (page, field, v, key) => {
    const hit = resolve(v);
    if (!hit) {
      errors.push(`${page.file}: ${field} "${v}" is not the title of any page`);
      return null;
    }
    if (key && hit.key !== key) {
      errors.push(`${page.file}: ${field} "${v}" must be a page in ${key}`);
      return null;
    }
    return hit;
  };
  for (const p of pages) {
    const fm = p.fm || {};
    if (p.key === 'people') {
      if (fm.teachers) L.teachers.set(p, names(fm.teachers).map((n) => link(p, 'teachers', n, 'people')).filter(Boolean));
      if (fm.kwan) L.kwanOf.set(p, link(p, 'kwan', fm.kwan, 'kwans'));
    } else if (p.key === 'kwans') {
      if (fm.annexOf) L.annexOf.set(p, link(p, 'annexOf', fm.annexOf, 'kwans'));
      if (fm.founders) L.founders.set(p, names(fm.founders).map((n) => link(p, 'founders', n, 'people')).filter(Boolean));
    } else if (p.key === 'schools') {
      if (fm.kwan) L.kwanOf.set(p, link(p, 'kwan', fm.kwan, 'kwans'));
      if (fm.founders) L.founders.set(p, names(fm.founders).map((n) => link(p, 'founders', n, 'people')).filter(Boolean));
    }
  }
  const by = (a, b) => a.title.localeCompare(b.title);
  const pagesWhere = (fn) => pages.filter(fn).sort(by);
  L.studentsOf = (person) => pagesWhere((p) => (L.teachers.get(p) || []).includes(person));
  L.kwansFounded = (person) => pagesWhere((p) => p.key === 'kwans' && (L.founders.get(p) || []).includes(person));
  L.schoolsFounded = (person) => pagesWhere((p) => p.key === 'schools' && (L.founders.get(p) || []).includes(person));
  L.annexesOf = (kwan) => pagesWhere((p) => L.annexOf.get(p) === kwan);
  L.peopleOf = (kwan) => pagesWhere((p) => p.key === 'people' && L.kwanOf.get(p) === kwan);
  L.schoolsOf = (kwan) => pagesWhere((p) => p.key === 'schools' && L.kwanOf.get(p) === kwan);
  L.isKwanFounder = (person) => L.kwansFounded(person).length > 0;
  return L;
}

const a = (p) => `<a href="${p.path}">${esc(p.title)}</a>`;
const list = (ps) => ps.map(a).join(', ');

// "Lineage links" section for one page. Returns '' when the page has no lineage data.
export function lineageBlock(page, L) {
  const rows = [];
  const add = (label, ps) => ps && ps.length && rows.push([label, list(ps)]);
  if (page.key === 'people') {
    add(L.teachers.get(page) && L.teachers.get(page).length === 1 ? 'Teacher' : 'Teachers', L.teachers.get(page));
    add('Kwan', L.kwanOf.get(page) && [L.kwanOf.get(page)]);
    add('Founded', L.kwansFounded(page));
    add('Students', L.studentsOf(page));
    add('Schools', L.schoolsFounded(page));
  } else if (page.key === 'kwans') {
    add('Annex of', L.annexOf.get(page) && [L.annexOf.get(page)]);
    add('Founders', L.founders.get(page));
    add('Annexes', L.annexesOf(page));
    add('Members and students', L.peopleOf(page).filter((p) => !L.isKwanFounder(p)));
    add('Schools', L.schoolsOf(page));
  } else if (page.key === 'schools') {
    add('Kwan', L.kwanOf.get(page) && [L.kwanOf.get(page)]);
    add('Founder', L.founders.get(page));
  }
  if (!rows.length) return '';
  return `<section class="lineage" aria-labelledby="lineage-title"><h2 id="lineage-title">Lineage links</h2><dl>${rows
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
    .join('')}</dl><p class="muted"><a href="/lineage/">See the full lineage chart</a></p></section>`;
}

// The chart: one tree per kwan, with annexes, students and schools beneath it.
export function lineageTree(L) {
  const seen = new Set();
  const person = (p, note) => {
    if (seen.has(p)) return '';
    seen.add(p);
    const schools = L.schoolsFounded(p).filter((s) => !seen.has(s));
    schools.forEach((s) => seen.add(s));
    const kids = schools.map((s) => `<li class="tree-school">${a(s)}</li>`).join('');
    return `<li class="tree-person">${a(p)}${note ? ` <span class="meta">${note}</span>` : ''}${kids ? `<ul>${kids}</ul>` : ''}</li>`;
  };
  const kwan = (k) => {
    if (seen.has(k)) return '';
    seen.add(k);
    const founders = L.founders.get(k) || [];
    const kids = [];
    L.annexesOf(k).forEach((x) => kids.push(kwan(x)));
    const studentsOfFounders = founders.flatMap((f) => L.studentsOf(f).map((s) => [s, f]));
    for (const [s, f] of studentsOfFounders) if (!L.isKwanFounder(s)) kids.push(person(s, `student of ${esc(f.title)}`));
    L.peopleOf(k).filter((p) => !L.isKwanFounder(p)).forEach((p) => kids.push(person(p, '')));
    L.schoolsOf(k).filter((s) => !seen.has(s)).forEach((s) => {
      seen.add(s);
      kids.push(`<li class="tree-school">${a(s)}</li>`);
    });
    const inner = kids.filter(Boolean).join('');
    return `<li class="tree-kwan"><a href="${k.path}">${esc(k.title)}</a>${founders.length ? ` <span class="meta">founded by ${list(founders)}</span>` : ''}${inner ? `<ul>${inner}</ul>` : ''}</li>`;
  };
  const kwans = L.pages.filter((p) => p.key === 'kwans');
  const roots = (gen) => kwans.filter((k) => k.fm.generation === gen && !L.annexOf.get(k)).sort((x, y) => x.title.localeCompare(y.title));
  const group = (title, ks) => (ks.length ? `<h2 class="index-group">${esc(title)}</h2><ul class="tree">${ks.map(kwan).join('')}</ul>` : '');
  return group('The original five kwans', roots('original')) + group('Later kwans without a parent kwan', roots('later'));
}
