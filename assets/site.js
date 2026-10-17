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

  // Clicks and drafts are intentions, never received or qualified leads.
  const track = (event, properties = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, page_path: window.location.pathname, ...properties });
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    let method;
    if (href.startsWith('tel:')) method = 'telephone';
    else if (href.includes('wa.me/')) method = 'whatsapp';
    else if (href.startsWith('mailto:')) method = 'email';
    else if (/^\/contact(?:[?#]|$)/.test(href)) method = 'page_contact';
    if (method) {
      track('contact_intent', { contact_method: method });
      if (method === 'telephone') track('phone_click');
    }
  });

  const form = document.querySelector('#project-form');
  if (form) {
    form.hidden = false;
    const need = form.elements.need;
    const rawNeed = new URLSearchParams(window.location.search).get('besoin');
    const requestedNeed = ({local: 'expertises', seo: 'expertises', suivi: 'automatisation'})[rawNeed] || rawNeed;
    if ([...need.options].some(option => option.value === requestedNeed)) need.value = requestedNeed;
    const preview = document.querySelector('#message-preview');
    const body = document.querySelector('#message-body');
    const status = document.querySelector('#copy-status');
    let draft = '';
    form.addEventListener('input', () => { preview.hidden = true; });
    form.addEventListener('change', () => { preview.hidden = true; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const activity = form.elements.activity.value.trim();
      form.elements.activity.setCustomValidity(activity ? '' : 'Indiquez votre activité.');
      if (!form.reportValidity()) return;
      const website = form.elements.website.value.trim();
      const details = form.elements.message.value.trim();
      draft = `Bonjour Théo,\n\nMon activité : ${activity}\n${website ? `Mon site : ${website}\n` : ''}Ma priorité : ${need.selectedOptions[0].textContent}\n${details ? `\n${details}\n` : ''}\nPouvons-nous en discuter ?\n\nMerci !`;
      body.textContent = draft;
      document.querySelector('#email-draft').href = 'mailto:contact@nexoslocal.fr?subject=' + encodeURIComponent('Parlons de mon projet — ' + activity) + '&body=' + encodeURIComponent(draft);
      document.querySelector('#whatsapp-draft').href = 'https://wa.me/33631686832?text=' + encodeURIComponent(draft);
      status.textContent = '';
      preview.hidden = false;
      preview.focus({ preventScroll: true });
      preview.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      track('contact_draft_prepared', { contact_need: need.value });
    });
    form.elements.activity.addEventListener('input', () => form.elements.activity.setCustomValidity(''));
    document.querySelector('#copy-message').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(draft);
        status.textContent = 'Message copié. Vous pouvez le coller dans un e-mail à contact@nexoslocal.fr.';
      } catch {
        status.textContent = 'Sélectionnez le message ci-dessus pour le copier, puis écrivez à contact@nexoslocal.fr.';
      }
    });
  }
})();
