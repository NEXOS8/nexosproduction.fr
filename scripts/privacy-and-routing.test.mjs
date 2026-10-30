import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseContactContext, resolveContactOrigin } from '../assets/contact-draft.mjs';

const root = new URL('../', import.meta.url);
const origin = 'https://www.nexoslocal.fr';
const read = path => readFile(new URL(path, root), 'utf8');
const fromHead = path => execFileSync('git', ['show', `HEAD:${path}`], {
  cwd: fileURLToPath(root), encoding: 'utf8',
});
const htmlFiles = (await readdir(root)).filter(name => name.endsWith('.html')).sort();
const sources = new Map(await Promise.all(htmlFiles.map(async name => [name, await read(name)])));

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/\b([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)]
    .map(([, name, , value]) => [name.toLowerCase(), value.replaceAll('&amp;', '&')]));
}

function canonical(source) {
  const links = [...source.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => attributes(tag)).filter(link => link.rel?.toLowerCase() === 'canonical');
  assert.equal(links.length, 1, 'Une seule URL canonique est attendue');
  return links[0].href;
}

function sitemapEntries(source) {
  const entries = [...source.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/g)].map(([, content]) => {
    const location = content.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const modified = content.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    assert.ok(location && modified, 'Chaque URL possède une localisation et une date');
    return [location, modified];
  });
  const map = new Map(entries);
  assert.equal(map.size, entries.length, 'Aucune URL ne doit être dupliquée dans le sitemap');
  return map;
}

test('Les quinze pages ne chargent aucune balise Google directement, avant le consentement', () => {
  assert.equal(htmlFiles.length, 15);
  const advertising = /googletagmanager\.com|googleadservices\.com|doubleclick\.net|google-analytics\.com|\bGTM-[A-Z0-9]+\b|\bAW-\d+\b|\bgtag\s*\(|\bdataLayer\b|Google\s+Tag\s+Manager|Google\s+(?:Ads|tag)\b/i;
  for (const [file, source] of sources) {
    const blocks = [...source.matchAll(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi)];
    for (const [block] of blocks) {
      if (/^<script\b/i.test(block) && attributes(block).type === 'application/ld+json') continue;
      assert.doesNotMatch(block, advertising, file);
    }
  }
});

test('Les quinze pages proposent le même chargement publicitaire conditionnel et un choix modifiable', async () => {
  for (const [file, source] of sources) {
    const scripts = [...source.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => attributes(tag));
    const consent = scripts.filter(script => script.src?.startsWith('/assets/google-consent.js'));
    assert.equal(consent.length, 1, file);
    assert.equal(consent[0].src, '/assets/google-consent.js?v=20261030-1', file);
    assert.match(source, /<script\b[^>]*\bdefer\b[^>]*google-consent\.js/, file);
    assert.match(source, /<link\b[^>]*href="\/assets\/google-consent\.css\?v=20261028-2"/, file);
    assert.match(source, /<footer\b[\s\S]*<button\b[^>]*data-consent-settings[^>]*>Gérer les cookies<\/button>/, file);
    assert.doesNotMatch(source, /https:\/\/fonts\.(?:googleapis|gstatic)\.com/, file);
    assert.match(source, /href="\/assets\/dm-sans\.css\?v=20261029-1"/, file);
  }
  assert.match(sources.get('confidentialite.html'), /id="publicite"/);
  assert.doesNotMatch(sources.get('confidentialite.html'), /balises Google Ads et Google Tag Manager ont été retirées/);
  assert.match(await read('assets/google-consent.js'), /AW-18542587032/);
});

test('Le script partagé est chargé une fois en module avec sa nouvelle version sur les quinze pages', () => {
  for (const [file, source] of sources) {
    const scripts = [...source.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => attributes(tag));
    const shared = scripts.filter(script => script.src && new URL(script.src, origin).pathname === '/assets/site.js');
    assert.equal(shared.length, 1, file);
    assert.equal(shared[0].type, 'module', file);
    assert.equal(shared[0].src, '/assets/site.js?v=20261023-1', file);
  }
});

test('Les modules de contact préparent seulement les messages, sans suivi ni transmission réseau', async () => {
  const forbidden = /\bdataLayer\b|\bgtag\b|\bfbq\b|googletagmanager|google-analytics|googleadservices|doubleclick|\bcontact_intent\b|\bphone_click\b|\bcontact_draft_prepared\b|\blocalStorage\b|\bsessionStorage\b|\bsendBeacon\b|\bXMLHttpRequest\b|\bfetch\s*\(/i;
  for (const file of ['assets/site.js', 'assets/contact-draft.mjs']) {
    assert.doesNotMatch(await read(file), forbidden, file);
  }
  assert.match(await read('assets/site.js'), /from\s+["']\.\/contact-draft\.mjs\?v=20261023-1["']/);
});

test('Les quatre pages sources utilisent uniquement leur origine autorisée dans les CTA contextualisés', () => {
  const expectedOrigins = new Map([
    ['index.html', 'accueil'],
    ['artisans-batiment.html', 'offre-artisans'],
    ['obtenir-plus-demandes-devis-artisan.html', 'guide-devis'],
    ['referencement-local.html', 'referencement-local'],
  ]);
  for (const [file, expectedOrigin] of expectedOrigins) {
    const links = [...sources.get(file).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
      .map(([, tag, content]) => ({ href: attributes(tag).href, label: content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() }))
      .filter(link => link.href).map(link => ({ ...link, url: new URL(link.href, origin) }))
      .filter(link => link.url.origin === origin && link.url.pathname === '/contact');
    const contextual = links.filter(link => link.url.searchParams.has('origine'));
    assert.ok(contextual.length > 0, `CTA contextualisé absent : ${file}`);
    for (const { url } of contextual) {
      assert.deepEqual(url.searchParams.getAll('origine'), [expectedOrigin], file);
      assert.equal(parseContactContext(url.search).origin, expectedOrigin, file);
    }
    if (file === 'index.html') {
      assert.match(sources.get(file), /id="developper-clientele"/);
      const growthLinks = contextual.filter(link => link.label === 'Parlons de vos objectifs ↗');
      assert.equal(growthLinks.length, 1, 'Un CTA généraliste pour développer la clientèle');
      assert.deepEqual(parseContactContext(growthLinks[0].url.search), { need: 'appels', origin: expectedOrigin });
      assert.doesNotMatch(sources.get(file), /besoin=artisans|Artisan du bâtiment : par quelle priorité commencer/);
    } else {
      const diagnosticLinks = links.filter(link => link.label === 'Demander mon mini-diagnostic offert');
      assert.ok(diagnosticLinks.length > 0, `CTA mini-diagnostic absent : ${file}`);
      for (const { url } of diagnosticLinks) {
        assert.deepEqual(parseContactContext(url.search), { need: 'artisans', origin: expectedOrigin }, file);
      }
    }
    assert.equal(resolveContactOrigin(expectedOrigin), expectedOrigin);
  }
  for (const value of [undefined, '', 'inconnue', 'constructor', '__proto__', 'https://example.org/?email=prive']) {
    assert.equal(resolveContactOrigin(value), null);
  }
});

test('Les routes et URL canoniques existantes sont conservées par rapport à HEAD', async () => {
  const previousFiles = execFileSync('git', ['ls-tree', '--name-only', 'HEAD'], {
    cwd: fileURLToPath(root), encoding: 'utf8',
  }).trim().split('\n').filter(name => name.endsWith('.html')).sort();
  assert.deepEqual(htmlFiles, previousFiles);
  for (const [file, source] of sources) {
    const expected = origin + (file === 'index.html' ? '/' : '/' + file.slice(0, -5));
    assert.equal(canonical(source), canonical(fromHead(file)), file);
    assert.equal(canonical(source), expected, file);
  }
  const currentSitemap = sitemapEntries(await read('sitemap.xml'));
  const previousSitemap = sitemapEntries(fromHead('sitemap.xml'));
  assert.deepEqual([...currentSitemap.keys()].sort(), [...previousSitemap.keys()].sort());
});

test('La politique de confidentialité reçoit un lastmod au 30 octobre et les autres dates sont conservées', async () => {
  const current = sitemapEntries(await read('sitemap.xml'));
  const previous = sitemapEntries(fromHead('sitemap.xml'));
  assert.equal(current.size, 15);
  for (const [url, date] of current) {
    assert.equal(date, url === origin + '/confidentialite' ? '2026-10-30' : previous.get(url), url);
  }
});
