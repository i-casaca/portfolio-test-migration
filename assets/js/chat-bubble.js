/* ===========================================================================
   chat-bubble.js — la burbuja del chatbot del portfolio.

   PROTOTIPO del ticket #18. Aquí NO hay motor: las respuestas están enlatadas
   para poder juzgar la interfaz. El motor real (recuperación léxica sobre el
   sitio leído en vivo) es el ticket #22.

   Lo que sí es real: el texto citado y los enlaces. Salen del contenido que
   está hoy en las páginas, para que la cita se pueda juzgar de verdad.
   =========================================================================== */

(function () {
  'use strict';

  // ---- respuestas enlatadas -------------------------------------------------
  // Cada una imita lo decidido en el ticket #16: marco de una línea + texto
  // documentado literal + cita que lleva a la página.

  var CANNED = {
    'sobre-mi': {
      frame: 'Esto es lo que tengo escrito sobre mí:',
      quote: 'Soy de Madrid 🇪🇸 y un entusiasta del café. Estudié arquitectura 🏛️, algo que ha contribuido enormemente a mis habilidades de diseño y a mi empatía con las personas que usan lo que diseño.',
      cite: 'Sobre mí',
      href: './index.html#sobre-mi'
    },
    'arabvision': {
      frame: 'Esto es lo que documenté sobre Arabvision:',
      quote: 'Analicé con detalle las preferencias de los usuarios y los matices culturales, ajustando el diseño de la aplicación a las necesidades específicas del público árabe. La supervisión continua del equipo de marca —con entrevistas y comprobaciones de contexto cultural— fue dando forma al diseño.',
      cite: 'Arabvision · Ejecución',
      href: './arabvision.html'
    },
    'experiencia': {
      frame: 'Del apartado de experiencia:',
      quote: 'Design System Designer en Telefónica, de 2024 a ahora. Antes, Product Designer en EPAM Systems entre 2022 y 2024.',
      cite: 'Experiencia',
      href: './index.html#sobre-mi'
    }
  };

  var SUGGESTIONS = [
    { label: '¿Quién eres y de dónde vienes?', key: 'sobre-mi' },
    { label: '¿Qué hiciste en Arabvision?', key: 'arabvision' },
    { label: '¿Dónde trabajas ahora?', key: 'experiencia' }
  ];

  var GREETING_DELAY = 4000;

  // ---- montaje --------------------------------------------------------------

  var root = document.createElement('div');
  root.innerHTML = [
    '<button class="cb-launcher" id="cb-launcher" aria-expanded="false" aria-controls="cb-panel">',
    '  <svg class="cb-launcher-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '    <path d="M21 11.5a8.38 8.38 0 0 1-9 8.3 8.5 8.5 0 0 1-3.8-.9L3 20l1.9-4.1A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 8.5-8.5A8.38 8.38 0 0 1 21 11.5z"/>',
    '  </svg>',
    '  <span class="cb-launcher-text">Pregúntame</span>',
    '  <span class="sr-only">Abrir el chat sobre el trabajo de Ismael</span>',
    '</button>',
    '<div class="cb-greeting" id="cb-greeting" role="status">',
    '  <button class="cb-greeting-close" id="cb-greeting-close" aria-label="Cerrar el saludo">×</button>',
    '  Pregúntame lo que quieras sobre mi trabajo.',
    '</div>',
    '<div class="cb-panel" id="cb-panel" role="dialog" aria-modal="false" aria-labelledby="cb-title">',
    '  <div class="cb-head">',
    '    <div>',
    '      <h2 id="cb-title">Pregúntame sobre mi trabajo</h2>',
    '      <p class="cb-disclaimer">Simulación local sobre lo que he escrito en este sitio. No es un modelo de IA en vivo.</p>',
    '    </div>',
    '    <button class="cb-close" id="cb-close" aria-label="Cerrar el chat">×</button>',
    '  </div>',
    '  <div class="cb-log" id="cb-log"></div>',
    '  <div class="cb-foot">',
    '    <form class="cb-form" id="cb-form">',
    '      <input type="text" id="cb-input" placeholder="Escribe tu pregunta…" autocomplete="off" />',
    '      <button type="submit">Enviar</button>',
    '    </form>',
    '    <div class="cb-contact">',
    '      <a href="https://www.linkedin.com/in/ismaelcasadoc/" target="_blank" rel="noopener">Escríbeme por LinkedIn</a>',
    '      <a href="./assets/cv/isma-casado-cv-es.pdf" download>Descargar CV</a>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');
  while (root.firstChild) document.body.appendChild(root.firstChild);

  var launcher = document.getElementById('cb-launcher');
  var panel = document.getElementById('cb-panel');
  var greeting = document.getElementById('cb-greeting');
  var log = document.getElementById('cb-log');
  var form = document.getElementById('cb-form');
  var input = document.getElementById('cb-input');

  // ---- pintado de mensajes ---------------------------------------------------

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-user';
    el.textContent = text;
    log.appendChild(el);
    scrollDown();
  }

  function addEmptyState() {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-bot';
    var p = document.createElement('p');
    p.textContent = 'Puedo contarte lo que hay documentado en este portfolio. Por ejemplo:';
    el.appendChild(p);
    var box = document.createElement('div');
    box.className = 'cb-suggest';
    SUGGESTIONS.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s.label;
      b.addEventListener('click', function () { ask(s.label, s.key); });
      box.appendChild(b);
    });
    el.appendChild(box);
    log.appendChild(el);
    scrollDown();
  }

  function addTyping() {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-bot cb-typing-wrap';
    el.innerHTML = '<div class="cb-typing"><span></span><span></span><span></span></div>';
    log.appendChild(el);
    scrollDown();
    return el;
  }

  function addAnswer(data) {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-bot';

    var frame = document.createElement('p');
    frame.textContent = data.frame;
    el.appendChild(frame);

    var quote = document.createElement('div');
    quote.className = 'cb-quote';

    // En la variante 2 la fuente encabeza el bloque citado; en las otras dos
    // va después del texto. El orden en el DOM importa para el lector de
    // pantalla, así que se construye distinto, no solo se recoloca por CSS.
    var cite = document.createElement('a');
    cite.className = 'cb-cite';
    cite.href = data.href;
    cite.textContent = (currentVariant() === '3' ? '↗ ' : '↳ ') + data.cite;

    var body = document.createElement('p');
    body.textContent = data.quote;

    if (currentVariant() === '2') {
      quote.appendChild(cite);
      quote.appendChild(body);
    } else {
      quote.appendChild(body);
      quote.appendChild(cite);
    }
    el.appendChild(quote);
    log.appendChild(el);
    scrollDown();
  }

  function addNote(html) {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-bot';
    var note = document.createElement('div');
    note.className = 'cb-note';
    note.innerHTML = html;
    el.appendChild(note);
    log.appendChild(el);
    scrollDown();
  }

  // ---- "motor" enlatado ------------------------------------------------------

  function resolve(text) {
    var t = text.toLowerCase();
    if (t.indexOf('arabvision') > -1) return CANNED.arabvision;
    if (t.indexOf('trabaj') > -1 || t.indexOf('telef') > -1 || t.indexOf('experiencia') > -1) return CANNED.experiencia;
    if (t.indexOf('quién') > -1 || t.indexOf('quien') > -1 || t.indexOf('madrid') > -1 || t.indexOf('arquitect') > -1) return CANNED['sobre-mi'];
    return null;
  }

  function ask(text, forcedKey) {
    addUser(text);
    var typing = addTyping();
    setTimeout(function () {
      typing.remove();
      if (forcedKey === '__error__') {
        addNote('No he podido leer el contenido del sitio. Recarga la página, o <a href="https://www.linkedin.com/in/ismaelcasadoc/" target="_blank" rel="noopener">escríbeme por LinkedIn</a>.');
        return;
      }
      var data = forcedKey && CANNED[forcedKey] ? CANNED[forcedKey] : resolve(text);
      if (data) {
        addAnswer(data);
      } else {
        addNote('Eso no lo tengo documentado. Puedo contarte de <strong>Arabvision</strong>, <strong>mi experiencia</strong> o <strong>de dónde vengo</strong> — o puedes <a href="https://www.linkedin.com/in/ismaelcasadoc/" target="_blank" rel="noopener">escribirme por LinkedIn</a>.');
      }
    }, 620);
  }

  // ---- apertura y cierre -----------------------------------------------------

  var opened = false;

  function openPanel() {
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    hideGreeting();
    if (!opened) { opened = true; addEmptyState(); }
    input.focus();
  }
  function closePanel() {
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
  function hideGreeting() { greeting.classList.remove('is-visible'); }

  launcher.addEventListener('click', function () {
    if (panel.classList.contains('is-open')) closePanel(); else openPanel();
  });
  document.getElementById('cb-close').addEventListener('click', closePanel);
  document.getElementById('cb-greeting-close').addEventListener('click', hideGreeting);
  greeting.addEventListener('click', function (e) {
    if (e.target.id !== 'cb-greeting-close') openPanel();
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    ask(v);
  });

  // El saludo solo aparece en la variante 2, y solo una vez por visita.
  var greetTimer = null;
  function armGreeting() {
    clearTimeout(greetTimer);
    hideGreeting();
    if (currentVariant() !== '2') return;
    greetTimer = setTimeout(function () {
      if (!panel.classList.contains('is-open')) greeting.classList.add('is-visible');
    }, GREETING_DELAY);
  }

  function currentVariant() {
    return document.body.getAttribute('data-variant') || '1';
  }

  // ---- enganches para el conmutador del prototipo ----------------------------
  // Los usa el chrome de variantes de index.html. Desaparecen al plegar el
  // ganador y quedarse con una sola variante.

  window.__cbProto = {
    reset: function () {
      log.innerHTML = '';
      opened = false;
      closePanel();
      armGreeting();
    },
    open: openPanel,
    demo: function (state) {
      openPanel();
      log.innerHTML = '';
      opened = true;
      if (state === 'vacio') { addEmptyState(); return; }
      if (state === 'escribiendo') { addUser('¿Qué hiciste en Arabvision?'); addTyping(); return; }
      if (state === 'cita') { addUser('¿Qué hiciste en Arabvision?'); addAnswer(CANNED.arabvision); return; }
      if (state === 'no-se') { ask('¿Cuánto cobras?'); return; }
      if (state === 'error') { ask('¿Qué hiciste en Arabvision?', '__error__'); return; }
    },
    armGreeting: armGreeting
  };

  armGreeting();
})();
