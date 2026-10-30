(() => {
  'use strict';

  const TAG_ID = 'AW-18542587032';
  const CONTACT_CONVERSION = 'AW-18542587032/RIWUCLLQ-60dEJjZ5YlF';
  const STORAGE_KEY = 'nexoslocal-advertising-consent';
  const CONSENT_DURATION = 180 * 24 * 60 * 60 * 1000;
  const denied = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  };
  let tagRequested = false;
  let measurementConsent = false;
  let consentExpiresAt = 0;

  // Basic consent mode: only this local queue exists before consent.
  // No Google library, request or advertising cookie is created here.
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', denied);
  window.gtag('set', 'ads_data_redaction', true);

  function readChoice() {
    try {
      const record = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (record?.version === 1 && ['granted', 'denied'].includes(record.choice)
        && Number.isFinite(record.expiresAt) && record.expiresAt > Date.now()) {
        consentExpiresAt = record.expiresAt;
        return record.choice;
      }
    } catch {
      // A blocked or unavailable storage must never enable the tag.
    }
    consentExpiresAt = 0;
    return null;
  }

  function saveChoice(choice) {
    consentExpiresAt = Date.now() + CONSENT_DURATION;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1, choice, expiresAt: consentExpiresAt,
      }));
    } catch {
      // The visitor's choice still applies for this page when storage is blocked.
    }
  }

  function clearAdvertisingCookies() {
    try {
      const names = document.cookie.split(';').map(cookie => cookie.trim().split('=')[0])
        .filter(name => /^_(?:gcl|gac)_/.test(name));
      for (const name of names) {
        const expired = `${name}=; Max-Age=0; path=/`;
        document.cookie = expired;
        let domain = window.location.hostname;
        while (domain.includes('.')) {
          document.cookie = `${expired}; domain=${domain}`;
          domain = domain.slice(domain.indexOf('.') + 1);
        }
      }
    } catch {
      // A browser rejecting cookie access must still show a working consent panel.
    }
  }

  function grantMeasurement() {
    measurementConsent = true;
    if (tagRequested) return;
    tagRequested = true;
    window.gtag('consent', 'update', {
      ...denied, ad_storage: 'granted', ad_user_data: 'granted',
    });
    window.gtag('js', new Date());
    window.gtag('config', TAG_ID, { allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${TAG_ID}`;
    document.head.appendChild(script);
  }

  const panel = document.createElement('section');
  panel.className = 'google-consent';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'google-consent-heading');
  panel.innerHTML = `
    <h2 id="google-consent-heading">Nous aider à mesurer nos annonces ?</h2>
    <p>Avec votre accord, Google Ads utilise des cookies publicitaires et des données de navigation
    pour mesurer les résultats des annonces NexosLocal, sans publicité personnalisée.</p>
    <a class="google-consent-details" href="/confidentialite#publicite">Comment fonctionne cette mesure ?</a>
    <div class="google-consent-actions">
      <button type="button" data-ad-consent="granted">Accepter</button>
      <button type="button" data-ad-consent="denied">Refuser</button>
    </div>
    <p class="google-consent-note">Le site reste accessible dans les deux cas.
    Choix modifiable à tout moment via « Gérer les cookies ».</p>`;
  document.body.appendChild(panel);

  const settings = [...document.querySelectorAll('[data-consent-settings]')];
  const refuse = panel.querySelector('[data-ad-consent="denied"]');
  const accept = panel.querySelector('[data-ad-consent="granted"]');
  let returnFocus = null;

  function closePanel() {
    panel.hidden = true;
    if (panel.contains(document.activeElement)) {
      (returnFocus || settings[0])?.focus({ preventScroll: true });
    }
  }

  function choose(choice) {
    measurementConsent = choice === 'granted';
    saveChoice(choice);
    closePanel();
    if (choice === 'granted') {
      grantMeasurement();
    } else {
      clearAdvertisingCookies();
      if (tagRequested) {
        window.gtag('consent', 'update', denied);
        // Reload to unload the previously accepted library, not just deny its cookies.
        window.location.reload();
      }
    }
  }

  refuse.addEventListener('click', () => choose('denied'));
  accept.addEventListener('click', () => choose('granted'));
  settings.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      returnFocus = button;
      panel.hidden = false;
      refuse.focus({ preventScroll: true });
    });
  });

  const initialChoice = readChoice();
  if (initialChoice === 'granted') grantMeasurement();
  else {
    clearAdvertisingCookies();
    panel.hidden = initialChoice === 'denied';
  }

  // Count an explicit contact-link click, never a page view or draft preparation.
  // Delegation also covers links whose message is populated after form preparation.
  document.addEventListener('click', event => {
    if (measurementConsent && consentExpiresAt <= Date.now()) {
      synchronizeChoice();
      return;
    }
    if (!measurementConsent || event.defaultPrevented || (event.button ?? 0) !== 0) return;
    const link = event.target?.closest?.('a[href]');
    if (!link) return;
    let destination;
    try { destination = new URL(link.href, window.location.href); }
    catch { return; }
    const isContact = (destination.protocol === 'mailto:'
      && destination.pathname.toLowerCase() === 'contact@nexoslocal.fr')
      || (destination.protocol === 'tel:'
        && destination.pathname.replace(/[\s().-]/g, '') === '+33631686832')
      || (destination.protocol === 'https:' && destination.hostname === 'wa.me'
        && destination.pathname === '/33631686832');
    if (!isContact) return;
    try {
      // Do not send the link URL: it can contain the visitor's draft message.
      window.gtag('event', 'conversion', { send_to: CONTACT_CONVERSION });
    } catch {
      // Measurement must never prevent opening the visitor's chosen contact app.
    }
    // Keep native navigation, including target=_blank and modifier keys.
  });

  function synchronizeChoice() {
    const choice = readChoice();
    if (choice === 'granted') {
      closePanel();
      grantMeasurement();
    } else {
      measurementConsent = false;
      clearAdvertisingCookies();
      if (tagRequested) {
        window.gtag('consent', 'update', denied);
        window.location.reload();
      } else panel.hidden = choice === 'denied';
    }
  }

  // Apply changes from other tabs and recheck pages restored from the back/forward cache.
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY || event.key === null) synchronizeChoice();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) synchronizeChoice();
  });
})();
