// Small flag icons drawn as inline SVG (4:3), so they look the same on every device.
// Emoji flags are not used because Windows does not display them.
const star = (cx, cy, r, rot = -90) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = ((rot + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? r * 0.382 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }).join(' ');

// One trigram: three short bars stacked along the line to the flag's centre. true = solid, false = broken.
const trigram = (cx, cy, pattern) => {
  const ang = (Math.atan2(cy - 12, cx - 16) * 180) / Math.PI;
  const bar = (solid, k) => {
    const y = cy - 1.7 + k * 1.7;
    return solid
      ? `<rect x="${cx - 2.4}" y="${y}" width="4.8" height="0.9"/>`
      : `<rect x="${cx - 2.4}" y="${y}" width="2" height="0.9"/><rect x="${cx + 0.4}" y="${y}" width="2" height="0.9"/>`;
  };
  return `<g fill="#000" transform="rotate(${ang + 90} ${cx} ${cy})">${pattern.map(bar).join('')}</g>`;
};

const flags = {
  // English: United States
  en: () => `<rect width="32" height="24" fill="#fff"/>${Array.from({ length: 7 }, (_, i) => `<rect y="${(i * 24) / 13 * 2}" width="32" height="${24 / 13}" fill="#b22234"/>`).join('')}<rect width="14" height="12.9" fill="#3c3b6e"/><g fill="#fff">${[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => `<circle cx="${2.4 + c * 4.6 + (r % 2) * 2.3}" cy="${2.2 + r * 3}" r="0.7"/>`)).join('')}</g>`,
  // Korean: Taegeukgi
  ko: () => `<rect width="32" height="24" fill="#fff"/><g transform="rotate(-33.7 16 12)"><path d="M11.5 12a4.5 4.5 0 0 1 9 0a2.25 2.25 0 0 1-4.5 0a2.25 2.25 0 0 0-4.5 0z" fill="#cd2e3a"/><path d="M20.5 12a4.5 4.5 0 0 1-9 0a2.25 2.25 0 0 0 4.5 0a2.25 2.25 0 0 1 4.5 0z" fill="#0047a0"/></g>${trigram(5.2, 4.6, [true, true, true])}${trigram(26.8, 19.4, [false, false, false])}${trigram(26.8, 4.6, [false, true, false])}${trigram(5.2, 19.4, [true, false, true])}`,
  es: () => `<rect width="32" height="24" fill="#aa151b"/><rect y="6" width="32" height="12" fill="#f1bf00"/>`,
  'zh-Hans': () => `<rect width="32" height="24" fill="#de2910"/><polygon points="${star(6.5, 6.5, 3.6)}" fill="#ffde00"/><g fill="#ffde00">${[[12.5, 2.6, 20], [14.5, 5, 45], [14.5, 8.2, 70], [12.5, 10.6, 95]].map(([x, y, r]) => `<polygon points="${star(x, y, 1.1, r)}"/>`).join('')}</g>`,
  // Traditional Chinese: Taiwan
  'zh-Hant': () => `<rect width="32" height="24" fill="#fe0000"/><rect width="16" height="12" fill="#000095"/><g fill="#fff"><circle cx="8" cy="6" r="2.7"/>${Array.from({ length: 12 }, (_, i) => `<polygon points="${[0, 1, 2].map((k) => { const a = ((i * 30 + [-6, 0, 6][k]) * Math.PI) / 180; const r = k === 1 ? 4.6 : 3.2; return `${(8 + r * Math.cos(a)).toFixed(2)},${(6 + r * Math.sin(a)).toFixed(2)}`; }).join(' ')}"/>`).join('')}</g><circle cx="8" cy="6" r="2.1" fill="#000095"/><circle cx="8" cy="6" r="1.8" fill="#fff"/>`,
  ja: () => `<rect width="32" height="24" fill="#fff"/><circle cx="16" cy="12" r="6.2" fill="#bc002d"/>`,
  de: () => `<rect width="32" height="8" fill="#000"/><rect y="8" width="32" height="8" fill="#dd0000"/><rect y="16" width="32" height="8" fill="#ffce00"/>`,
  fa: () => `<rect width="32" height="8" fill="#239f40"/><rect y="8" width="32" height="8" fill="#fff"/><rect y="16" width="32" height="8" fill="#da0000"/><path d="M16 8.6c-1.8 0-3.2 1.5-3.2 3.4s1.4 3.4 3.2 3.4 3.2-1.5 3.2-3.4S17.8 8.6 16 8.6z" fill="none" stroke="#da0000" stroke-width="1"/><path d="M16 8.2v7.6" stroke="#da0000" stroke-width="1"/>`,
  pt: () => `<rect width="32" height="24" fill="#009b3a"/><polygon points="16,3 29,12 16,21 3,12" fill="#fedf00"/><circle cx="16" cy="12" r="4.6" fill="#002776"/><path d="M11.6 11.2c3.2-.8 6.2-.2 8.8 1.4" stroke="#fff" stroke-width="0.9" fill="none"/>`,
  tr: () => `<rect width="32" height="24" fill="#e30a17"/><circle cx="12" cy="12" r="6" fill="#fff"/><circle cx="13.6" cy="12" r="4.8" fill="#e30a17"/><polygon points="${star(18.6, 12, 2.6, 0)}" fill="#fff"/>`,
};

export function flagSvg(code) {
  const draw = flags[code];
  if (!draw) return '';
  return `<svg class="flag" viewBox="0 0 32 24" width="24" height="18" aria-hidden="true" focusable="false"><g>${draw()}</g><rect width="32" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.25"/></svg>`;
}
