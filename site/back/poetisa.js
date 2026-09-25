/* ===================================
   POETISA.JS — perfil individual de uma poetisa
   (capa, biografia, obras, vídeo e lightbox)
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('[data-profile-header]');
  var worksSection = document.querySelector('[data-works-section]');
  var worksGallery = document.querySelector('[data-works-gallery]');
  var worksCount = document.querySelector('[data-works-count]');
  var loader = document.querySelector('[data-profile-loader]');

  var lightbox = document.querySelector('[data-lightbox]');
  var lightboxImage = document.querySelector('[data-lightbox-image]');
  var lightboxTitle = document.querySelector('[data-lightbox-title]');
  var lightboxClose = document.querySelector('[data-lightbox-close]');

  if (!header) return;

  var params = new URL(window.location.href).searchParams;
  var slug = params.get('slug') || '';

  if (loader) loader.textContent = 'Carregando o perfil.';

  Acervo.getBySlug(slug).then(function (record) {
    if (loader) loader.remove();
    if (!record) {
      showError('Poetisa não encontrada', 'Este perfil não existe no acervo.');
      return;
    }
    document.title = record.name + ' — Memórias da Poesia Popular';
    renderProfile(record);
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', function () { if (lightbox) lightbox.close(); });
  }
  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) lightbox.close();
    });
  }

  function showError(title, message) {
    Acervo.clearElement(header);
    var panel = Acervo.createElement('div', { className: 'state-panel' });
    var content = Acervo.createElement('div', { className: 'state-panel__inner' });
    var backButton = Acervo.createElement('a', {
      className: 'button',
      text: 'Voltar ao acervo',
      attributes: { href: 'biografias.html' }
    });
    content.append(
      Acervo.createElement('h1', { text: title }),
      Acervo.createElement('p', { text: message }),
      backButton
    );
    panel.append(content);
    header.append(panel);
    if (worksSection) worksSection.hidden = true;
  }

  function renderPortrait(record) {
    var portrait = Acervo.createElement('div', { className: 'profile-portrait' });
    var frame = Acervo.createElement('div', { className: 'profile-portrait__frame' });

    if (record.photoUrl) {
      frame.append(Acervo.createElement('img', {
        attributes: {
          src: record.photoUrl,
          alt: 'Fotografia da poetisa ' + record.name,
          width: 800,
          height: 1000,
          decoding: 'async'
        }
      }));
    } else {
      frame.append(Acervo.createElement('span', {
        className: 'profile-portrait__fallback',
        text: record.initials || Acervo.getInitials(record.name),
        attributes: { 'aria-hidden': 'true' }
      }));
    }

    portrait.append(frame);
    return portrait;
  }

  function openLightbox(item) {
    if (!lightbox || !lightboxImage || !lightboxTitle) return;
    var imageUrl = Acervo.getDirectImageUrl(item.src);
    if (!imageUrl) return;

    lightboxImage.src = imageUrl;
    lightboxImage.alt = item.title || 'Capa de folheto';
    lightboxTitle.textContent = item.title || '';
    lightbox.showModal();
  }

  function createWorkCard(item, index) {
    var figure = Acervo.createElement('figure', { className: 'work-card' });
    var button = Acervo.createElement('button', {
      className: 'work-card__button',
      type: 'button',
      attributes: { 'aria-label': 'Ampliar capa de ' + (item.title || ('obra ' + (index + 1))) }
    });
    var imageUrl = Acervo.getDirectImageUrl(item.src);

    if (imageUrl) {
      button.append(Acervo.createElement('img', {
        className: 'work-card__image',
        attributes: {
          src: imageUrl,
          alt: item.title || ('Capa ' + (index + 1)),
          width: 600,
          height: 750,
          loading: 'lazy',
          decoding: 'async'
        }
      }));
    } else {
      button.append(Acervo.createElement('div', {
        className: 'work-card__image',
        text: 'Capa em preparação',
        attributes: { role: 'img' }
      }));
    }

    button.addEventListener('click', function () { openLightbox(item); });

    var caption = Acervo.createElement('figcaption');
    caption.append(
      Acervo.createElement('strong', { text: item.title || ('Obra ' + (index + 1)) }),
      Acervo.createElement('span', { text: item.subtitle || 'Cordel' })
    );

    figure.append(button, caption);
    return figure;
  }

  function renderProfile(record) {
    Acervo.clearElement(header);

    var copy = Acervo.createElement('article', { className: 'profile-copy' });
    copy.append(Acervo.createElement('h1', { id: 'nome-poetisa', text: record.name }));

    if (record.summary) {
      copy.append(Acervo.createElement('p', { className: 'lede', text: record.summary }));
    }

    var biography = Acervo.createElement('div', { className: 'biography' });
    Acervo.renderParagraphs(biography, record.bio || record.summary || 'Sem biografia registrada.');
    copy.append(biography);

    header.append(renderPortrait(record), copy);

    if (!worksSection || !worksGallery) return;
    worksSection.hidden = false;
    Acervo.clearElement(worksGallery);

    var covers = record.covers || [];
    if (worksCount) {
      worksCount.textContent = covers.length === 1
        ? covers.length + ' obra'
        : covers.length + ' obras';
    }

    renderVideo(record);

    if (!covers.length) {
      worksGallery.append(Acervo.createElement('div', {
        className: 'state-panel',
        text: 'As obras desta poetisa ainda estão em catalogação.'
      }));
      return;
    }

    worksGallery.append.apply(worksGallery, covers.map(createWorkCard));
  }

  function renderVideo(record) {
    if (!record.videoUrl || !worksSection) return;
    var embedUrl = Acervo.convertToEmbed(record.videoUrl);
    if (!embedUrl) return;

    var video = Acervo.createElement('div', { className: 'verse' });
    var iframe = Acervo.createElement('iframe', {
      attributes: {
        src: embedUrl,
        title: 'Vídeo sobre ' + record.name,
        loading: 'lazy',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: true,
        frameborder: '0',
        style: 'width:100%;aspect-ratio:16/9;border:0;border-radius:12px;display:block;margin-top:2rem;'
      }
    });
    video.append(iframe);
    worksSection.append(video);
  }
});