import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pickMetrics } from '../src/lib/openalex.mjs';

const author = JSON.parse(
  readFileSync(new URL('./fixtures/openalex-author.json', import.meta.url), 'utf8'),
);

test('pickMetrics extrai h-index, citações e nº de trabalhos', () => {
  assert.deepEqual(pickMetrics(author), { hIndex: 2, citations: 14, works: 6 });
});

test('pickMetrics tolera campos ausentes', () => {
  assert.deepEqual(pickMetrics({}), { hIndex: null, citations: null, works: null });
  assert.deepEqual(pickMetrics(null), { hIndex: null, citations: null, works: null });
});
