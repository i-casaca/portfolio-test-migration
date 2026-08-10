/* El hover del índice de proyectos (ticket #55): la imagen flotante ligada al
 * cursor, y las letras de aeropuerto del nombre.
 *
 * Vive en su propio archivo y no en el <script> inline de index.html porque
 * necesita GSAP: el inline corre antes de que los `defer` del <head> hayan
 * terminado, así que allí no hay garantía de que `gsap` exista. Aquí sí — este
 * archivo es también `defer` y va detrás de motion.js en el documento.
 *
 * Degradación: sin JS, sin GSAP o sin puntero fino, el índice sigue siendo
 * cinco enlaces legibles y clicables, con su miniatura en táctil. Nada del
 * contenido depende de esto.
 */
(function () {
  'use strict';

  var indice = document.getElementById('project-index');
  var flotante = document.getElementById('index-float');
  if (!indice || !flotante) return;

  var img = flotante.querySelector('img');
  var items = Array.prototype.slice.call(indice.querySelectorAll('.index-item'));
  if (!items.length) return;

  var reducido = window.Motion
    ? window.Motion.reduced
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Las fotos que ya estaban en el HTML como <img> apiladas ahora son solo
   * rutas. Se precargan al vuelo: sin esto, la primera fila que se apunta
   * cambia el `src` y la imagen tarda en llegar, que es justo el momento en
   * que se está mirando. */
  var fotos = items.map(function (item) {
    var src = item.getAttribute('data-foto');
    if (src) { var p = new Image(); p.src = src; }
    return src;
  });

  // ---------------------------------------------------------------- flotante

  var activo = -1;

  function mostrar(i) {
    if (i === activo) return;
    activo = i;
    img.src = fotos[i];
    flotante.classList.add('is-on');
  }

  function esconder() {
    activo = -1;
    flotante.classList.remove('is-on');
  }

  /* Sin GSAP no hay seguimiento ni colocación, pero el resto del archivo —las
   * letras de aeropuerto— tiene que seguir funcionando. El contrato del mapa
   * desde el #39 es que si el CDN no responde nadie se cae; una llamada suelta
   * a `gsap.set` más abajo lanzaría y se llevaría por delante el barrido. */
  var hayGsap = !!window.gsap;

  if (hayGsap && punteroFino && !reducido) {
    /* `quickTo` en vez de un tween por evento: devuelve una función que
     * reapunta el mismo tween en marcha, así que no se crean objetos en cada
     * `pointermove`. El retardo (0,55 s con `power3`) es lo que hace que la
     * imagen "persiga" en vez de ir pegada — pegada al cursor no se lee como
     * un objeto, se lee como parte del puntero. */
    var toX = gsap.quickTo(flotante, 'x', { duration: 0.55, ease: 'power3' });
    var toY = gsap.quickTo(flotante, 'y', { duration: 0.55, ease: 'power3' });

    /* El desfase saca la imagen de debajo del cursor: centrada, el propio
     * puntero tapa el centro de la foto y el `#cursor-dot` invierte justo ahí. */
    var DX = 28, DY = 24;

    window.addEventListener('pointermove', function (e) {
      toX(e.clientX + DX);
      toY(e.clientY + DY);
    }, { passive: true });

    items.forEach(function (item, i) {
      item.addEventListener('pointerenter', function () { mostrar(i); });
    });
    /* Un solo listener en el <nav> en vez de cinco `pointerleave`: salir de una
     * fila para entrar en la de al lado no debe apagar nada, y con listeners
     * por fila hay un fotograma en que ninguna está activa y la imagen
     * parpadea. Se apaga solo al salir del índice entero. */
    indice.addEventListener('pointerleave', esconder);
  }

  /* Con teclado no hay cursor que seguir, pero sí hace falta que la imagen
   * exista: es el origen del morfismo a la página de proyecto (#42). Se coloca
   * sobre la fila enfocada, quieta. Sin esto, navegar con teclado y pulsar
   * Enter no tendría foto que transformar. */
  items.forEach(function (item, i) {
    item.addEventListener('focus', function () {
      var r = item.getBoundingClientRect();
      var x = r.right - flotante.offsetWidth - 24;
      var y = r.top + 8;
      /* `gsap.set` cuando está, `style.transform` cuando no: el segundo camino
       * no es un apaño, es el que se usa sin GSAP, y tiene que dejar la imagen
       * en el mismo sitio para que el morfismo salga desde donde se ve. */
      if (hayGsap) gsap.set(flotante, { x: x, y: y });
      else flotante.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      mostrar(i);
    });
    item.addEventListener('blur', esconder);
  });

  // ------------------------------------------------- letras de aeropuerto

  /* El barrido no puede mover el layout. Roboto Flex no es monoespaciada, así
   * que cambiar una letra por otra cambia el ancho de la palabra y arrastra la
   * fila entera — y el alto del hero está calculado para que asome media fila
   * (#51), o sea que un temblor aquí se propaga hasta arriba.
   *
   * Por eso cada carácter se envuelve en un <span> al que se le fija SU ancho
   * natural antes de animar nada. El glifo de dentro cambia; la caja no. */
  var ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function preparar(nombre) {
    var texto = nombre.textContent;
    var frag = document.createDocumentFragment();
    var celdas = [];

    texto.split('').forEach(function (ch) {
      var s = document.createElement('span');
      s.className = 'flap';
      s.textContent = ch;
      frag.appendChild(s);
      celdas.push({ el: s, final: ch });
    });

    nombre.textContent = '';
    nombre.appendChild(frag);

    /* Se mide DESPUÉS de insertar, con la tipografía ya aplicada, y se fija en
     * píxeles. Medir antes daría el ancho de la fuente de reserva. */
    celdas.forEach(function (c) {
      c.el.style.width = c.el.getBoundingClientRect().width + 'px';
    });
    return celdas;
  }

  function barrer(celdas) {
    /* Un solo rAF para todas las celdas de la fila, no un temporizador por
     * letra: es la misma razón por la que la inversión del #54 se mueve con un
     * solo número. N relojes independientes se desincronizan y el efecto se
     * deshilacha. */
    var t0 = null;
    var DUR = 520;          // ms hasta que la última letra se asienta
    var ESCALON = 34;       // ms de retraso por letra: el barrido corre de izquierda a derecha

    function paso(ahora) {
      if (t0 === null) t0 = ahora;
      var t = ahora - t0;
      var vivos = 0;

      for (var i = 0; i < celdas.length; i++) {
        var c = celdas[i];
        if (c.final === ' ') continue;
        var propio = t - i * ESCALON;
        if (propio < 0) { vivos++; continue; }
        if (propio >= DUR) { c.el.textContent = c.final; continue; }
        vivos++;
        /* Cuanto más cerca del final, menos probable que siga girando: la
         * letra se "asienta" en vez de pararse de golpe. */
        if (Math.random() < propio / DUR) c.el.textContent = c.final;
        else c.el.textContent = ALFABETO[(Math.random() * ALFABETO.length) | 0];
      }

      if (vivos) requestAnimationFrame(paso);
      else celdas.forEach(function (c) { c.el.textContent = c.final; });
    }

    requestAnimationFrame(paso);
  }

  if (!reducido) {
    items.forEach(function (item) {
      var nombre = item.querySelector('.index-name');
      if (!nombre) return;
      var celdas = preparar(nombre);
      var corriendo = false;

      var lanzar = function () {
        if (corriendo) return;
        corriendo = true;
        barrer(celdas);
        /* El bloqueo dura lo que el barrido: sin él, mover el ratón dentro de
         * la misma fila relanzaría el efecto y el nombre no llegaría a
         * asentarse nunca. */
        setTimeout(function () { corriendo = false; }, 900);
      };

      item.addEventListener('pointerenter', lanzar);
      item.addEventListener('focus', lanzar);
    });
  }
})();
