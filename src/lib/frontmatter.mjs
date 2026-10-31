// A deliberately small front-matter reader (a safe subset of YAML).
// Supported:   key: value
//              key: [a, b, "c, d"]
//              key:
//                - item
//                - item
// Everything is a string except true/false. No nested objects (keeps content files easy to edit).

export function parseFrontmatter(raw, file = 'file') {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter (--- block) at the top of the file`);

  const data = {};
  const lines = m[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }
    const kv = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) throw new Error(`${file}: line ${i + 1} of front matter could not be read: "${line}"`);
    const [, key, rest] = kv;
    if (key in data) throw new Error(`${file}: duplicate front matter key "${key}"`);

    if (rest.trim() === '') {
      const items = [];
      i++;
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        items.push(scalar(lines[i].replace(/^\s+-\s+/, '')));
        i++;
      }
      data[key] = items;
      continue;
    }
    data[key] = value(rest);
    i++;
  }
  return { data, body: m[2] };
}

function value(v) {
  v = v.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    return splitInline(v.slice(1, -1))
      .map(scalar)
      .filter((x) => x !== '');
  }
  return scalar(v);
}

function scalar(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).replace(/\\"/g, '"');
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

function splitInline(s) {
  const out = [];
  let cur = '';
  let q = null;
  for (const ch of s) {
    if (q) {
      cur += ch;
      if (ch === q) q = null;
    } else if (ch === '"' || ch === "'") {
      q = ch;
      cur += ch;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}
