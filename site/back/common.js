/* ===================================
   COMMON.JS — comportamento compartilhado do site
   (menu mobile + ano no rodapé)
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  updateCurrentYear();
});

function initMobileMenu() {
  var toggle = document.querySelector('.menu-toggle');
  var navigation = document.querySelector('.site-nav');
  if (!toggle || !navigation) return;

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    navigation.dataset.open = 'false';
    document.body.style.removeProperty('overflow');
  }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    navigation.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    else openMenu();
  });

  navigation.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });

  var desktopQuery = window.matchMedia('(min-width: 64.1rem)');
  var handleDesktopChange = function (event) {
    if (event.matches) closeMenu();
  };

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', handleDesktopChange);
  } else {
    desktopQuery.addListener(handleDesktopChange);
  }
}

function updateCurrentYear() {
  document.querySelectorAll('[data-current-year]').forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });
}