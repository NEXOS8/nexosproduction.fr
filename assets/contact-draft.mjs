export const CONTACT_EMAIL = 'contact@nexoslocal.fr';

export const CONTACT_LIMITS = Object.freeze({ activity: 160, zone: 160, website: 200, details: 1500 });

const needs = Object.freeze({
  artisans: 'Recevoir le mini-diagnostic offert pour mon entreprise du bâtiment',
  appels: 'Obtenir plus d’appels et de prospects',
  audit: 'Comprendre mon acquisition actuelle',
  strategie: 'Définir ma stratégie et mes priorités',
  accompagnement: 'Être accompagné dans la mise en œuvre',
  paid: 'Étudier le rôle du paid dans ma stratégie',
  automatisation: 'Étudier un besoin d’automatisation',
  conversion: 'Analyser les freins à la conversion',
  expertises: 'Cadrer ou coordonner une expertise complémentaire',
});
const aliases = Object.freeze({ local: 'expertises', seo: 'expertises', suivi: 'automatisation' });
const origins = Object.freeze({
  accueil: 'Accueil NexosLocal',
  'offre-artisans': 'Offre artisans NexosLocal',
  'guide-devis': 'Guide demandes de devis NexosLocal',
  'referencement-local': 'Page référencement local NexosLocal',
});

export function resolveContactNeed(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  const candidate = Object.hasOwn(aliases, raw) ? aliases[raw] : raw;
  return Object.hasOwn(needs, candidate) ? candidate : 'appels';
}

export function resolveContactOrigin(value) {
  const candidate = typeof value === 'string' ? value.trim() : '';
  return Object.hasOwn(origins, candidate) ? candidate : null;
}

export function parseContactContext(search = '') {
  const parameters = new URLSearchParams(search);
  return {
    need: resolveContactNeed(parameters.get('besoin')),
    origin: resolveContactOrigin(parameters.get('origine')),
  };
}

// Only plain text enters a draft. Single-line fields cannot add mail headers.
export function normaliseContactField(value, limit, multiline = false) {
  const wellFormed = text => Array.from(text, character => {
    const code = character.charCodeAt(0);
    return character.length === 1 && code >= 0xd800 && code <= 0xdfff ? '\ufffd' : character;
  }).join('');
  const text = wellFormed(String(value ?? ''))
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  const cleaned = multiline ? text : text.replace(/\s+/g, ' ');
  return wellFormed(cleaned.trim().slice(0, limit));
}

export function contactCopy(value) {
  if (resolveContactNeed(value) === 'artisans') {
    return {
      artisan: true,
      breadcrumb: 'Mini-diagnostic pour artisans',
      eyebrow: 'Mini-diagnostic offert · Sans engagement',
      headingStart: 'Trois priorités pour',
      headingEnd: 'vos demandes de devis.',
      lead: 'Présentez votre métier, votre zone et votre site ou fiche Google si vous en avez. Vous recevrez un retour manuel avec trois priorités adaptées à votre présence actuelle.',
      response: 'Un retour manuel, généralement sous deux jours ouvrés.',
      formHeading: 'Présentez votre entreprise artisanale',
      formIntro: 'Préparez votre demande de mini-diagnostic, puis envoyez-la avec votre propre messagerie.',
      activityLabel: 'Votre métier',
      activityPlaceholder: 'Ex. rénovation de salles de bain',
      websiteLabel: 'Votre site ou votre fiche Google',
      websitePlaceholder: 'Adresse de votre site ou lien vers votre fiche Google',
      detailsLabel: 'Votre objectif',
      detailsPlaceholder: 'Ex. recevoir plus de demandes de rénovation dans ma zone…',
      submitLabel: 'Préparer ma demande de mini-diagnostic',
    };
  }
  return {
    artisan: false,
    breadcrumb: 'Parlons de votre acquisition B2C',
    eyebrow: 'Premier échange · Sans engagement',
    headingStart: 'Échangeons sur',
    headingEnd: 'votre acquisition.',
    lead: 'Votre activité B2C, le nombre de demandes que vous recevez et votre objectif. Le premier échange permet d’identifier la décision d’acquisition la plus utile.',
    response: 'Une réponse directe, généralement sous deux jours ouvrés.',
    formHeading: 'Quel est votre objectif ?',
    formIntro: 'Préparez votre message, puis choisissez votre messagerie pour l’envoyer.',
    activityLabel: 'Votre activité',
    activityPlaceholder: 'Ex. entreprise de rénovation à Lyon',
    websiteLabel: 'Votre site web',
    websitePlaceholder: 'votre-entreprise.fr',
    detailsLabel: 'Quelques précisions',
    detailsPlaceholder: 'Votre volume actuel, votre objectif, les canaux déjà utilisés…',
    submitLabel: 'Préparer mon message',
  };
}

export function buildContactDraft(values = {}) {
  const need = resolveContactNeed(values.need);
  const origin = resolveContactOrigin(values.origin);
  const originLabel = origin ? origins[origin] : 'Inconnue';
  const activity = normaliseContactField(values.activity, CONTACT_LIMITS.activity);
  if (!activity) throw new Error(need === 'artisans' ? 'Indiquez votre métier.' : 'Indiquez votre activité.');
  const zone = normaliseContactField(values.zone, CONTACT_LIMITS.zone);
  const website = normaliseContactField(values.website, CONTACT_LIMITS.website);
  const details = normaliseContactField(values.details, CONTACT_LIMITS.details, true);
  const artisan = need === 'artisans';
  const lines = ['Bonjour,', ''];
  if (artisan) lines.push('Je souhaite recevoir le mini-diagnostic offert : trois priorités pour développer les demandes de devis de mon entreprise du bâtiment.', '');
  lines.push(`${artisan ? 'Mon métier' : 'Mon activité'} : ${activity}`);
  if (artisan && zone) lines.push(`Ma zone d’intervention : ${zone}`);
  if (website) lines.push(`${artisan ? 'Mon site ou ma fiche Google' : 'Mon site'} : ${website}`);
  if (!artisan) lines.push(`Ma priorité : ${needs[need]}`);
  if (details) lines.push('', artisan ? `Mon objectif : ${details}` : details);
  lines.push('', `Origine du parcours : ${originLabel}`, '', artisan ? 'Merci pour votre retour !' : 'Pouvons-nous en discuter ?\n\nMerci !');
  const body = lines.join('\n');
  const subject = `${artisan ? 'Mini-diagnostic artisan' : 'Parlons de mon projet'} — ${activity} [Origine : ${originLabel}]`;
  return {
    need, origin, subject, body,
    emailHref: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    whatsappHref: `https://wa.me/33631686832?text=${encodeURIComponent(body)}`,
  };
}

export function directContactHref({ need, origin } = {}) {
  const artisan = resolveContactNeed(need) === 'artisans';
  const knownOrigin = resolveContactOrigin(origin);
  const originLabel = knownOrigin ? origins[knownOrigin] : 'Inconnue';
  const subject = `${artisan ? 'Mini-diagnostic artisan' : 'Depuis NexosLocal — mon projet'} [Origine : ${originLabel}]`;
  const body = artisan
    ? `Bonjour,\n\nJe souhaite recevoir le mini-diagnostic offert : trois priorités pour développer mes demandes de devis.\n\nMon métier :\nMa zone d’intervention (facultatif) :\nMon site ou ma fiche Google (facultatif) :\nMon objectif (facultatif) :\n\nOrigine du parcours : ${originLabel}\n\nMerci !`
    : `Bonjour,\n\nJe souhaite échanger sur mon acquisition de clients.\n\nMon activité :\nMon site :\nCe que je souhaite améliorer :\n\nOrigine du parcours : ${originLabel}\n\nPouvons-nous en discuter ?\n\nMerci !`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// The caller supplies the browser clipboard; absence or refusal remains usable.
export async function copyContactText(text, clipboard, kind = 'message') {
  try {
    if (!clipboard?.writeText) throw new Error('Clipboard unavailable');
    await clipboard.writeText(text);
    return { ok: true, message: kind === 'email'
      ? 'Adresse copiée. Collez-la dans le destinataire de votre messagerie.'
      : 'Message copié. Vous pouvez le coller dans un e-mail à contact@nexoslocal.fr.' };
  } catch {
    return { ok: false, message: kind === 'email'
      ? 'Copie indisponible. Sélectionnez et copiez l’adresse affichée : contact@nexoslocal.fr.'
      : 'Sélectionnez le message ci-dessus pour le copier, puis écrivez à contact@nexoslocal.fr.' };
  }
}
