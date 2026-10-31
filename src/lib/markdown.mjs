// A small Markdown renderer covering exactly what the content files use.
// Block level: ## headings, paragraphs, lists (nested), tables, blockquotes.
// Inline: **bold**, *italic*, `code`, [text](url), [[wiki links]], [^1] source citations.
// Raw HTML is never allowed: everything is escaped.

import { esc, slugify, stripTags } from './util.mjs';

const isBlank = (l) => !l.trim();
const reHeading = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const reUl = /^(\s*)[-*]\s+(.*)$/;
const reOl = /^(\s*)\d+\.\s+(.*)$/;
const reTableSep = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const isListLine = (l) => reUl.test(l) || reOl.test(l);
const isTableStart = (lines, i) => lines[i].includes('|') && i + 1 < lines.length && reTableSep.test(lines[i + 1]);
const startsBlock = (lines, i) =>
  reHeading.test(lines[i]) || isListLine(lines[i]) || lines[i].startsWith('>') || isTableStart(lines, i);

/**
 * ctx = {
 *   resolve(target) -> {path, title} | null     looks up a [[wiki link]]
 *   linked(hit)                                  records that this page links to hit
 *   sourceCount                                  how many sources the page lists
 *   error(message)                               reports a problem (fails the build)
 * }
 */
export function renderMarkdown(src, ctx, reservedIds = []) {
  const headings = [];
  const usedIds = new Set(reservedIds);
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const html = blocks(lines, ctx, headings, usedIds);
  return { html, headings };
}

function blocks(lines, ctx, headings, usedIds) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      i++;
      continue;
    }

    const h = line.match(reHeading);
    if (h) {
      const level = h[1].length;
      if (level === 1) ctx.error('use the front matter title instead of a "# " heading in the body');
      if (level > 4) ctx.error(`heading too deep: "${h[2]}" (use ## to ####)`);
      const text = stripTags(inline(h[2], ctx));
      let id = slugify(text) || 'section';
      for (let n = 2; usedIds.has(id); n++) id = `${slugify(text)}-${n}`;
      usedIds.add(id);
      headings.push({ level, id, text });
      out.push(
        `<h${level} id="${id}">${inline(h[2], ctx)} <a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>`,
      );
      i++;
      continue;
    }

    if (isTableStart(lines, i)) {
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && !isBlank(lines[i])) {
        rows.push(lines[i]);
        i++;
      }
      out.push(table(rows, ctx));
      continue;
    }

    if (line.startsWith('>')) {
      const inner = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        inner.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${blocks(inner, ctx, headings, usedIds)}</blockquote>`);
      continue;
    }

    if (isListLine(line)) {
      const items = [];
      while (i < lines.length && !isBlank(lines[i]) && (isListLine(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        items.push(lines[i]);
        i++;
      }
      out.push(list(items, ctx));
      continue;
    }

    const para = [];
    while (i < lines.length && !isBlank(lines[i]) && (para.length === 0 || !startsBlock(lines, i))) {
      para.push(lines[i].trim());
      i++;
    }
    out.push(`<p>${inline(para.join(' '), ctx)}</p>`);
  }
  return out.join('\n');
}

function list(items, ctx) {
  let pos = 0;
  const indentOf = (l) => l.match(/^\s*/)[0].length;
  function level(indent) {
    const tag = reOl.test(items[pos]) && !reUl.test(items[pos]) ? 'ol' : 'ul';
    let out = `<${tag}>`;
    while (pos < items.length) {
      const line = items[pos];
      const ind = indentOf(line);
      if (ind < indent) break;
      const m = line.match(reUl) || line.match(reOl);
      if (ind > indent && m) {
        out = out.replace(/<\/li>$/, '') + level(ind) + '</li>';
        continue;
      }
      if (!m) {
        out = out.replace(/<\/li>$/, ` ${inline(line.trim(), ctx)}</li>`);
        pos++;
        continue;
      }
      out += `<li>${inline(m[2], ctx)}</li>`;
      pos++;
    }
    return `${out}</${tag}>`;
  }
  return level(indentOf(items[0]));
}

function table(rows, ctx) {
  const cells = (r) =>
    r
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  const th = head.map((c) => `<th scope="col">${inline(c, ctx)}</th>`).join('');
  const trs = body
    .map((r) => {
      const tds = r.map((c, n) => (n === 0 ? `<th scope="row">${inline(c, ctx)}</th>` : `<td>${inline(c, ctx)}</td>`));
      return `<tr>${tds.join('')}</tr>`;
    })
    .join('\n');
  return `<div class="table-wrap" role="region" aria-label="Table" tabindex="0"><table><thead><tr>${th}</tr></thead><tbody>\n${trs}\n</tbody></table></div>`;
}

export function inline(text, ctx) {
  const toks = [];
  const tok = (html) => {
    toks.push(html);
    return `\u0001${toks.length - 1}\u0001`;
  };

  let s = text.replace(/`([^`]+)`/g, (_, c) => tok(`<code>${esc(c)}</code>`));

  s = s.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (_, target, label) => {
    const hit = ctx.resolve(target.trim());
    if (!hit) {
      ctx.error(`unknown wiki link [[${target}]]`);
      return tok(esc(label || target));
    }
    ctx.linked(hit);
    return tok(`<a href="${hit.path}">${inline(label || hit.title, ctx)}</a>`);
  });

  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    if (/^https?:\/\//i.test(url)) {
      return tok(`<a href="${esc(url)}" rel="noopener noreferrer">${inline(label, ctx)}</a>`);
    }
    if (/^(\/|#|mailto:)/.test(url)) return tok(`<a href="${esc(url)}">${inline(label, ctx)}</a>`);
    ctx.error(`link "${url}" must start with https://, / or #`);
    return tok(esc(label));
  });

  s = s.replace(/\[\^(\d+)\]/g, (_, n) => {
    if (Number(n) < 1 || Number(n) > ctx.sourceCount) {
      ctx.error(`citation [^${n}] has no matching entry in the sources list`);
    }
    return tok(`<sup class="cite"><a href="#source-${n}" aria-label="Source ${n}">[${n}]</a></sup>`);
  });

  s = esc(s);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?!\w)/g, '$1<em>$2</em>');

  // Restore tokens (loop in case one token contains another).
  for (let n = 0; n < 3 && /\u0001\d+\u0001/.test(s); n++) {
    s = s.replace(/\u0001(\d+)\u0001/g, (_, i) => toks[i]);
  }
  return s;
}
