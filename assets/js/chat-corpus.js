/* ===========================================================================
   chat-corpus.js — el motor del shadowman: extracción del corpus + búsqueda.

   Decidido en el ticket #20: **el corpus no es un archivo, es el sitio leído
   en vivo.** Este archivo hace `fetch` de las 6 páginas, las parsea con
   `DOMParser` y saca los fragmentos por su estructura. No hay copia que
   mantener, así que no puede desincronizarse: lo que se cita es literalmente
   lo que el visitante verá al hacer clic.

   Decidido en el ticket #16: la recuperación es **léxica con umbral mínimo**.
   Por encima del umbral responde citando; por debajo admite el límite.

   Decidido en el ticket #21: **solo español**, sin perfiles de visitante, y
   memoria de 3 turnos que arrastra el último proyecto citado.

   Sin build, sin framework, sin módulos ES — coherente con el resto del sitio.
   Expone `window.CHAT_CORPUS`.
   =========================================================================== */

(function () {
  'use strict';

  var CACHE_KEY = 'cb-corpus-v1';

  // Las 6 páginas del sitio. `project` es null en la home porque su contenido
  // no pertenece a ningún proyecto.
  var PAGES = [
    { file: 'index.html',        project: null },
    { file: 'manu-cardiel.html', project: 'Manu Cardiel' },
    { file: 'adrenaline.html',   project: 'Adrenaline' },
    { file: 'arabvision.html',   project: 'Arabvision' },
    { file: 'nexahub.html',      project: 'Nexahub' },
    { file: 'el-paraguas.html',  project: 'El Paraguas' }
  ];

  // --------------------------------------------------------------------------
  // Normalización de texto
  // --------------------------------------------------------------------------

  // Palabras que aparecen en casi cualquier pregunta y no discriminan nada. Sin
  // esto, "¿qué hiciste en Arabvision?" puntuaría alto en todos los fragmentos
  // que contengan "en" o "qué".
  //
  // Solo palabras funcionales de verdad. Los interrogativos que sí discriminan
  // en una conversación sobre un portfolio —"donde", "quien", "cuando",
  // "eres"— se dejan fuera de la lista a propósito: son a menudo el único
  // término con contenido de una pregunta corta ("¿de dónde eres?"), y si se
  // filtran, la pregunta se queda sin nada que buscar. Las etiquetas de
  // `chat-corpus-tags.js` recogen esas formas naturales.
  var STOPWORDS = ('de la que el en y a los del se las por un para con no una su al lo mas ' +
    'pero sus le ya o este si porque esta entre muy sin sobre tambien me hasta hay ' +
    'desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mi antes ' +
    'algunos unos yo otro otras otra tanto esa estos mucho nada muchos cual sea poco ' +
    'ella estar haber estas estaba estamos algunas algo nosotros tu te ti tus ellas nosotras ' +
    'vosotros vosotras os mio mia mios mias tuyo tuya suyo suya nuestro nuestra es son era fue ha ' +
    'han cuales cuanto cuanta cuantos cuantas usted').split(' ');

  var STOP = {};
  STOPWORDS.forEach(function (w) { STOP[w] = true; });

  function stripAccents(s) {
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }

  function normalize(s) {
    return stripAccents(String(s).toLowerCase())
      .replace(/[^a-z0-9ñ\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Raíz muy grosera: recorta plurales y algunas terminaciones verbales, para
  // que "diseñar / diseño / diseños / diseñaste" caigan en el mismo cubo. No es
  // un stemmer de verdad, y no hace falta que lo sea.
  function stem(w) {
    if (w.length <= 4) return w;
    return w
      .replace(/(aste|iste|ando|iendo|aron|ieron|amos|emos|imos|aba|ias|cion|ciones)$/, '')
      .replace(/(es|s)$/, '')
      // La vocal final se recorta también, y por eso "estudiaste" (pregunta) y
      // "estudié" (texto del sitio) acaban en el mismo cubo. Es agresivo, pero
      // se aplica igual a los dos lados de la comparación, así que no
      // desalinea nada.
      .replace(/[aeo]$/, '');
  }

  function tokenize(s) {
    var out = [];
    normalize(s).split(' ').forEach(function (w) {
      if (!w || w.length < 2 || STOP[w]) return;
      out.push(stem(w));
    });
    return out;
  }

  // --------------------------------------------------------------------------
  // Extracción: del HTML a fragmentos
  // --------------------------------------------------------------------------

  function clean(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // Un fragmento es la unidad temática mínima (ticket #20). Su `id` es
  // `<página>#<ancla>/<orden>`, que es la clave del archivo de etiquetas.
  function makeFragment(page, anchor, ordinal, section, text, nda) {
    var id = page.file + '#' + anchor + '/' + ordinal;
    var cite = page.project ? page.project + ' · ' + section : section;
    return {
      id: id,
      text: text,
      page: page.file,
      project: page.project,
      section: section,
      nda: !!nda,
      cite: cite,
      href: './' + page.file + '#' + anchor,
      tags: (window.CHAT_CORPUS_TAGS && window.CHAT_CORPUS_TAGS[id]) || ''
    };
  }

  function extractHome(doc, page) {
    var out = [];

    // "Sobre mí": un fragmento por párrafo. Cubren cosas distintas (identidad,
    // enfoque profesional, aficiones) y no deben arrastrarse entre sí.
    var bio = doc.querySelectorAll('#sobre-mi .about-bio p');
    Array.prototype.forEach.call(bio, function (p, i) {
      var t = clean(p);
      if (t) out.push(makeFragment(page, 'sobre-mi', i, 'Sobre mí', t, false));
    });

    // Experiencia y Formación: un fragmento por entrada.
    [['experiencia', 'Experiencia'], ['formacion', 'Formación']].forEach(function (pair) {
      var items = doc.querySelectorAll('#' + pair[0] + ' .cv-list li');
      Array.prototype.forEach.call(items, function (li, i) {
        var role = li.querySelector('.cv-role');
        var org = li.querySelector('.cv-org');
        var year = li.querySelector('.cv-year');
        if (!role) return;
        var t = clean(role) + ' — ' + (org ? clean(org) : '') + ' (' + (year ? clean(year) : '') + ')';
        out.push(makeFragment(page, pair[0], i, pair[1], t, false));
      });
    });

    // Metodología: lo que sale de la entrevista del ticket #17. Se recorre de
    // forma genérica —cada bloque con `id` dentro de `.method`, un fragmento
    // por párrafo— para que las respuestas que falten se recojan solas al
    // publicarse, sin tocar este archivo.
    var blocks = doc.querySelectorAll('#metodologia .method > div[id]');
    Array.prototype.forEach.call(blocks, function (block) {
      var h3 = block.querySelector('h3');
      var name = h3 ? clean(h3) : 'Cómo trabajo';
      Array.prototype.forEach.call(block.querySelectorAll('p'), function (p, i) {
        var t = clean(p);
        if (!t) return;
        var f = makeFragment(page, block.id, i, name, t, false);
        // La cita dice "Cómo trabajo · <bloque>" en vez de solo el bloque:
        // suelto, un titular como "Cuándo dejo de iterar" no dice de dónde sale.
        f.cite = 'Cómo trabajo · ' + name;
        f.kind = 'metodologia';
        out.push(f);
      });
    });

    // Contacto. El sitio ya tiene la franja del pie con sus canales, así que el
    // corpus la lee como cualquier otra sección en vez de llevar una respuesta
    // escrita aparte. Sin esto, "¿cómo te contacto?" no encontraba nada suyo y
    // caía en la sección de metodología por compartir la palabra "cómo".
    var footer = doc.querySelector('#contacto');
    if (footer) {
      var canales = [];
      Array.prototype.forEach.call(footer.querySelectorAll('.footer-links a'), function (a) {
        // La descarga del CV vive en la misma franja pero no es un canal por el
        // que escribirle; colarla haría decir "escríbeme por Descargar CV".
        if (a.hasAttribute('download')) return;
        canales.push(clean(a));
      });
      if (canales.length) {
        out.push(makeFragment(page, 'contacto', 0, 'Contacto',
          'Puedes escribirme por ' + canales.join(', ') + '.', false));
      }
    }

    // El índice de proyectos: la descripción de una línea de cada tarjeta. Es
    // lo que responde "¿qué proyectos tienes?" sin abrir cada página.
    var rows = doc.querySelectorAll('#trabajo .work-row');
    Array.prototype.forEach.call(rows, function (row, i) {
      var h3 = row.querySelector('h3');
      var tag = row.querySelector('.work-tagline');
      if (!h3 || !tag) return;
      var f = makeFragment(page, 'trabajo', i, 'Trabajo', clean(h3) + ': ' + clean(tag), false);
      // Esta tarjeta sí pertenece a un proyecto, aunque viva en la home, y su
      // cita debe llevar a la página del proyecto, no de vuelta al índice.
      f.project = clean(h3);
      f.cite = clean(h3);
      var link = row.getAttribute('href');
      if (link) f.href = link;
      out.push(f);
    });

    return out;
  }

  function extractProject(doc, page) {
    var out = [];

    // La ficha de cabecera (Organización / Año / Posición) responde a "¿para
    // quién fue?" y "¿qué rol tuviste?", que no están en el cuerpo del texto.
    var meta = doc.querySelector('.meta-row');
    if (meta) {
      var bits = [];
      Array.prototype.forEach.call(meta.querySelectorAll('div'), function (d) {
        var label = d.querySelector('span');
        var full = clean(d);
        if (label) {
          var l = clean(label);
          bits.push(l + ': ' + full.slice(l.length).trim());
        }
      });
      if (bits.length) {
        // La ficha no está bajo el muro: el <div class="project-header"> vive
        // fuera del gate, así que se puede enseñar sin contraseña.
        out.push(makeFragment(page, 'ficha', 0, 'Ficha', bits.join(' · '), false));
      }
    }

    // Contexto / Ejecución / Resultado: un párrafo cada una, verificado en las
    // 5 páginas. NDA se deriva de si la sección vive dentro del muro.
    ['contexto', 'ejecucion', 'resultado'].forEach(function (anchor) {
      var sec = doc.getElementById(anchor);
      if (!sec) return;
      var h2 = sec.querySelector('h2');
      var name = h2 ? clean(h2).replace(/^↳\s*/, '') : anchor;
      var nda = !!sec.closest('.gate-wrap, #gate-wrap');
      var ps = sec.querySelectorAll('p');
      Array.prototype.forEach.call(ps, function (p, i) {
        var t = clean(p);
        if (t) out.push(makeFragment(page, anchor, i, name, t, nda));
      });
    });

    return out;
  }

  function parsePage(html, page) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return page.project === null ? extractHome(doc, page) : extractProject(doc, page);
  }

  // --------------------------------------------------------------------------
  // Carga: perezosa y cacheada (ticket #20)
  // --------------------------------------------------------------------------

  var loading = null;
  var fragments = null;

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return (parsed && parsed.length) ? parsed : null;
    } catch (e) { return null; }
  }

  function writeCache(list) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function load() {
    if (fragments) return Promise.resolve(fragments);
    if (loading) return loading;

    var cached = readCache();
    if (cached) {
      fragments = index(cached);
      return Promise.resolve(fragments);
    }

    loading = Promise.all(PAGES.map(function (page) {
      return fetch(page.file)
        .then(function (r) {
          if (!r.ok) throw new Error(page.file + ' -> ' + r.status);
          return r.text();
        })
        .then(function (html) { return parsePage(html, page); })
        // Una página caída no debe tumbar el corpus entero: se pierde lo suyo
        // y el resto sigue respondiendo.
        .catch(function (e) { console.warn('[chat] no se pudo leer', page.file, e); return []; });
    })).then(function (chunks) {
      var flat = [];
      chunks.forEach(function (c) { flat = flat.concat(c); });
      if (!flat.length) throw new Error('corpus vacío');
      writeCache(flat);
      fragments = index(flat);
      return fragments;
    });

    return loading;
  }

  // --------------------------------------------------------------------------
  // Índice y búsqueda léxica
  // --------------------------------------------------------------------------

  // Prepara los tokens una vez y calcula el peso de cada término. Un término
  // que aparece en casi todos los fragmentos ("diseño") discrimina menos que
  // uno raro ("RTL") — es la idea de IDF, sin las matemáticas completas.
  function index(list) {
    var df = {};
    list.forEach(function (f) {
      f.tokens = tokenize(f.text);
      f.tagTokens = tokenize(f.tags);
      f.projectTokens = f.project ? tokenize(f.project) : [];
      // El nombre de la sección ("Contexto", "Ejecución", "Resultado") es
      // metadato real y la gente pregunta por él tal cual ("¿y el contexto?").
      // Sin indexarlo, esas tres secciones eran indistinguibles entre sí.
      f.sectionTokens = f.section ? tokenize(f.section) : [];
      var seen = {};
      f.tokens.concat(f.tagTokens, f.sectionTokens).forEach(function (t) {
        if (seen[t]) return;
        seen[t] = true;
        df[t] = (df[t] || 0) + 1;
      });
    });
    var n = list.length;
    list.forEach(function (f) {
      f.weight = {};
      var add = function (tokens, boost) {
        tokens.forEach(function (t) {
          var idf = Math.log(1 + n / (1 + (df[t] || 0)));
          f.weight[t] = (f.weight[t] || 0) + idf * boost;
        });
      };
      // El texto es la fuente de verdad; las etiquetas y el nombre del proyecto
      // pesan más porque son deliberados, no incidentales.
      add(f.tokens, 1);
      add(f.tagTokens, 1.6);
      add(f.sectionTokens, 1.8);
      add(f.projectTokens, 2.2);

      // Las tarjetas del índice de la home son un resumen de una línea, no
      // contenido. Deben ganar cuando la pregunta va del conjunto ("¿qué
      // proyectos tienes?") y perder cuando va de uno concreto, donde la
      // sección de ese proyecto responde mucho mejor.
      if (f.section === 'Trabajo') {
        for (var t in f.weight) f.weight[t] *= 0.5;
      }
    });
    return list;
  }

  // Por debajo de esto, no se responde: se admite el límite (ticket #16). El
  // valor se afinó a mano contra preguntas reales; está anotado como pendiente
  // de revisar en el mapa.
  var THRESHOLD = 0.34;

  function search(query, memory) {
    if (!fragments) return { hit: null, score: 0 };

    var terms = tokenize(query);
    if (!terms.length) return { hit: null, score: 0 };

    // Memoria de 3 turnos (ticket #21): si la pregunta es corta y no nombra
    // ningún proyecto, se arrastra el último del que se habló. Es lo que hace
    // que "¿y el resultado?" funcione después de hablar de Arabvision.
    var carried = [];
    if (memory && memory.lastProject && terms.length <= 3) {
      var namesProject = fragments.some(function (f) {
        return f.project && tokenize(f.project).some(function (t) { return terms.indexOf(t) > -1; });
      });
      if (!namesProject) carried = tokenize(memory.lastProject);
    }

    var best = null, bestCombined = 0, bestOwn = 0;
    // El denominador es solo lo que preguntó el visitante: si los términos
    // arrastrados contaran, una pregunta corta parecería peor respondida de lo
    // que está.
    var maxPossible = terms.reduce(function (a, t) { return a + maxWeight(t); }, 0) || 1;

    fragments.forEach(function (f) {
      var own = 0;
      terms.forEach(function (t) { own += f.weight[t] || 0; });
      var combined = own;
      carried.forEach(function (t) { combined += (f.weight[t] || 0) * 0.7; });

      if (own / maxPossible > bestOwn) bestOwn = own / maxPossible;
      if (combined / maxPossible > bestCombined) {
        bestCombined = combined / maxPossible;
        best = f;
      }
    });

    // El arrastre de la memoria solo **desempata** entre candidatos; nunca crea
    // una respuesta por sí solo. El umbral se mide contra lo que preguntó el
    // visitante, no contra el total: como los términos arrastrados suman al
    // numerador y no al denominador, una pregunta cuyos términos no puntúan
    // nada ("¿cuál es tu comida favorita?") alcanzaría el umbral solo por el
    // peso del último proyecto citado, y contestaría con él. Eso rompería el
    // fallback honesto del ticket #16, que manda sobre la memoria del #21.
    return bestOwn >= THRESHOLD
      ? { hit: best, score: bestOwn }
      : { hit: null, score: bestOwn };
  }

  var maxWeightCache = null;
  function maxWeight(term) {
    if (!maxWeightCache) {
      maxWeightCache = {};
      fragments.forEach(function (f) {
        for (var t in f.weight) {
          if (!maxWeightCache[t] || f.weight[t] > maxWeightCache[t]) maxWeightCache[t] = f.weight[t];
        }
      });
    }
    // Un término que no está en ningún fragmento no puede sumar, pero tampoco
    // debe abaratar el denominador: si no, preguntar cosas raras subiría la
    // puntuación de cualquier coincidencia parcial.
    return maxWeightCache[term] || 1;
  }

  // Temas que sí se pueden responder — alimenta el "puedes preguntarme sobre
  // X, Y, Z" del ticket #16. Se sacan del corpus, no de una lista escrita.
  //
  // Los proyectos van primero y las secciones del sitio después. Recorriendo
  // los fragmentos en orden, la home los copa todos —sale antes que las páginas
  // de proyecto— y quien lee el aviso de "esto no lo tengo" se queda sin saber
  // que puede preguntar por Arabvision o Nexahub, que es lo que de verdad viene
  // a mirar un técnico de selección.
  function topics() {
    if (!fragments) return [];
    var vistos = {}, proyectos = [], secciones = [];
    fragments.forEach(function (f) {
      var key = f.project || f.section;
      if (!key || vistos[key]) return;
      vistos[key] = true;
      (f.project ? proyectos : secciones).push(key);
    });
    return proyectos.concat(secciones);
  }

  window.CHAT_CORPUS = {
    load: load,
    search: search,
    topics: topics,
    all: function () { return fragments || []; }
  };
})();
