// Editorial checks that run on every build. They turn the site's writing rules into code, so a new
// page cannot quietly break them. `error` rules stop the build; `warn` rules are listed for review.

export const rules = [
  {
    level: 'error',
    test: /\boriginal founders? of (taekwondo|tkd|taekwon-do)\b/i,
    message: 'No one person or group founded Taekwondo. Say "founders of the original five kwans" or "kwan founders".',
  },
  {
    level: 'error',
    test: /\b(TODO|TBD|FIXME|lorem ipsum)\b/i,
    message: 'Placeholder text left in the page.',
  },
  {
    level: 'warn',
    test: /\b(no order (of age )?is implied|listed alphabetically|neutral(ity)? is|this site (therefore|treats|does not|doesn't|has not)|sources found|we could reach)\b/i,
    message: 'Commentary about the page or the site itself. Say only what helps the reader learn about Taekwondo.',
  },
  {
    level: 'warn',
    test: /(!{2,}|\bamazing\b|\bbest in\b|\bworld-class\b|\bpremier\b)/i,
    message: 'Promotional wording. Keep descriptions neutral and factual.',
  },
];

// Returns [{ level, message, snippet }] for one piece of text.
export function lintText(text) {
  const out = [];
  for (const r of rules) {
    const m = r.test.exec(text);
    if (m) out.push({ level: r.level, message: r.message, snippet: m[0] });
  }
  return out;
}
