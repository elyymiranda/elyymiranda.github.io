export const ORCID_ID = '0000-0001-8237-1670';

export function pickMetrics(author) {
  return {
    hIndex: author?.summary_stats?.h_index ?? null,
    citations: author?.cited_by_count ?? null,
    works: author?.works_count ?? null,
  };
}

// Métricas são decoração: qualquer falha vira null e a página simplesmente
// não mostra a caixa. Nunca derrubar o build por causa disso.
// Cache de módulo: as páginas EN e PT compartilham a mesma resposta no build,
// então as duas línguas sempre mostram (ou escondem) a caixa juntas.
let cached;

export async function fetchMetrics(orcid = ORCID_ID) {
  if (cached !== undefined) return cached;
  cached = null;
  try {
    const res = await fetch(`https://api.openalex.org/authors/orcid:${orcid}`, {
      headers: { 'User-Agent': 'elyymiranda.github.io (mailto:ely.miranda@usp.br)' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const m = pickMetrics(await res.json());
      if ((m.hIndex ?? m.citations ?? m.works) != null) cached = m;
    }
  } catch {
    // sem resposta, sem caixa
  }
  return cached;
}

// Contagem de citações por DOI (uma chamada em lote). Mesmo contrato fail-soft:
// erro vira mapa vazio e a página simplesmente não mostra badges.
let cachedCites;

export function mostCitedDoi(counts) {
  let best = null;
  let bestN = 0;
  for (const [doi, n] of Object.entries(counts)) {
    if (n > bestN) {
      best = doi;
      bestN = n;
    }
  }
  return best;
}

export async function fetchCitations(dois) {
  if (cachedCites !== undefined) return cachedCites;
  cachedCites = {};
  const clean = dois.filter(Boolean);
  if (!clean.length) return cachedCites;
  try {
    const filter = clean.map((d) => d.toLowerCase()).join('|');
    const res = await fetch(
      `https://api.openalex.org/works?filter=doi:${filter}&per-page=50&select=doi,cited_by_count`,
      {
        headers: { 'User-Agent': 'elyymiranda.github.io (mailto:ely.miranda@usp.br)' },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (res.ok) {
      const data = await res.json();
      for (const w of data.results ?? []) {
        const doi = (w.doi ?? '').replace('https://doi.org/', '');
        if (doi) cachedCites[doi.toLowerCase()] = w.cited_by_count ?? 0;
      }
    }
  } catch {
    // sem resposta, sem badges
  }
  return cachedCites;
}
