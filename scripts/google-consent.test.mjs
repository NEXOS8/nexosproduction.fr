import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../assets/google-consent.js', import.meta.url), 'utf8');
const key = 'nexoslocal-advertising-consent';
const denied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
const record = (choice, expiresAt = Date.now() + 60_000) => JSON.stringify({ version: 1, choice, expiresAt });

// A minimal browser boundary records script requests without contacting Google.
function browser({ stored = null, storageBlocked = false, cookiesBlocked = false, initialCookies = '' } = {}) {
  const events = new Map();
  const requests = [];
  const saved = new Map(stored === null ? [] : [[key, stored]]);
  const cookies = new Map(initialCookies.split(';').map(part => part.trim().split('='))
    .filter(([name]) => name));
  let reloads = 0;
  let now = Date.now();
  class BrowserDate extends Date { static now() { return now; } }
  let document;
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.hidden = false; this.handlers = new Map(); }
    setAttribute(name, value) { this[name] = value; }
    appendChild(child) { this.children.push(child); if (child.src) requests.push(child.src); return child; }
    addEventListener(name, handler) { this.handlers.set(name, handler); }
    querySelector(selector) {
      if (!this.controls) this.controls = new Map();
      if (!this.controls.has(selector)) {
        const control = new Element('button');
        this.controls.set(selector, control);
        this.children.push(control);
      }
      return this.controls.get(selector);
    }
    focus() { document.activeElement = this; }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    click() { this.focus(); this.handlers.get('click')?.(); }
  }
  const settings = new Element('button');
  settings.hidden = true;
  document = {
    head: new Element('head'), body: new Element('body'), activeElement: null,
    createElement: tag => new Element(tag),
    addEventListener: (name, handler) => events.set('document:' + name, handler),
    querySelectorAll: selector => selector === '[data-consent-settings]' ? [settings] : [],
    get cookie() {
      if (cookiesBlocked) throw new Error('Cookies blocked');
      return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
    },
    set cookie(value) {
      if (cookiesBlocked) throw new Error('Cookies blocked');
      const [name, data] = value.split(';')[0].split('=');
      if (/Max-Age=0/i.test(value)) cookies.delete(name);
      else cookies.set(name, data);
    },
  };
  document.activeElement = document.body;
  const window = {
    localStorage: {
      getItem(name) { if (storageBlocked) throw new Error('Storage blocked'); return saved.get(name) ?? null; },
      setItem(name, value) { if (storageBlocked) throw new Error('Storage blocked'); saved.set(name, value); },
    },
    location: { href: 'https://www.nexoslocal.fr/contact', hostname: 'www.nexoslocal.fr', reload() { reloads++; } },
    addEventListener: (name, handler) => events.set(name, handler),
  };
  runInNewContext(source, { window, document, URL, Date: BrowserDate });
  const panel = document.body.children[0];
  return {
    window, document, panel, settings, requests, saved,
    accept: () => panel.querySelector('[data-ad-consent="granted"]').click(),
    refuse: () => panel.querySelector('[data-ad-consent="denied"]').click(),
    commands: () => Array.from(window.dataLayer, args => JSON.parse(JSON.stringify([...args]))),
    reloads: () => reloads,
    storageEvent: event => events.get('storage')(event),
    restorePage: () => events.get('pageshow')?.({ persisted: true }),
    advanceTime: milliseconds => { now += milliseconds; },
    contactClick(href, options = {}) {
      const event = {
        target: { closest: () => href === null ? null : { href } },
        button: 0, defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; },
        ...options,
      };
      events.get('document:click')(event);
      return event;
    },
  };
}

test('Une première visite ne contacte pas Google et attend un choix explicite', () => {
  const page = browser();
  assert.deepEqual(page.requests, []);
  assert.equal(page.panel.hidden, false);
  assert.equal(page.settings.hidden, false);
  assert.deepEqual(page.commands()[0], ['consent', 'default', denied]);
  assert.equal(page.commands().some(command => command[0] === 'config'), false);
  assert.equal(page.saved.size, 0);
});

test('Le refus est mémorisé et retire les anciens cookies publicitaires sans toucher aux autres', () => {
  const page = browser({ initialCookies: '_gcl_aw=ancien; _gac_test=ancien; session=utile' });
  page.refuse();
  assert.deepEqual(page.requests, []);
  assert.equal(page.panel.hidden, true);
  assert.equal(JSON.parse(page.saved.get(key)).choice, 'denied');
  assert.equal(page.document.cookie, 'session=utile');
  assert.equal(page.reloads(), 0);
  const followingPage = browser({ stored: page.saved.get(key) });
  assert.equal(followingPage.panel.hidden, true);
  assert.deepEqual(followingPage.requests, []);
});

test('L’acceptation charge une seule fois le bon compte, avec mesure autorisée et personnalisation désactivée', () => {
  const page = browser();
  page.accept();
  page.settings.click();
  page.accept();
  assert.deepEqual(page.requests, ['https://www.googletagmanager.com/gtag/js?id=AW-18542587032']);
  const commands = page.commands();
  assert.deepEqual(commands.find(command => command[0] === 'config'),
    ['config', 'AW-18542587032', { allow_ad_personalization_signals: false }]);
  assert.deepEqual(commands.find(command => command[1] === 'update'),
    ['consent', 'update', { ...denied, ad_storage: 'granted', ad_user_data: 'granted' }]);
  assert.equal(commands.filter(command => command[0] === 'config').length, 1);
  assert.equal(commands.some(command => command[0] === 'event'), false, 'Aucune visite ou intention n’est inventée comme conversion');
  const stored = JSON.parse(page.saved.get(key));
  assert.equal(stored.choice, 'granted');
  assert.ok(Math.abs(stored.expiresAt - Date.now() - 180 * 24 * 60 * 60 * 1000) < 1000);
});

test('Un accord valide est appliqué à la page suivante, mais un choix expiré ou invalide ne charge rien', () => {
  const allowed = browser({ stored: record('granted') });
  assert.equal(allowed.requests.length, 1);
  assert.equal(allowed.panel.hidden, true);
  for (const stored of [record('granted', Date.now() - 1), '{', 'null', record('autre'),
    JSON.stringify({ version: 0, choice: 'granted', expiresAt: Date.now() + 60_000 })]) {
    const page = browser({ stored });
    assert.deepEqual(page.requests, []);
    assert.equal(page.panel.hidden, false);
  }
});

test('Retirer un accord bloque les pages suivantes et recharge pour arrêter la bibliothèque déjà chargée', () => {
  const page = browser({ stored: record('granted'), initialCookies: '_gcl_au=ancien; session=utile' });
  page.settings.click();
  assert.equal(page.panel.hidden, false);
  page.refuse();
  assert.equal(page.reloads(), 1);
  assert.deepEqual(page.commands().at(-1), ['consent', 'update', denied]);
  assert.equal(JSON.parse(page.saved.get(key)).choice, 'denied');
  assert.equal(page.document.cookie, 'session=utile');
  assert.deepEqual(browser({ stored: page.saved.get(key) }).requests, []);
});

test('Le stockage bloqué ne casse pas le site et ne vaut jamais consentement implicite', () => {
  const page = browser({ storageBlocked: true });
  assert.deepEqual(page.requests, []);
  page.refuse();
  assert.equal(page.panel.hidden, true);
  page.settings.click();
  page.accept();
  assert.equal(page.requests.length, 1);
  assert.equal(page.saved.size, 0);
});

test('Un retrait depuis un autre onglet arrête également le suivi de la page ouverte', () => {
  const page = browser({ stored: record('granted') });
  page.saved.set(key, record('denied'));
  page.storageEvent({ key });
  assert.equal(page.reloads(), 1);
  assert.deepEqual(page.commands().at(-1), ['consent', 'update', denied]);
});

const contactLinks = [
  'tel:+33631686832',
  'mailto:contact@nexoslocal.fr?subject=Projet&body=Message%20confidentiel',
  'https://wa.me/33631686832?text=Message%20confidentiel',
];

test('Aucun clic de contact n’est mesuré sans accord, après refus ou après retrait', () => {
  for (const stored of [null, record('denied'), record('granted', Date.now() - 1)]) {
    const page = browser({ stored });
    for (const href of contactLinks) assert.equal(page.contactClick(href).defaultPrevented, false);
    assert.equal(page.commands().some(command => command[0] === 'event'), false);
  }
  const page = browser();
  page.accept();
  page.refuse();
  page.contactClick(contactLinks[0]);
  assert.equal(page.commands().some(command => command[0] === 'event'), false);
  const crossTab = browser({ stored: record('granted') });
  crossTab.saved.set(key, record('denied'));
  crossTab.storageEvent({ key });
  crossTab.contactClick(contactLinks[0]);
  assert.equal(crossTab.commands().some(command => command[0] === 'event'), false);
});

test('Chaque canal envoie le libellé fourni, sans contenu du message, et conserve la navigation native', () => {
  for (const href of contactLinks) {
    const page = browser();
    page.accept();
    const click = page.contactClick(href, { ctrlKey: true });
    assert.equal(click.defaultPrevented, false);
    const conversions = page.commands().filter(command => command[0] === 'event');
    assert.deepEqual(conversions, [['event', 'conversion', {
      send_to: 'AW-18542587032/RIWUCLLQ-60dEJjZ5YlF',
    }]]);
  }
  const allowed = browser({ stored: record('granted') });
  allowed.contactClick(contactLinks[1]);
  assert.equal(allowed.commands().filter(command => command[0] === 'event').length, 1);
});

test('Les pages, boutons de préparation/copie, destinataires tiers et clics annulés ne sont pas des contacts', () => {
  const page = browser({ stored: record('granted') });
  for (const href of [null, '/contact', '#message-preview', 'mailto:autre@example.com',
    'tel:+33123456789', 'https://wa.me/33123456789',
    'https://wa.me.example.com/33631686832', 'javascript:alert(1)']) page.contactClick(href);
  page.contactClick(contactLinks[0], { defaultPrevented: true });
  page.contactClick(contactLinks[0], { button: 2 });
  assert.equal(page.commands().some(command => command[0] === 'event'), false);
});

test('Une bibliothèque de mesure défaillante ne bloque pas le lien de contact', () => {
  const page = browser({ stored: record('granted') });
  page.window.gtag = () => { throw new Error('Tag blocked'); };
  assert.equal(page.contactClick(contactLinks[1]).defaultPrevented, false);
});

test('Un navigateur bloquant aussi les cookies laisse la bannière et le refus utilisables', () => {
  const page = browser({ storageBlocked: true, cookiesBlocked: true });
  assert.equal(page.panel.hidden, false);
  page.refuse();
  assert.equal(page.panel.hidden, true);
  assert.deepEqual(page.requests, []);
});

test('Une page restaurée depuis l’historique applique le refus intervenu pendant son gel', () => {
  const page = browser({ stored: record('granted') });
  page.saved.set(key, record('denied'));
  page.restorePage();
  page.contactClick(contactLinks[0]);
  assert.equal(page.reloads(), 1);
  assert.equal(page.commands().some(command => command[0] === 'event'), false);
});

test('Un consentement expirant pendant une page ouverte ne permet plus de compter un clic', () => {
  const page = browser({ stored: record('granted') });
  page.advanceTime(120_000);
  page.contactClick(contactLinks[0]);
  assert.equal(page.commands().some(command => command[0] === 'event'), false);
  assert.equal(page.reloads(), 1);
});
