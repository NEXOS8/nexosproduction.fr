(() => {
  const navigationQuery = window.matchMedia('(max-width: 899px)');
  const menus = document.querySelectorAll('.mobile-menu');

  const syncMenuState = () => {
    const isOpen = navigationQuery.matches && [...menus].some((menu) => menu.open);
    document.body.classList.toggle('menu-open', isOpen);
  };

  menus.forEach((menu) => {
    menu.addEventListener('toggle', syncMenuState);
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.removeAttribute('open');
        syncMenuState();
      });
    });
  });

  navigationQuery.addEventListener('change', () => {
    if (!navigationQuery.matches) {
      menus.forEach((menu) => menu.removeAttribute('open'));
    }
    syncMenuState();
  });

  const contactMethod = (link) => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('tel:')) return 'telephone';
    if (href.includes('wa.me/')) return 'whatsapp';
    if (href.startsWith('mailto:')) return 'email';
    if (href.split('#')[0] === '/contact') return 'page_contact';
    return null;
  };

  document.querySelectorAll('a[href]').forEach((link) => {
    const method = contactMethod(link);
    if (!method) return;
    link.addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'contact_intent',
        contact_method: method,
        page_path: window.location.pathname
      });
    });
  });
})();
