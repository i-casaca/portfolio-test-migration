/* ===========================================================================
   chat-bubble.js — la interfaz de la burbuja del chatbot.

   Forma decidida en el ticket #18 (variante "Discreta"): círculo con anillo de
   pulso, sin globo de saludo, y la fuente citada al pie de cada respuesta.

   El motor vive en `chat-corpus.js` (`window.CHAT_CORPUS`). Este archivo solo
   pinta y gestiona la conversación: apertura, memoria de 3 turnos, estados.

   Comportamiento heredado de decisiones anteriores:
     #16 — marco honesto ("esto es lo que documenté"), umbral, salida a contacto.
     #20 — el corpus se carga perezosamente al abrir, no al cargar la página.
     #21 — solo español, sin perfiles, memoria de 3 turnos.
   =========================================================================== */

(function () {
  'use strict';

  var LINKEDIN = 'https://www.linkedin.com/in/ismaelcasadoc/';
  var MEMORY_TURNS = 3;

  // Preguntas de entrada. No son respuestas enlatadas: se lanzan contra el
  // motor real, igual que si el visitante las escribiera.
  var SUGGESTIONS = [
    '¿Quién eres y de dónde vienes?',
    '¿Qué hiciste en Arabvision?',
    '¿Dónde trabajas ahora?'
  ];

  // Las rutas del sitio son relativas, y la burbuja vive en las 6 páginas, que
  // están todas en la raíz — así que `./` vale igual en todas.
  var CV = './assets/cv/isma-casado-cv-es.pdf';

  // ---- montaje --------------------------------------------------------------

  var root = document.createElement('div');
  root.innerHTML = [
    '<button class="cb-launcher" id="cb-launcher" aria-expanded="false" aria-controls="cb-panel">',
    '  <svg class="cb-launcher-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '    <path d="M21 11.5a8.38 8.38 0 0 1-9 8.3 8.5 8.5 0 0 1-3.8-.9L3 20l1.9-4.1A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 8.5-8.5A8.38 8.38 0 0 1 21 11.5z"/>',
    '  </svg>',
    '  <span class="sr-only">Abrir el chat sobre el trabajo de Ismael</span>',
    '</button>',
    '<div class="cb-panel" id="cb-panel" role="dialog" aria-modal="false" aria-labelledby="cb-title">',
    '  <div class="cb-head">',
    '    <div>',
    '      <h2 id="cb-title">Pregúntame sobre mi trabajo</h2>',
    '      <p class="cb-disclaimer">Simulación local sobre lo que he escrito en este sitio. No es un modelo de IA en vivo.</p>',
    '    </div>',
    '    <button class="cb-close" id="cb-close" aria-label="Cerrar el chat">×</button>',
    '  </div>',
    '  <div class="cb-log" id="cb-log" aria-live="polite"></div>',
    '  <div class="cb-foot">',
    '    <form class="cb-form" id="cb-form">',
    '      <input type="text" id="cb-input" placeholder="Escribe tu pregunta…" autocomplete="off" />',
    '      <button type="submit">Enviar</button>',
    '    </form>',
    '    <div class="cb-contact">',
    '      <a href="' + LINKEDIN + '" target="_blank" rel="noopener">Escríbeme por LinkedIn</a>',
    '      <a href="' + CV + '" download>Descargar CV</a>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');
  while (root.firstChild) document.body.appendChild(root.firstChild);

  var launcher = document.getElementById('cb-launcher');
  var panel = document.getElementById('cb-panel');
  var log = document.getElementById('cb-log');
  var form = document.getElementById('cb-form');
  var input = document.getElementById('cb-input');

  // ---- memoria acotada (ticket #21) -----------------------------------------

  // Ventana deslizante de 3 turnos. Lo único que se guarda de cada turno es de
  // qué proyecto se habló, que es lo que necesita la búsqueda para resolver
  // seguimientos cortos ("¿y el resultado?").
  var turns = [];

  function remember(fragment) {
    turns.push({ project: fragment ? fragment.project : null });
    while (turns.length > MEMORY_TURNS) turns.shift();
  }

  function memory() {
    for (var i = turns.length - 1; i >= 0; i--) {
      if (turns[i].project) return { lastProject: turns[i].project };
    }
    return { lastProject: null };
  }

  // ---- pintado ---------------------------------------------------------------

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-user';
    el.textContent = text;
    log.appendChild(el);
    scrollDown();
  }

  function addSuggestions(parent, labels) {
    var box = document.createElement('div');
    box.className = 'cb-suggest';
    labels.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', function () { ask(label); });
      box.appendChild(b);
    });
    parent.appendChild(box);
  }

  function addEmptyState() {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-bot';
    var p = document.createElement('p');
    p.textContent = 'Puedo contarte lo que hay documentado en este portfolio. Por ejemplo:';
    el.appendChild(p);
    addSuggestions(el, SUGGESTIONS);
    log.appendChild(el);
    scrollDown();
  }

  function addTyping() {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-bot';
    el.innerHTML = '<div class="cb-typing"><span></span><span></span><span></span></div>';
    log.appendChild(el);
    scrollDown();
    return el;
  }

  // El marco de una línea decidido en el ticket #16: deja claro que lo que
  // viene es documentación citada, no una frase improvisada.
  function frameFor(fragment) {
    if (fragment.kind === 'metodologia') return 'Sobre cómo trabajo, esto es lo que tengo escrito:';
    if (fragment.project && fragment.section !== fragment.project) {
      return 'Esto es lo que documenté sobre ' + fragment.project + ':';
    }
    if (fragment.section === 'Sobre mí') return 'Esto es lo que tengo escrito sobre mí:';
    if (fragment.section === 'Experiencia') return 'Del apartado de experiencia:';
    if (fragment.section === 'Formación') return 'De mi formación:';
    return 'Esto es lo que hay escrito en el sitio:';
  }

  function addAnswer(fragment) {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-msg-bot';

    var frame = document.createElement('p');
    frame.textContent = frameFor(fragment);
    el.appendChild(frame);

    var body = document.createElement('p');
    body.textContent = fragment.text;
    el.appendChild(body);

    var cite = document.createElement('a');
    cite.className = 'cb-cite';
    cite.href = fragment.href;
    cite.textContent = '↳ ' + fragment.cite;
    el.appendChild(cite);

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

  // ---- idioma (ticket #21) ---------------------------------------------------

  // Solo español, dicho abiertamente. La detección es deliberadamente tosca:
  // busca palabras funcionales inglesas, que es la señal más barata y menos
  // propensa a falsos positivos con nombres propios del portfolio.
  var EN = /\b(what|who|where|when|why|how|your|you|the|did|do|does|can|could|tell|about|are|is|was|were|have|has|work|project)\b/gi;

  function looksEnglish(text) {
    var hits = (text.match(EN) || []).length;
    return hits >= 2;
  }

  // ---- conversación ----------------------------------------------------------

  function ask(text) {
    addUser(text);

    if (looksEnglish(text)) {
      addNote('Sorry — I can only answer in Spanish: everything in this portfolio is written in Spanish. ' +
              '<br><br>Solo puedo responderte en español, porque el contenido de este portfolio está en español. ' +
              'Si lo prefieres, <a href="' + LINKEDIN + '" target="_blank" rel="noopener">escríbeme por LinkedIn</a>.');
      return;
    }

    var typing = addTyping();

    // Latencia mínima deliberada: con el aviso de honestidad puesto en la
    // cabecera, esto es pulido de UX y no un engaño (ticket #16). La búsqueda
    // es instantánea, y una respuesta que aparece de golpe se lee como error.
    var started = Date.now();
    var result = window.CHAT_CORPUS.search(text, memory());
    var wait = Math.max(0, 420 - (Date.now() - started));

    setTimeout(function () {
      typing.remove();
      if (result.hit) {
        addAnswer(result.hit);
        remember(result.hit);
        return;
      }
      // Bajo NDA y sin contraseña. Se dice lo que es —existe, está escrito, no
      // se puede enseñar— en vez de fingir que no hay nada: el muro de la
      // página no serviría de nada si la burbuja contase lo que él tapa.
      if (result.locked) {
        remember(null);
        // La tarjeta del índice de la home sí es pública, así que el resumen de
        // una línea se puede dar. Sin él, el aviso prometería "de qué va por
        // encima" y no cumpliría.
        var publico = null;
        window.CHAT_CORPUS.all().forEach(function (f) {
          if (!f.nda && f.project === result.locked.project && f.section === 'Trabajo') publico = f;
        });
        addNote('<strong>' + result.locked.project + '</strong> es un proyecto de cliente y está bajo NDA.' +
                (publico && publico.tagline ? ' Por encima: ' + publico.tagline : '') +
                ' El detalle está tras contraseña: ' +
                '<a href="' + result.locked.href + '">ábrelo en su página</a> si la tienes, ' +
                'o <a href="' + LINKEDIN + '" target="_blank" rel="noopener">pídemela por LinkedIn</a>.');
        return;
      }
      // Por debajo del umbral: se admite el límite y se ofrece salida
      // (ticket #16). Los temas salen del corpus real, no de una lista escrita.
      remember(null);
      var list = window.CHAT_CORPUS.topics().slice(0, 6);
      addNote('Eso no lo tengo documentado. Puedo contarte de <strong>' +
              list.join('</strong>, <strong>') + '</strong> — o puedes ' +
              '<a href="' + LINKEDIN + '" target="_blank" rel="noopener">escribirme por LinkedIn</a>.');
    }, wait);
  }

  // ---- apertura y cierre -----------------------------------------------------

  var started = false;

  function openPanel() {
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true;
      boot();
    }
    input.focus();
  }

  function closePanel() {
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  // El corpus se carga aquí y no al cargar la página (ticket #20): quien nunca
  // abra la burbuja no paga ninguna petición.
  function boot() {
    var typing = addTyping();
    window.CHAT_CORPUS.load().then(function () {
      typing.remove();
      addEmptyState();
      input.disabled = false;
    }).catch(function (e) {
      console.warn('[chat] no se pudo cargar el corpus', e);
      typing.remove();
      addNote('No he podido leer el contenido del sitio, así que ahora mismo no puedo responder. ' +
              'Prueba a recargar la página, o <a href="' + LINKEDIN + '" target="_blank" rel="noopener">escríbeme por LinkedIn</a>.');
      input.disabled = true;
    });
  }

  launcher.addEventListener('click', function () {
    if (panel.classList.contains('is-open')) closePanel(); else openPanel();
  });
  document.getElementById('cb-close').addEventListener('click', closePanel);

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
})();
