export const ORCID_ID = '0000-0001-8237-1670';
const API = 'https://pub.orcid.org/v3.0';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
  return res.json();
}

export function chooseSummary(group) {
  const summaries = group['work-summary'] ?? [];
  return summaries.find((s) => s['journal-title']?.value) ?? summaries[0];
}

export function toWork(summary) {
  const ids = summary['external-ids']?.['external-id'] ?? [];
  const doi = ids.find((i) => i['external-id-type'] === 'doi')?.['external-id-value'] ?? null;
  return {
    putCode: summary['put-code'],
    title: summary.title?.title?.value ?? '',
    journal: summary['journal-title']?.value ?? null,
    year: Number(summary['publication-date']?.year?.value) || null,
    doi,
  };
}

export function normalizeTitle(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function dedupe(works) {
  const byTitle = new Map();
  for (const work of works) {
    const key = normalizeTitle(work.title);
    const prev = byTitle.get(key);
    if (!prev || (!prev.journal && work.journal)) byTitle.set(key, work);
  }
  return [...byTitle.values()];
}

export function sortByYearDesc(works) {
  return [...works].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

export function isSelf(name) {
  if (!/miranda/i.test(name)) return false;
  return /\bely\b/i.test(name) || /\be\.?\s*(g\.?\s*)?(f\.?\s*)?(de\s+)?miranda/i.test(name) || /miranda,\s*e/i.test(name);
}

async function fetchAuthors(orcidId, putCode, doi) {
  const work = await fetchJson(`${API}/${orcidId}/work/${putCode}`);
  const contributors = work.contributors?.contributor ?? [];
  const names = contributors
    .map((c) => c['credit-name']?.value)
    .filter(Boolean);
  if (names.length && names.length === contributors.length) return names;
  if (doi) {
    try {
      const cr = await fetchJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
      return (cr.message.author ?? []).map((a) =>
        [a.given, a.family].filter(Boolean).join(' '),
      );
    } catch {
      // Crossref é só fallback: sem autores ainda renderizamos título/periódico/DOI.
    }
  }
  return [];
}

export async function fetchPublications(orcidId = ORCID_ID) {
  const data = await fetchJson(`${API}/${orcidId}/works`);
  const works = sortByYearDesc(dedupe((data.group ?? []).map((g) => toWork(chooseSummary(g)))));
  return Promise.all(
    works.map(async (w) => ({ ...w, authors: await fetchAuthors(orcidId, w.putCode, w.doi) })),
  );
}
