// Siglas e páginas das revistas para o cartão de periódicos.
// Periódico sem entrada aparece com o nome completo, sem link (fallback seguro).
const JOURNALS = {
  'Physical Chemistry Chemical Physics': {
    abbrev: 'PCCP',
    url: 'https://pubs.rsc.org/en/journals/journal/cp',
  },
  'The Journal of Physical Chemistry A': {
    abbrev: 'JPCA',
    url: 'https://pubs.acs.org/journal/jpcafh',
  },
  'Journal of Chemical Theory and Computation': {
    abbrev: 'JCTC',
    url: 'https://pubs.acs.org/journal/jctcce',
  },
  'Physica Scripta': {
    abbrev: 'Phys. Scr.',
    url: 'https://iopscience.iop.org/journal/1402-4896',
  },
  ChemPhysChem: {
    abbrev: 'ChemPhysChem',
    url: 'https://chemistry-europe.onlinelibrary.wiley.com/journal/14397641',
  },
};

export function journalAbbrev(name) {
  return JOURNALS[name]?.abbrev ?? name;
}

export function journalUrl(name) {
  return JOURNALS[name]?.url ?? null;
}
