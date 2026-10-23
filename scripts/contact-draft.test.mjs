import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import {
  CONTACT_EMAIL, CONTACT_LIMITS, parseContactContext, resolveContactNeed,
  contactCopy, normaliseContactField, buildContactDraft, directContactHref, copyContactText,
} from '../assets/contact-draft.mjs';

const root = new URL('../', import.meta.url);

test('Les paramètres absents ou inconnus conservent le contact B2C, sans origine déduite', () => {
  assert.deepEqual(parseContactContext(), { need: 'appels', origin: null });
  for (const query of ['?besoin=inconnu&origine=ailleurs', '?besoin=constructor&origine=__proto__']) {
    assert.deepEqual(parseContactContext(query), { need: 'appels', origin: null });
  }
  assert.deepEqual(parseContactContext('?besoin=%20artisans%20&origine=%20guide-devis%20'), { need: 'artisans', origin: 'guide-devis' });
  assert.equal(resolveContactNeed('seo'), 'expertises');
  assert.equal(resolveContactNeed('suivi'), 'automatisation');
});

test('Les quatre origines autorisées ne se retrouvent que dans le brouillon, avec inconnue par défaut', () => {
  for (const origin of ['accueil', 'offre-artisans', 'guide-devis', 'referencement-local']) {
    const prepared = buildContactDraft({ activity: 'Peinture', need: 'artisans', origin });
    assert.equal(prepared.origin, origin);
    assert.match(prepared.subject, /\[Origine : /);
    assert.match(prepared.body, /Origine du parcours : /);
    assert.doesNotMatch(prepared.subject + prepared.body, /Inconnue/);
  }
  const unknown = buildContactDraft({ activity: 'Peinture', origin: 'https://evil.example/?email=private' });
  assert.match(unknown.subject, /Origine : Inconnue/);
  assert.match(unknown.body, /Origine du parcours : Inconnue/);
  assert.doesNotMatch(unknown.subject + unknown.body, /evil\.example|private/);
});

test('Le métier est requis, les autres informations artisan restent facultatives', () => {
  for (const activity of ['', '  \t\n ', '\u0000\u0007']) {
    assert.throws(() => buildContactDraft({ need: 'artisans', activity }), /Indiquez votre métier/);
  }
  const prepared = buildContactDraft({ need: 'artisans', activity: '  Électricité générale  ' });
  assert.match(prepared.body, /Mon métier : Électricité générale/);
  assert.match(prepared.body, /mini-diagnostic offert : trois priorités/);
  assert.doesNotMatch(prepared.body, /Ma zone|Mon site|Mon objectif/);
  assert.match(contactCopy('artisans').response, /deux jours ouvrés/);
  assert.match(contactCopy('artisans').headingEnd, /devis/);
  assert.equal(contactCopy('appels').headingEnd, 'votre acquisition.');
  assert.equal(contactCopy('inconnu').artisan, false);
});

test('Accents, caractères malveillants et retours ligne restent du texte dans des URL encodées', () => {
  const activity = 'Rénovation <img src=x onerror=alert(1)> & associés\r\nBcc:intrus@example.com';
  const prepared = buildContactDraft({
    need: 'artisans', activity, zone: 'Lyon & 30 km',
    website: 'javascript:alert("ne pas exécuter")',
    details: 'Salle de bain\n<script>alert("test")</script>', origin: 'guide-devis',
  });
  assert.doesNotMatch(prepared.subject, /[\r\n]/);
  const mail = new URL(prepared.emailHref);
  assert.equal(mail.protocol, 'mailto:');
  assert.equal(mail.pathname, CONTACT_EMAIL);
  assert.deepEqual([...mail.searchParams.keys()], ['subject', 'body']);
  assert.equal(mail.searchParams.get('subject'), prepared.subject);
  assert.equal(mail.searchParams.get('body'), prepared.body);
  assert.match(prepared.body, /<img src=x onerror=alert\(1\)>/);
  assert.match(prepared.body, /<script>/);
  const whatsapp = new URL(prepared.whatsappHref);
  assert.equal(whatsapp.origin, 'https://wa.me');
  assert.deepEqual([...whatsapp.searchParams.keys()], ['text']);
  assert.equal(whatsapp.searchParams.get('text'), prepared.body);
});

test('Les limites HTML et les bornes du générateur concordent, sans URIError Unicode', async () => {
  const source = await readFile(new URL('contact.html', root), 'utf8');
  for (const [name, length] of Object.entries(CONTACT_LIMITS)) {
    const htmlName = name === 'details' ? 'message' : name;
    assert.match(source, new RegExp(`name="${htmlName}"[^>]*maxlength="${length}"`));
    assert.equal(normaliseContactField('x'.repeat(length + 40), length).length, length);
  }
  assert.doesNotThrow(() => buildContactDraft({ activity: 'x'.repeat(159) + '\ud83d\ude00', details: '\ud800' }));
  const text = normaliseContactField('a\r\nb\tc', 100, true);
  assert.equal(text, 'a\nb\tc');
});

test('Le lien e-mail direct respecte le contexte et garde une origine inconnue explicite', () => {
  const artisan = new URL(directContactHref({ need: 'artisans', origin: 'offre-artisans' }));
  assert.match(artisan.searchParams.get('subject'), /Mini-diagnostic artisan/);
  assert.match(artisan.searchParams.get('body'), /Mon métier/);
  assert.match(artisan.searchParams.get('body'), /Offre artisans NexosLocal/);
  const general = new URL(directContactHref({ need: 'inconnu', origin: 'https://example.com' }));
  assert.match(general.searchParams.get('body'), /Mon activité/);
  assert.match(general.searchParams.get('body'), /Origine du parcours : Inconnue/);
});

test('Copie message et adresse : succès, refus et presse-papiers absent restent explicites', async () => {
  const copied = [];
  const clipboard = { writeText: async text => copied.push(text) };
  assert.equal((await copyContactText('TEST — aucun envoi', clipboard)).ok, true);
  assert.equal((await copyContactText(CONTACT_EMAIL, clipboard, 'email')).ok, true);
  assert.deepEqual(copied, ['TEST — aucun envoi', CONTACT_EMAIL]);
  for (const denied of [undefined, { writeText: async () => { throw new Error('NotAllowedError'); } }]) {
    const message = await copyContactText('TEST', denied);
    const address = await copyContactText(CONTACT_EMAIL, denied, 'email');
    assert.equal(message.ok, false);
    assert.match(message.message, /Sélectionnez le message/);
    assert.equal(address.ok, false);
    assert.match(address.message, /Sélectionnez et copiez l’adresse affichée/);
  }
});

test('Le contact sans JavaScript garde une adresse et un secours sans collecte cachée', async () => {
  const source = await readFile(new URL('contact.html', root), 'utf8');
  assert.match(source, /id="direct-email" href="mailto:contact@nexoslocal\.fr"/);
  assert.match(source, /id="copy-email" type="button" hidden/);
  assert.match(source, /Si aucune messagerie ne s’ouvre, copiez l’adresse affichée/);
  assert.match(source, /<noscript><p>Pour démarrer la discussion, écrivez directement à/);
  assert.match(source, /Rien n’a été envoyé/);
  assert.doesNotMatch(source, /<form[^>]+action=/);
  const script = await readFile(new URL('assets/site.js', root), 'utf8');
  assert.doesNotMatch(script, /dataLayer|contact_intent|phone_click|contact_draft_prepared|localStorage|sessionStorage|fetch\(|XMLHttpRequest|\.innerHTML/);
});

test('Le branchement DOM affiche les saisies comme texte et met à jour le contexte quand le choix change', async () => {
  const source = await readFile(new URL('assets/site.js', root), 'utf8');
  const nodes = new Map();
  let forbiddenHtmlWrites = 0;
  const element = (id, value = '') => {
    const node = {
      id, value, textContent: '', hidden: false, href: '', placeholder: '', validityMessage: '',
      listeners: new Map(),
      addEventListener(type, listener) { this.listeners.set(type, listener); },
      setCustomValidity(message) { this.validityMessage = message; },
      focus() {}, scrollIntoView() {},
      set innerHTML(value) { forbiddenHtmlWrites++; throw new Error('HTML interpolation forbidden: ' + value); },
    };
    nodes.set(id, node);
    return node;
  };
  const fields = Object.fromEntries(['activity', 'zone', 'website', 'need', 'message'].map(id => [id, element(id)]));
  const form = element('project-form');
  form.elements = fields;
  form.reportValidity = () => !fields.activity.validityMessage;
  const named = ['message-preview', 'message-body', 'copy-status', 'zone-field', 'mini-diagnostic-details', 'direct-email', 'email-draft', 'whatsapp-draft', 'copy-message', 'copy-email', 'copy-email-status'];
  named.forEach(id => element(id));
  const document = {
    body: { classList: { toggle() {} } },
    querySelectorAll: () => [],
    querySelector: selector => nodes.get(selector.slice(1)),
    getElementById: id => nodes.get(id) || element(id),
    addEventListener() {},
  };
  const clipboard = { writeText: async () => { throw new Error('NotAllowedError'); } };
  const sandbox = {
    document, navigator: { clipboard },
    window: { location: { search: '?besoin=artisans&origine=guide-devis', hash: '' }, matchMedia: () => ({ addEventListener() {} }) },
    CONTACT_EMAIL, parseContactContext, contactCopy, buildContactDraft, directContactHref, copyContactText,
  };
  vm.runInNewContext(source.replace(/^import[^\n]+\n/, ''), sandbox);
  assert.equal(fields.need.value, 'artisans');
  assert.equal(nodes.get('zone-field').hidden, false);
  assert.match(nodes.get('contact-lead').textContent, /retour manuel/);
  fields.activity.value = 'TEST <img src=x onerror=alert(1)> Électricité';
  fields.zone.value = 'TEST Lyon';
  form.listeners.get('submit')({ preventDefault() {} });
  assert.match(nodes.get('message-body').textContent, /<img src=x onerror=alert\(1\)>/);
  assert.equal(forbiddenHtmlWrites, 0);
  assert.equal(nodes.get('message-preview').hidden, false);
  assert.match(new URL(nodes.get('email-draft').href).searchParams.get('subject'), /Guide demandes de devis/);
  await nodes.get('copy-message').listeners.get('click')();
  assert.match(nodes.get('copy-status').textContent, /Sélectionnez le message/);
  await nodes.get('copy-email').listeners.get('click')();
  assert.match(nodes.get('copy-email-status').textContent, /Copie indisponible/);
  fields.need.value = 'appels';
  fields.need.listeners.get('change')();
  assert.equal(nodes.get('zone-field').hidden, true);
  assert.equal(nodes.get('mini-diagnostic-details').hidden, true);
  assert.equal(nodes.get('contact-heading-end').textContent, 'votre acquisition.');
  assert.equal(nodes.get('message-preview').hidden, true);
  form.listeners.get('submit')({ preventDefault() {} });
  assert.match(nodes.get('message-body').textContent, /Mon activité/);
  assert.doesNotMatch(nodes.get('message-body').textContent, /TEST Lyon|mini-diagnostic/);
});
