import { CONTACT_EMAIL, parseContactContext, contactCopy, buildContactDraft, directContactHref, copyContactText } from './contact-draft.mjs?v=20261023-1';

(() => {
  const menus = [...document.querySelectorAll('.mobile-menu')];
  const syncMenus = () => document.body.classList.toggle('menu-open', menus.some(menu => menu.open));
  const closeMenus = () => { menus.forEach(menu => { menu.open = false; }); syncMenus(); };
  menus.forEach(menu => {
    menu.addEventListener('toggle', syncMenus);
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenus));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const openMenu = menus.find(menu => menu.open);
      closeMenus();
      openMenu?.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (!menus.some(menu => menu.contains(event.target))) closeMenus();
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', closeMenus);

  const choices = [...document.querySelectorAll('[data-problem]')];
  const panels = [...document.querySelectorAll('.problem-panel')];
  if (choices.length && panels.length) {
    const showProblem = id => {
      panels.forEach(panel => { panel.hidden = panel.id !== id; });
      choices.forEach(choice => {
        const selected = choice.getAttribute('href') === '#' + id;
        choice.classList.toggle('is-active', selected);
        choice.setAttribute('aria-expanded', String(selected));
        choice.setAttribute('aria-controls', choice.hash.slice(1));
      });
    };
    choices.forEach(choice => {
      choice.setAttribute('role', 'button');
      choice.addEventListener('click', event => { event.preventDefault(); showProblem(choice.hash.slice(1)); });
      choice.addEventListener('keydown', event => { if (event.key === ' ') { event.preventDefault(); choice.click(); } });
    });
    const fromHash = () => panels.find(panel => '#' + panel.id === window.location.hash);
    showProblem(fromHash()?.id || panels[0].id);
    window.addEventListener('hashchange', () => { if (fromHash()) showProblem(fromHash().id); });
  }

  const form = document.querySelector('#project-form');
  if (form) {
    form.hidden = false;
    const need = form.elements.need;
    const context = parseContactContext(window.location.search);
    need.value = context.need;
    const preview = document.querySelector('#message-preview');
    const body = document.querySelector('#message-body');
    const status = document.querySelector('#copy-status');
    let draft = '';
    const updateContactCopy = () => {
      const copy = contactCopy(need.value);
      const labels = {
        'contact-breadcrumb': copy.breadcrumb,
        'contact-eyebrow': copy.eyebrow,
        'contact-heading-start': copy.headingStart,
        'contact-heading-end': copy.headingEnd,
        'contact-lead': copy.lead,
        'contact-response': copy.response,
        'contact-form-heading': copy.formHeading,
        'contact-form-intro': copy.formIntro,
        'activity-label-text': copy.activityLabel,
        'website-label-text': copy.websiteLabel,
        'details-label-text': copy.detailsLabel,
        'prepare-message-label': copy.submitLabel,
      };
      for (const [id, text] of Object.entries(labels)) document.getElementById(id).textContent = text;
      form.elements.activity.placeholder = copy.activityPlaceholder;
      form.elements.website.placeholder = copy.websitePlaceholder;
      form.elements.message.placeholder = copy.detailsPlaceholder;
      document.querySelector('#zone-field').hidden = !copy.artisan;
      document.querySelector('#mini-diagnostic-details').hidden = !copy.artisan;
      document.querySelector('#direct-email').href = directContactHref({ need: need.value, origin: context.origin });
      preview.hidden = true;
      form.elements.activity.setCustomValidity('');
    };
    updateContactCopy();
    need.addEventListener('change', updateContactCopy);
    form.addEventListener('input', () => { preview.hidden = true; });
    form.addEventListener('change', () => { preview.hidden = true; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      let prepared;
      try {
        prepared = buildContactDraft({
          activity: form.elements.activity.value,
          zone: form.elements.zone.value,
          website: form.elements.website.value,
          need: need.value,
          details: form.elements.message.value,
          origin: context.origin,
        });
        form.elements.activity.setCustomValidity('');
      } catch (error) {
        form.elements.activity.setCustomValidity(error.message);
      }
      if (!form.reportValidity() || !prepared) return;
      draft = prepared.body;
      body.textContent = draft;
      document.querySelector('#email-draft').href = prepared.emailHref;
      document.querySelector('#whatsapp-draft').href = prepared.whatsappHref;
      status.textContent = '';
      preview.hidden = false;
      preview.focus({ preventScroll: true });
      preview.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    });
    form.elements.activity.addEventListener('input', () => form.elements.activity.setCustomValidity(''));
    document.querySelector('#copy-message').addEventListener('click', async () => {
      status.textContent = (await copyContactText(draft, navigator.clipboard)).message;
    });
    const copyEmail = document.querySelector('#copy-email');
    const emailStatus = document.querySelector('#copy-email-status');
    copyEmail.hidden = false;
    copyEmail.addEventListener('click', async () => {
      emailStatus.textContent = (await copyContactText(CONTACT_EMAIL, navigator.clipboard, 'email')).message;
    });
  }
})();
