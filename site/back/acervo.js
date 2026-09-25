/* ===================================
   ACERVO.JS — dados e componentes compartilhados
   Backend: Supabase (PostgreSQL + RLS) — plano-supabase.md.
   Fallback: conteúdo estático local quando o Supabase não está
   configurado ou indisponível (o site nunca quebra).
   Nenhum HTML dinâmico é montado com innerHTML (segurança).
   =================================== */

(function () {
  'use strict';

  var POETISAS_ESTATICAS = [
    {
      name: 'Antônia Pessoa Magalhães',
      subtitle: 'Poetisa cordelista',
      summary: 'Cordelista paraibana dedicada à preservação da literatura popular e à expressão feminina no cordel nordestino.',
      bio: 'Antônia Pessoa Magalhães é uma poetisa paraibana que dedica sua arte à preservação da literatura de cordel. Sua obra reflete as vivências do povo nordestino, com especial atenção à condição feminina e às tradições culturais da região.\n\nSeus versos transitam entre o humor, a crítica social e a celebração da cultura popular, mantendo viva a tradição oral que caracteriza o cordel.',
      initials: 'AP',
      photoType: 'none',
      photoUrl: '',
      videoUrl: '',
      covers: []
    },
    {
      name: 'Benedita Silva de Azevedo',
      subtitle: 'Poetisa e educadora',
      summary: 'Educadora e poetisa que utiliza a literatura de cordel como instrumento de transformação social e valorização cultural.',
      bio: 'Benedita Silva de Azevedo é uma poetisa e educadora que encontrou na literatura de cordel um instrumento poderoso de transformação social. Seus folhetos abordam temas como educação, direitos das mulheres e valorização da cultura popular.\n\nCom uma escrita engajada e acessível, Benedita contribui para a democratização do saber através da poesia popular, levando o cordel para escolas e comunidades.',
      initials: 'BS',
      photoType: 'none',
      photoUrl: '',
      videoUrl: '',
      covers: []
    },
    {
      name: 'Clotilde Santa Cruz Tavares',
      subtitle: 'Pioneira do cordel feminino',
      summary: 'Uma das pioneiras da literatura de cordel feminina no Nordeste brasileiro, quebrando barreiras em um gênero tradicionalmente masculino.',
      bio: 'Clotilde Santa Cruz Tavares é reconhecida como uma das pioneiras da literatura de cordel feminina no Nordeste brasileiro. Em uma época em que a produção cordelista era predominantemente masculina, Clotilde ousou ocupar esse espaço com talento e determinação.\n\nSua obra abrange temas variados, desde narrativas tradicionais até questões sociais contemporâneas, sempre com a musicalidade e a rima características do cordel.\n\nClotilde é referência para gerações de mulheres cordelistas que vieram depois dela, abrindo caminho para a participação feminina nessa forma de expressão cultural.',
      initials: 'CS',
      photoType: 'none',
      photoUrl: '',
      videoUrl: '',
      covers: []
    },
    {
      name: 'Creusa Meira',
      subtitle: 'Poetisa popular',
      summary: 'Poetisa popular nordestina que mantém viva a tradição do cordel através de versos que retratam o cotidiano e as lutas do povo.',
      bio: 'Creusa Meira é uma poetisa popular nordestina cuja obra se destaca pela sensibilidade e pela conexão com as raízes culturais do Nordeste. Seus versos retratam o cotidiano, as lutas e as alegrias do povo, com uma linguagem acessível e profundamente poética.\n\nAtravés de seus folhetos, Creusa contribui para a preservação da memória cultural nordestina e para a valorização da voz feminina na literatura de cordel.',
      initials: 'CM',
      photoType: 'none',
      photoUrl: '',
      videoUrl: '',
      covers: []
    },
    {
      name: 'Dora Ribeiro',
      subtitle: 'Cordelista e ativista cultural',
      summary: 'Cordelista e ativista cultural que promove a literatura de cordel como patrimônio imaterial brasileiro.',
      bio: 'Dora Ribeiro é cordelista e ativista cultural que dedica sua vida à promoção da literatura de cordel como patrimônio imaterial do Brasil. Seus versos combinam tradição e contemporaneidade, abordando temas atuais com a forma clássica do cordel.\n\nDora é atuante em movimentos culturais e educacionais, levando a arte do cordel para novos públicos e promovendo oficinas e encontros de cordelistas.',
      initials: 'DR',
      photoType: 'none',
      photoUrl: '',
      videoUrl: '',
      covers: []
    },
    {
      name: 'Josenir Amorim Alves de Lacerda',
      subtitle: 'Poetisa e pesquisadora',
      summary: 'Pesquisadora e poetisa que alia produção acadêmica à arte do cordel, contribuindo para a documentação da tradição cordelista feminina.',
      bio: 'Josenir Amorim Alves de Lacerda é poetisa e pesquisadora da literatura de cordel, dedicando-se tanto à produção poética quanto à documentação e estudo dessa tradição cultural.\n\nSua dupla atuação — como artista e acadêmica — contribui significativamente para a preservação e valorização do cordel feminino, produzindo tanto versos quanto reflexões críticas sobre o papel da mulher nessa manifestação cultural.',
      initials: 'JA',
      photoType: 'none',
      photoUrl: '',
      videoUrl: '',
      covers: []
    },
    {
      name: 'Maria das Neves Baptista Pimentel',
      subtitle: 'Cordelista histórica',
      summary: 'Uma das primeiras mulheres a publicar folhetos de cordel no Brasil, figura fundamental na história da literatura popular.',
      bio: 'Maria das Neves Baptista Pimentel é uma figura histórica da literatura de cordel brasileira, sendo considerada uma das primeiras mulheres a publicar folhetos de cordel no país. Sua produção literária desafiou as convenções de gênero de sua época.\n\nSeus folhetos circularam amplamente pelas feiras e mercados do Nordeste, alcançando grande popularidade e provando que a arte do cordel não era exclusividade masculina.\n\nMaria das Neves é hoje celebrada como um marco na luta pela participação feminina na literatura popular brasileira.',
      initials: 'MN',
      photoType: 'none',
      photoUrl: '',
      videoUrl: '',
      covers: []
    },
    {
      name: 'Salete Maria da Silva',
      subtitle: 'Poetisa e jurista',
      summary: 'Jurista e poetisa que utiliza o cordel como ferramenta de educação jurídica popular e empoderamento feminino.',
      bio: 'Salete Maria da Silva é jurista e poetisa que encontrou no cordel uma forma inovadora de democratizar o conhecimento jurídico. Seus folhetos tratam de direitos humanos, cidadania e empoderamento feminino em linguagem acessível.\n\nSua obra é um exemplo singular de como a literatura popular pode ser instrumento de educação e transformação social, levando informação sobre direitos fundamentais para comunidades que muitas vezes não têm acesso à linguagem jurídica formal.',
      initials: 'SM',
      photoType: 'none',
      photoUrl: '',
      videoUrl: '',
      covers: []
    }
  ];

  /* ===================================
     HELPERS
     =================================== */

  function createElement(tagName, options) {
    var element = document.createElement(tagName);
    options = options || {};

    if (options.className) element.className = options.className;
    if (options.text) element.textContent = options.text;

    for (var attrName in (options.attributes || {})) {
      if (!Object.prototype.hasOwnProperty.call(options.attributes, attrName)) continue;
      var value = options.attributes[attrName];
      if (value === false || value === null || value === undefined) continue;
      element.setAttribute(attrName, value === true ? '' : String(value));
    }

    for (var eventName in (options.events || {})) {
      if (Object.prototype.hasOwnProperty.call(options.events, eventName)) {
        element.addEventListener(eventName, options.events[eventName]);
      }
    }

    return element;
  }

  function clearElement(element) {
    if (element) element.replaceChildren();
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function getDirectImageUrl(url) {
    if (!url) return '';
    var trimmed = String(url).trim();
    var match = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return 'https://drive.google.com/uc?export=view&id=' + match[1];
    }
    return trimmed;
  }

  function getInitials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '--';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function slugify(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function convertToEmbed(url) {
    if (!url) return null;
    var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match) return 'https://www.youtube.com/embed/' + match[1];
    match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (match) return 'https://player.vimeo.com/video/' + match[1];
    return null;
  }

  function renderParagraphs(container, text) {
    if (!container) return;
    var paragraphs = String(text || '')
      .split(/\n\s*\n/)
      .map(function (value) { return value.trim(); })
      .filter(Boolean);

    container.replaceChildren.apply(container, paragraphs.map(function (paragraph) {
      return createElement('p', { text: paragraph });
    }));
  }

  function cloneStatic() {
    return POETISAS_ESTATICAS.map(function (p) {
      return {
        name: p.name,
        subtitle: p.subtitle,
        summary: p.summary,
        bio: p.bio,
        initials: p.initials,
        photoType: p.photoType,
        photoUrl: p.photoUrl,
        videoUrl: p.videoUrl,
        covers: p.covers.slice()
      };
    });
  }

  /* ===================================
     FONTE DE DADOS (Supabase REST + fallback)
     =================================== */

  var cache = null;

  function mapRow(row) {
    var photoUrl = row.photo_type === 'url' && row.photo_url
      ? getDirectImageUrl(row.photo_url)
      : '';
    var covers = Array.isArray(row.covers)
      ? row.covers.filter(function (c) {
          return c && typeof c.src === 'string' && c.src.indexOf('http') === 0;
        })
      : [];
    return {
      name: row.name || '',
      subtitle: row.subtitle || '',
      summary: row.summary || '',
      bio: row.bio || '',
      initials: row.initials || '',
      photoType: row.photo_type || 'none',
      photoUrl: photoUrl,
      videoUrl: (row.video_url || '').trim(),
      covers: covers
    };
  }

  function carregarDoSupabase() {
    return new Promise(function (resolve, reject) {
      if (!window.supabaseEstaConfigurado || !supabaseEstaConfigurado()) {
        reject(new Error('Supabase não configurado'));
        return;
      }

      var endpoint = SUPABASE_CONFIG.url.replace(/\/$/, '') +
        '/rest/v1/poetisas?select=name,subtitle,summary,bio,initials,photo_type,photo_url,video_url,covers&order=name.asc';

      fetch(endpoint, {
        headers: {
          apikey: SUPABASE_CONFIG.anonKey,
          Authorization: 'Bearer ' + SUPABASE_CONFIG.anonKey
        }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Erro ' + response.status);
          return response.json();
        })
        .then(function (data) {
          if (!Array.isArray(data)) throw new Error('Resposta inválida');
          resolve(data.map(mapRow));
        })
        .catch(reject);
    });
  }

  function loadAll() {
    if (cache) return cache;

    cache = new Promise(function (resolve) {
      carregarDoSupabase()
        .then(function (records) {
          if (!records.length) resolve([]);
          else resolve(records);
        })
        .catch(function () {
          resolve(cloneStatic());
        });
    });

    return cache;
  }

  function getBySlug(slug) {
    var target = String(slug || '').toLowerCase();
    return loadAll().then(function (list) {
      var found = null;
      list.forEach(function (record) {
        if (slugify(record.name) === target) found = record;
      });
      return found;
    });
  }

  /* ===================================
     COMPONENTES
     =================================== */

  function createPoetisaCard(record) {
    var card = createElement('a', {
      className: 'poetisa-card',
      attributes: {
        href: 'poetisa.html?slug=' + encodeURIComponent(slugify(record.name))
      }
    });

    var portrait = createElement('div', { className: 'poetisa-card__portrait' });

    if (record.photoUrl) {
      portrait.append(createElement('img', {
        attributes: {
          src: record.photoUrl,
          alt: 'Fotografia de ' + record.name,
          width: 800,
          height: 1000,
          loading: 'lazy',
          decoding: 'async'
        }
      }));
    } else {
      portrait.append(createElement('span', {
        className: 'poetisa-card__fallback',
        text: record.initials || getInitials(record.name),
        attributes: { 'aria-hidden': 'true' }
      }));
    }

    var body = createElement('div', { className: 'poetisa-card__body' });
    body.append(
      createElement('h3', { className: 'poetisa-card__name', text: record.name }),
      createElement('p', {
        className: 'poetisa-card__summary',
        text: record.summary || 'Biografia e obras registradas no acervo.'
      }),
      createElement('span', { className: 'poetisa-card__action', text: 'Ver perfil' })
    );

    card.append(portrait, body);
    return card;
  }

  function createSkeletonCards(count) {
    var cards = [];
    for (var i = 0; i < (count || 3); i += 1) {
      var card = createElement('div', {
        className: 'skeleton-card',
        attributes: { 'aria-hidden': 'true' }
      });
      var body = createElement('div', { className: 'skeleton-card__body' });
      body.append(
        createElement('div', { className: 'skeleton-card__line' }),
        createElement('div', { className: 'skeleton-card__line' })
      );
      card.append(createElement('div', { className: 'skeleton-card__image' }), body);
      cards.push(card);
    }
    return cards;
  }

  function createEmptyState(title, message) {
    var panel = createElement('div', { className: 'state-panel' });
    var inner = createElement('div', { className: 'state-panel__inner' });
    inner.append(
      createElement('h2', { text: title }),
      createElement('p', { text: message })
    );
    panel.append(inner);
    return panel;
  }

  function mostrarBannerEmPreparacao() {
    var banner = document.querySelector('[data-config-banner]');
    if (banner) banner.hidden = false;
  }

  window.Acervo = {
    loadAll: loadAll,
    getBySlug: getBySlug,
    createPoetisaCard: createPoetisaCard,
    createSkeletonCards: createSkeletonCards,
    createEmptyState: createEmptyState,
    getInitials: getInitials,
    getDirectImageUrl: getDirectImageUrl,
    slugify: slugify,
    convertToEmbed: convertToEmbed,
    renderParagraphs: renderParagraphs,
    clearElement: clearElement,
    createElement: createElement,
    escapeHtml: escapeHtml,
    mostrarBannerEmPreparacao: mostrarBannerEmPreparacao
  };
})();