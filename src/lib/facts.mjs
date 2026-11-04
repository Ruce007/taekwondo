// Quick-facts rows that are built from a page's own data, so each fact is typed once
// and every page of that kind shows it the same way. Rows written by hand in a page's
// `infobox:` list follow these.

import { esc } from './util.mjs';

const hostOf = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

// "+1-949-551-1800" -> { text: "(949) 551-1800", href: "tel:+19495511800" }
export function phoneParts(raw) {
  const digits = String(raw).replace(/[^\d+]/g, '');
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(digits);
  return { text: m ? `(${m[1]}) ${m[2]}-${m[3]}` : String(raw), href: `tel:${digits}` };
}

export function addressLine(fm) {
  const place = [fm.city, [fm.region, fm.postal].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return [fm.street, place].filter(Boolean).join(', ');
}

const builders = {
  school(fm) {
    const rows = [];
    rows.push({ label: 'Address', html: esc(addressLine(fm)) + (fm.addressNote ? ` (${esc(fm.addressNote)})` : '') });
    if (fm.phone) {
      const p = phoneParts(fm.phone);
      rows.push({ label: 'Phone', html: `<a href="${esc(p.href)}">${esc(p.text)}</a>` });
    }
    if (fm.website) {
      rows.push({ label: 'Website', html: `<a href="${esc(fm.website)}" rel="noopener">${esc(hostOf(fm.website))}</a>` });
    }
    return rows;
  },
};

export function autoFacts(page) {
  const build = builders[page.col.type];
  return build ? build(page.fm) : [];
}
