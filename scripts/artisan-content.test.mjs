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

test('La démonstration est identifiée comme notre propre site, pas un résultat client', async () => {
  const source = await read('artisans-batiment.html');
  assert.match(source, /id="demonstration"/);
  assert.match(source, /Exemple de mise en œuvre sur notre site, pas un cas client ni une preuve de résultat commercial/);
  assert.match(source, /src="\/assets\/demonstration-contact-nexoslocal-v1\.jpg" width="1265" height="712" loading="lazy"/);
  assert.match(source, /style="width:100%;height:auto;margin-top:24px"/);
  const bytes = await readFile(new URL('assets/demonstration-contact-nexoslocal-v1.jpg', root));
  assert.equal(bytes[0], 0xff);
  assert.equal(bytes[1], 0xd8);
  assert.ok(bytes.length < 500000, 'Capture trop lourde pour cet usage');
});

test('Les intentions site artisan et prestation Maps sont reliées sans pages de ville artificielles', async () => {
  const artisans = await read('artisans-batiment.html');
  const local = await read('referencement-local.html');
  assert.match(artisans, /id="site-internet-artisan"/);
  assert.match(local, /id="prestations"/);
  assert.match(artisans, /href="\/referencement-local#prestations"/);
  assert.match(local, /href="\/artisans-batiment#site-internet-artisan"/);
  assert.match(await read('index.html'), /<title>Consultant en acquisition client B2C \| NexosLocal<\/title>/);
});
