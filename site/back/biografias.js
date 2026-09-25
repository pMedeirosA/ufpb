/* ===================================
   BIOGRAFIAS.JS — catálogo de poetisas
   (busca + filtro por letra + carregar mais)
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
  var PAGE_SIZE = 24;

  var grid = document.querySelector('[data-poetisa-grid]');
  var status = document.querySelector('[data-catalog-status]');
  var count = document.querySelector('[data-catalog-count]');
  var search = document.querySelector('[data-poetisa-search]');
  var filter = document.querySelector('[data-letter-filter]');
  var loadMoreButton = document.querySelector('[data-load-more]');
  var loadMoreWrap = document.querySelector('[data-load-more-wrap]');

  if (!grid) return;

  var url = new URL(window.location.href);
  var selectedLetter = (url.searchParams.get('letra') || '').toUpperCase();
  var allRecords = [];
  var filtered = [];
  var viewCount = 0;
  var debounceTimer;

  if (search) search.value = url.searchParams.get('busca') || '';

  function letterOf(name) {
    var letter = String(name || '').trim().charAt(0)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    return /^[A-Z]$/.test(letter) ? letter : '#';
  }

  function updateUrl() {
    var nextUrl = new URL(window.location.href);
    if (selectedLetter) nextUrl.searchParams.set('letra', selectedLetter);
    else nextUrl.searchParams.delete('letra');
    if (search && search.value.trim()) nextUrl.searchParams.set('busca', search.value.trim());
    else nextUrl.searchParams.delete('busca');
    history.replaceState(null, '', nextUrl);
  }

  function buildLetterFilter() {
    if (!filter) return;
    Acervo.clearElement(filter);

    var allLink = Acervo.createElement('a', {
      text: 'Todos',
      attributes: { href: '#acervo', 'aria-current': selectedLetter ? null : 'true' }
    });
    allLink.addEventListener('click', function (event) {
      event.preventDefault();
      selectedLetter = '';
      buildLetterFilter();
      loadCatalog(true);
    });
    filter.append(allLink);

    for (var code = 65; code <= 90; code += 1) {
      (function (letter) {
        var link = Acervo.createElement('a', {
          text: letter,
          attributes: {
            href: '?letra=' + letter,
            'aria-current': selectedLetter === letter ? 'true' : null
          }
        });
        link.addEventListener('click', function (event) {
          event.preventDefault();
          selectedLetter = letter;
          buildLetterFilter();
          loadCatalog(true);
        });
        filter.append(link);
      })(String.fromCharCode(code));
    }
  }

  function showMessage(title, message) {
    Acervo.clearElement(grid);
    grid.append(Acervo.createEmptyState(title, message));
    if (loadMoreWrap) loadMoreWrap.hidden = true;
  }

  function updateStatus() {
    if (status) {
      var words = filtered.length === 1 ? 'poetisa encontrada' : 'poetisas encontradas';
      status.textContent = filtered.length + ' ' + words + '.';
    }
    if (count) count.textContent = allRecords.length ? 'Total no acervo: ' + allRecords.length : '';
  }

  function applyFilters() {
    var term = (search ? search.value : '').trim().toLowerCase();
    filtered = allRecords.filter(function (record) {
      if (selectedLetter && letterOf(record.name) !== selectedLetter) return false;
      if (term && record.name.toLowerCase().indexOf(term) === -1) return false;
      return true;
    });
    filtered.sort(function (a, b) {
      return a.name.localeCompare(b.name, 'pt-BR');
    });
  }

  function renderVisible() {
    Acervo.clearElement(grid);
    var visible = filtered.slice(0, viewCount);
    grid.append.apply(grid, visible.map(Acervo.createPoetisaCard));

    if (loadMoreWrap) loadMoreWrap.hidden = viewCount >= filtered.length;
  }

  function loadCatalog(reset) {
    updateUrl();
    applyFilters();

    if (!filtered.length) {
      if (reset) Acervo.clearElement(grid);
      showMessage(
        selectedLetter || (search && search.value.trim())
          ? 'Nenhum resultado'
          : 'Acervo em preparação',
        selectedLetter || (search && search.value.trim())
          ? 'Tente outro nome ou remova o filtro de letra.'
          : 'Ainda não há poetisas publicadas no acervo.'
      );
      updateStatus();
      Acervo.mostrarBannerEmPreparacao();
      return;
    }

    viewCount = reset ? PAGE_SIZE : viewCount;
    renderVisible();
    updateStatus();
  }

  if (search) {
    search.addEventListener('input', function () {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(function () { loadCatalog(true); }, 350);
    });
  }

  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', function () {
      viewCount += PAGE_SIZE;
      renderVisible();
      updateStatus();
    });
  }

  buildLetterFilter();

  if (search) grid.replaceChildren.apply(grid, Acervo.createSkeletonCards(6));

  Acervo.loadAll().then(function (records) {
    allRecords = records;
    loadCatalog(true);
  });
});