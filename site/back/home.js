/* ===================================
   HOME.JS — destaques do acervo (página inicial)
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
  var container = document.querySelector('[data-featured-poetisas]');
  var status = document.querySelector('[data-featured-status]');
  if (!container) return;

  container.replaceChildren.apply(container, Acervo.createSkeletonCards(3));
  if (status) status.textContent = 'Carregando destaques do acervo.';

  Acervo.loadAll().then(function (records) {
    if (!records.length) {
      container.replaceChildren(Acervo.createEmptyState(
        'Acervo em preparação',
        'Novos registros serão publicados em breve.'
      ));
      if (status) status.textContent = 'O acervo está em preparação.';
      Acervo.mostrarBannerEmPreparacao();
      return;
    }

    var featured = records.slice(0, 3);
    container.replaceChildren.apply(container, featured.map(Acervo.createPoetisaCard));
    if (status) {
      status.textContent = featured.length + ' destaque' + (featured.length === 1 ? '' : 's') + ' do acervo.';
    }
  });
});