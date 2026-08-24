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
})();
