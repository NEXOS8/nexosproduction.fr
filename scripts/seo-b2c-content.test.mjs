import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('La page SEO B2C conserve son URL et des métadonnées cohérentes avec le service', async () => {
  const source = await read('referencement-naturel.html');
  const title = source.match(/<title>(.*?)<\/title>/)[1];
  const description = source.match(/<meta name="description" content="([^"]+)"/)[1];
  assert.match(title, /^SEO B2C :/);
  assert.ok(source.includes(`<meta property="og:title" content="${title}">`));
  assert.ok(source.includes(`<meta name="twitter:title" content="${title}">`));
  assert.ok(source.includes(`<meta property="og:description" content="${description}">`));
  assert.ok(source.includes(`<meta name="twitter:description" content="${description}">`));
  const schema = JSON.parse(source.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const service = schema['@graph'].find(node => node['@type'] === 'Service');
  assert.equal(service.description, description);
  assert.equal(service.url, 'https://www.nexoslocal.fr/referencement-naturel');
  assert.match(source, /<link rel="canonical" href="https:\/\/www\.nexoslocal\.fr\/referencement-naturel">/);
  assert.equal((source.match(/<h1[ >]/g) || []).length, 1);
});

test('La page SEO apporte des critères concrets sans transformer les exemples en résultats', async () => {
  const source = await read('referencement-naturel.html');
  for (const id of ['recherches', 'priorites', 'mesure-seo']) {
    assert.ok(source.includes(`id="${id}"`));
    assert.ok(source.includes(`href="#${id}"`));
  }
  assert.match(source, /ce ne sont pas des volumes de recherche vérifiés/);
  assert.match(source, /Il montre une mise en œuvre, pas un résultat client/);
  assert.match(source, /une impression n’est pas un clic ; un clic n’est pas une demande/);
  assert.doesNotMatch(source, /Ma[iï]ka|(?:contacter|appeler|appeller)\s+Théo/i);
  assert.doesNotMatch(source, /"@type":"(?:Review|AggregateRating|FAQPage)"/);
});

test('Le guide multicanal et la prestation SEO se relient par des liens HTML explicites', async () => {
  const seo = await read('referencement-naturel.html');
  const guide = await read('generer-plus-de-prospects-b2c.html');
  assert.match(guide, /href="\/referencement-naturel#recherches"/);
  assert.match(guide, /href="\/referencement-naturel#priorites"/);
  assert.match(seo, /href="\/generer-plus-de-prospects-b2c#rentabilite"/);
  assert.match(seo, /href="\/generer-plus-de-prospects-b2c#mesure"/);
  assert.match(seo, /href="\/artisans-batiment#demonstration"/);
  assert.match(seo, /href="mailto:contact@nexoslocal.fr"/);
  assert.match(await read('index.html'), /<title>Consultant en acquisition client B2C \| NexosLocal<\/title>/);
});
