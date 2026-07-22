import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  chooseSummary, toWork, normalizeTitle, dedupe, sortByYearDesc, isSelf,
} from '../src/lib/orcid.mjs';

const fixture = JSON.parse(
  readFileSync(new URL('./fixtures/orcid-works.json', import.meta.url), 'utf8'),
);
const works = fixture.group.map((g) => toWork(chooseSummary(g)));

test('toWork extrai título, periódico, ano e DOI', () => {
  assert.equal(works[1].title, 'The Newton-X platform for mixed quantum–classical dynamics');
  assert.equal(works[1].journal, 'Physical Chemistry Chemical Physics');
  assert.equal(works[1].year, 2026);
  assert.equal(works[1].doi, '10.1039/D6CP01391K');
  assert.equal(works[0].journal, null);
});

test('normalizeTitle iguala variações de caixa e pontuação', () => {
  assert.equal(normalizeTitle(works[0].title), normalizeTitle(works[1].title));
});

test('dedupe mantém a versão de periódico, descarta o preprint', () => {
  const result = dedupe(works);
  assert.equal(result.length, 3);
  const newtonx = result.find((w) => /newton-x/i.test(w.title));
  assert.equal(newtonx.journal, 'Physical Chemistry Chemical Physics');
});

test('sortByYearDesc ordena do mais recente ao mais antigo', () => {
  const sorted = sortByYearDesc(dedupe(works));
  assert.deepEqual(sorted.map((w) => w.year), [2026, 2022, null]);
});

test('isSelf reconhece as variações do nome do Ely', () => {
  assert.ok(isSelf('E. G. F. de Miranda'));
  assert.ok(isSelf('Ely Giancoli Ferreira de Miranda'));
  assert.ok(isSelf('MIRANDA, E. G. F.'));
  assert.ok(!isSelf('M. T. do N. Varella'));
  assert.ok(!isSelf('Mario Barbatti'));
  assert.ok(isSelf('Ely G. F. de Miranda'));
  assert.ok(!isSelf('João Miranda'));
  assert.ok(!isSelf('Carla Miranda Souza'));
});

test('toWork não quebra sem ano nem DOI', () => {
  const bare = works[3];
  assert.equal(bare.year, null);
  assert.equal(bare.doi, null);
  assert.equal(bare.journal, null);
});
