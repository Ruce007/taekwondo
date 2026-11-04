// Turns the school pages into a country > region > city tree, with a URL for each node.
// Place pages are generated from the schools' own fields (country, region, city), so adding a
// school in a new city creates that city's page, and its region's and country's, automatically.

import { countryNames, regionNames } from '../site.config.mjs';
import { slugify } from './util.mjs';

export const countryLabel = (cc) => countryNames[cc] || cc || 'Other';
export const regionLabel = (cc, rc) => (regionNames[cc] && regionNames[cc][rc]) || rc || 'Other';

export function buildPlaces(schools, base = '/schools') {
  const countries = new Map();
  for (const s of schools) {
    const fm = s.fm || {};
    const cc = fm.country || 'XX';
    const rc = fm.region || 'xx';
    const city = fm.city || 'Other';
    if (!countries.has(cc)) {
      countries.set(cc, { kind: 'country', code: cc, name: countryLabel(cc), path: `${base}/${cc.toLowerCase()}/`, regions: new Map(), schools: [] });
    }
    const country = countries.get(cc);
    if (!country.regions.has(rc)) {
      country.regions.set(rc, { kind: 'region', code: rc, name: regionLabel(cc, rc), country, path: `${country.path}${rc.toLowerCase()}/`, cities: new Map(), schools: [] });
    }
    const region = country.regions.get(rc);
    const cslug = slugify(city);
    if (!region.cities.has(cslug)) {
      region.cities.set(cslug, { kind: 'city', name: city, region, country, path: `${region.path}${cslug}/`, schools: [] });
    }
    const c = region.cities.get(cslug);
    c.schools.push(s);
    region.schools.push(s);
    country.schools.push(s);
  }
  const byName = (a, b) => a.name.localeCompare(b.name);
  const list = [...countries.values()].sort(byName);
  for (const co of list) {
    co.regionList = [...co.regions.values()].sort(byName);
    for (const r of co.regionList) r.cityList = [...r.cities.values()].sort(byName);
  }
  const all = [];
  for (const co of list) {
    all.push(co);
    for (const r of co.regionList) {
      all.push(r);
      for (const c of r.cityList) all.push(c);
    }
  }
  return { countries: list, all };
}

// Compact records for the client-side finder (/schools-index.json).
export function finderIndex(schools) {
  return schools.map((s) => {
    const fm = s.fm || {};
    return {
      n: s.title,
      u: s.path,
      c: fm.country || '',
      cn: countryLabel(fm.country),
      r: fm.region || '',
      rn: regionLabel(fm.country, fm.region),
      t: fm.city || '',
      z: fm.postal ? String(fm.postal) : '',
      m: s.meta || '',
    };
  });
}
