// Central site settings. Change things here, not inside templates.

export const site = {
  name: 'tkd.wiki',
  url: 'https://tkd.wiki',
  locale: 'en',
  tagline: 'Taekwondo history, lineages, masters and schools',
  description:
    'A curated, sourced Taekwondo reference: history, kwans, founders, organizations and a growing directory of schools.',
  // Shown in the footer. Deliberately an editorial team name, not a person.
  publisher: 'tkd.wiki editors',
  stage: 'Curated edition',
};

// How far a page's facts have been checked. See /editorial-policy/.
export const statuses = {
  provisional: {
    label: 'Provisional',
    note: 'This page draws mainly on encyclopedic and organizational sources and has not yet had a full primary-source review.',
  },
  reviewed: {
    label: 'Reviewed',
    note: '',
  },
};

// Each collection lives in content/<dir>/*.md and is published at <base>/<slug>/.
export const collections = {
  articles: {
    dir: 'articles',
    base: '/wiki',
    type: 'article',
    label: 'Article',
    plural: 'Wiki',
    intro: 'Reference articles on the history, practice and organization of Taekwondo.',
    description: 'Reference articles on Taekwondo history, etymology, ranks, competition and equipment.',
    // Index page sections. `by` is the front-matter field; each item lists the values it takes.
    groups: { by: 'category', items: [] }, // filled from articleCategories below
    fields: { category: { required: true } },
  },
  people: {
    dir: 'people',
    base: '/people',
    type: 'person',
    label: 'Person',
    plural: 'People',
    intro: 'The founders of the kwans from which Taekwondo developed, followed by the teachers and school founders who came after them, with documented lineage links where sources allow. No one person is credited as the founder of Taekwondo.',
    description: 'Taekwondo founders, kwan leaders and notable masters, with sourced biographies and lineage links.',
    groups: {
      by: 'role',
      items: [
        { label: 'Founders of the original five kwans', values: ['kwan-founder'] },
        { label: 'Founders of later kwans', values: ['later-kwan-founder'] },
        { label: 'Teachers and school founders', rest: true },
      ],
    },
    fields: { role: { values: ['kwan-founder', 'later-kwan-founder'] }, born: {}, died: {}, teachers: {}, kwan: {} },
  },
  kwans: {
    dir: 'kwans',
    base: '/kwans',
    type: 'organization',
    label: 'Kwan',
    plural: 'Kwans',
    intro:
      'The Korean martial arts schools (kwans) from which modern Taekwondo developed: the original five of the mid-1940s and four later kwans of the 1950s.',
    description: 'The original Korean kwans behind modern Taekwondo: founders, dates and the disagreements between sources.',
    groups: {
      by: 'generation',
      items: [
        { label: 'The original five kwans (mid-1940s)', short: 'The original five · mid-1940s', values: ['original'] },
        { label: 'Later kwans (1950s)', short: 'Four later kwans · 1950s', values: ['later'] },
      ],
    },
    fields: { generation: { required: true, values: ['original', 'later'] }, founded: {}, founders: {}, website: {}, annexOf: {} },
  },
  organizations: {
    dir: 'organizations',
    base: '/organizations',
    type: 'organization',
    label: 'Organization',
    plural: 'Organizations',
    intro: 'Federations, technical authorities and independent organizations that shape Taekwondo today.',
    description: 'World Taekwondo, the ITF, the Kukkiwon and other major Taekwondo organizations.',
    fields: { founded: {}, founders: {}, website: {} },
  },
  schools: {
    dir: 'schools',
    base: '/schools',
    type: 'school',
    label: 'School',
    plural: 'Schools',
    intro:
      'A directory of Taekwondo schools by country, state and city, with address, phone and website.',
    description: 'A curated, free directory of Taekwondo schools with sourced information and lineage links.',
    // Required for the directory and the place search. phone and website are shown when present.
    fields: {
      country: { required: true },
      region: { required: true },
      city: { required: true },
      street: { required: true },
      postal: { required: true },
      phone: {},
      website: {},
      founded: {},
      addressNote: {},
      kwan: {},
      founders: {},
    },
  },
  pages: {
    dir: 'pages',
    base: '',
    type: 'page',
    label: 'Page',
    plural: 'Pages',
  },
};

// Main navigation (order matters). `collection` marks which section is "current".
export const nav = [
  { label: 'Wiki', href: '/wiki/', collection: 'articles' },
  { label: 'People', href: '/people/', collection: 'people' },
  { label: 'Kwans', href: '/kwans/', collection: 'kwans' },
  { label: 'Organizations', href: '/organizations/', collection: 'organizations' },
  { label: 'Schools', href: '/schools/', collection: 'schools' },
  { label: 'About', href: '/about/', collection: 'pages' },
];

export const countryNames = {
  US: 'United States',
  KR: 'South Korea',
  CA: 'Canada',
  GB: 'United Kingdom',
};

// Region (state/province) names for the schools index. Add entries as regions are added.
export const regionNames = {
  US: { CA: 'California', NV: 'Nevada' },
};

export const articleCategories = ['Fundamentals', 'History', 'Practice', 'Competition', 'Directories'];
collections.articles.groups.items = articleCategories.map((c) => ({ label: c, values: [c] }));

// Advertising. Everything below is OFF until `enabled` is true, and nothing renders while it is off.
// Slots are placed by the page frame (see src/lib/components.mjs), never inside article text.
export const ads = {
  enabled: false,
  // Set ADS_PREVIEW=1 when building to see labelled placeholders for design checks (never deployed).
  label: 'Advertisement',
  sponsoredLabel: 'Sponsored',
  slots: {
    // Right column of article pages, directly under Quick facts. On phones it follows Quick facts.
    rail: { sizes: '300x250', minHeight: '15.5rem' },
    // Optional second unit after the third section on long pages. Off by default.
    article: { enabled: false, sizes: '336x280', minHeight: '17.5rem', afterSection: 3 },
  },
  // Direct sponsorship creative. Example: { href: 'https://example.com', image: '/assets/ads/x.png', alt: 'Example', width: 300, height: 250 }
  direct: {},
};

// Funding statement, shown in the footer and on the About page only while ads are enabled.
export const funding = 'tkd.wiki is independent. Advertising and affiliate links help cover hosting and development, and they do not influence what the articles say.';

// Pages shown under "Start here" on the home page, in order. Use collection/slug.
// A reading path, in order: what it is, where it came from, who runs it, then practice and competition.
export const featured = [
  'articles/taekwondo',
  'articles/history-of-taekwondo',
  'articles/taekwondo-organizations-compared',
  'articles/belt-ranks',
  'articles/techniques-and-forms',
  'articles/taekwondo-at-the-olympics',
];
