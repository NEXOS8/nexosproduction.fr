import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const route = '/site-internet-ou-google-maps-artisan';

test('Le comparatif a une intention et une URL distinctes, reliées au sitemap', async () => {
  const source = await read(route.slice(1) + '.html');
  assert.equal((source.match(/<h1[ >]/g) || []).length, 1);
  assert.match(source, /<link rel="canonical" href="https:\/\/www\.nexoslocal\.fr\/site-internet-ou-google-maps-artisan">/);
  assert.match(await read('sitemap.xml'), /<loc>https:\/\/www\.nexoslocal\.fr\/site-internet-ou-google-maps-artisan<\/loc>/);
  assert.match(source, /href="\/artisans-batiment"/);
});

test('Les trois pages sources conduisent au comparatif sans route orpheline', async () => {
  for (const file of ['artisans-batiment.html', 'referencement-local.html', 'obtenir-plus-demandes-devis-artisan.html']) {
    assert.ok((await read(file)).includes(`href="${route}"`), file);
  }
});

test('Le contact du comparatif prépare un e-mail, sans collecte de formulaire', async () => {
  const source = await read(route.slice(1) + '.html');
  const href = source.match(/href="(mailto:contact@nexoslocal\.fr\?[^\"]+)"/)[1].replaceAll('&amp;', '&');
  const mail = new URL(href);
  assert.equal(mail.pathname, 'contact@nexoslocal.fr');
  assert.equal(mail.searchParams.get('subject'), 'Depuis le comparatif NexosLocal — site ou Google Maps');
  assert.ok(mail.searchParams.get('body').includes('Mon métier'));
  assert.match(source, /Relisez puis envoyez votre message/);
  assert.doesNotMatch(source, /<form[ >]/);
});

test('Aucune preuve Maïka non validée ni appel à contacter personnellement le fondateur', async () => {
  for (const file of ['artisans-batiment.html', 'referencement-local.html', 'obtenir-plus-demandes-devis-artisan.html', route.slice(1) + '.html']) {
    assert.doesNotMatch(await read(file), /Ma[iï]ka|(?:contacter|appeler|appeller)\s+Théo/i, file);
  }
});
