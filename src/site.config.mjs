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
  stage: 'Early foundation: curated edition',
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
  },
  people: {
    dir: 'people',
    base: '/people',
    type: 'person',
    label: 'Person',
    plural: 'People',
    intro: 'The founders of the kwans from which Taekwondo developed, followed by the teachers and school founders who came after them, with documented lineage links where sources allow. No one person is credited as the founder of Taekwondo.',
    description: 'Taekwondo founders, kwan leaders and notable masters, with sourced biographies and lineage links.',
  },
  kwans: {
    dir: 'kwans',
    base: '/kwans',
    type: 'organization',
    label: 'Kwan',
    plural: 'Kwans',
    intro:
      'The Korean martial arts schools (kwans) from which modern Taekwondo developed: the original five of the mid-1940s, then later kwans, each listed alphabetically. Founding dates differ between sources, so no order of age is implied; each page says where the accounts differ.',
    description: 'The original Korean kwans behind modern Taekwondo: founders, dates and the disagreements between sources.',
  },
  organizations: {
    dir: 'organizations',
    base: '/organizations',
    type: 'organization',
    label: 'Organization',
    plural: 'Organizations',
    intro: 'Federations, technical authorities and independent organizations that shape Taekwondo today, listed alphabetically. The comparison article explains how they relate.',
    description: 'World Taekwondo, the ITF, the Kukkiwon and other major Taekwondo organizations.',
  },
  schools: {
    dir: 'schools',
    base: '/schools',
    type: 'school',
    label: 'School',
    plural: 'Schools',
    intro:
      'A curated directory of Taekwondo schools. Entries are added by the editors from public, citable information. Listing is free.',
    description: 'A curated, free directory of Taekwondo schools with sourced information and lineage links.',
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
