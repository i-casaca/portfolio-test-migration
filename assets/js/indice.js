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
    var MARGEN = 16;

    /* La imagen no puede salirse de la pantalla. Sin esto, al apuntar las
     * filas de abajo se iba por el borde inferior y desaparecía justo cuando
     * se estaba mirando — el objeto perdía su razón de ser.
     *
     * El efecto secundario es el interesante y es el que se busca: cuando el
     * cursor sigue bajando y la imagen ya no puede, **se queda pegada al borde
     * y el cursor se separa de ella**. Esa distancia creciente entre puntero e
     * imagen se lee como resistencia, como si el objeto tuviera peso y
     * estuviera topando contra el marco. */
    function encajar(v, tam, limite) {
      var max = limite - tam - MARGEN;
      if (max < MARGEN) return (limite - tam) / 2;   // pantallas más pequeñas que la imagen
      return v < MARGEN ? MARGEN : (v > max ? max : v);
    }

    window.addEventListener('pointermove', function (e) {
      var w = flotante.offsetWidth, h = flotante.offsetHeight;
      toX(encajar(e.clientX + DX, w, window.innerWidth));
      toY(encajar(e.clientY + DY, h, window.innerHeight));
    }, { passive: true });

    items.forEach(function (item, i) {
      item.addEventListener('pointerenter', function () { mostrar(i); });
    });

    /* Se congela la imagen en coordenadas de DOCUMENTO justo antes de navegar.
     *
     * Por qué: la transición de vuelta (proyecto → índice) sí morfea, y la de
     * ida no. La asimetría señala al lado que se va: al volver, el índice se
     * restaura desde bfcache con la imagen todavía encendida, así que el
     * elemento con nombre está en el documento que LLEGA y es de flujo normal;
     * al ir, el elemento con nombre está en el documento que SALE y es
     * `position:fixed` con un transform de GSAP encima. Es lo único
     * estructural que cambió respecto al #42, que sí morfeaba: allí el nombre
     * vivía en una imagen `absolute` dentro del flujo.
     *
     * Esto lo deja exactamente donde se ve —misma posición, mismo tamaño— pero
     * como caja de flujo sin transform, que es lo que el #42 capturaba bien.
     * Solo en el clic que de verdad navega: con modificadores o botón central
     * el navegador abre en otra pestaña y esta no se descarga. */
    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!flotante.classList.contains('is-on')) return;
        var r = flotante.getBoundingClientRect();
        flotante.style.position = 'absolute';
        flotante.style.transform = 'none';
        flotante.style.left = (r.left + window.scrollX) + 'px';
        flotante.style.top = (r.top + window.scrollY) + 'px';
        flotante.style.width = r.width + 'px';
        flotante.style.height = r.height + 'px';
      });
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
    return celdas;
  }

  /* Medir es un paso aparte de trocear, y **cuándo** se mide fue un fallo real:
   * midiendo al arrancar, Roboto Flex todavía no había cargado (va con
   * `display=swap`), así que cada celda se quedaba con el ancho de la fuente de
   * reserva —más ancha— y al llegar la buena los glifos bailaban dentro de
   * cajas grandes. En móvil se veía clarísimo: "M a n u   C a r d i e l".
   *
   * Se mide con `document.fonts.ready`, igual que motion.js hace con
   * ScrollTrigger y por el mismo motivo. Y se vuelve a medir al cambiar el
   * tamaño, porque el cuerpo del nombre es fluido (`clamp(...,6vw,...)`): un
   * ancho congelado en píxeles deja de valer en cuanto cambia el viewport. */
  function medir(celdas) {
    celdas.forEach(function (c) { c.el.style.width = 'auto'; });
    celdas.forEach(function (c) {
      c.el.style.width = c.el.getBoundingClientRect().width + 'px';
    });
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

  /* Solo se trocea el nombre donde el barrido puede ocurrir. En táctil no hay
   * hover que lo dispare, así que partir el título en celdas allí no aporta
   * nada y sí puede romper: es el reparto en `<span>` lo que hacía que el
   * nombre se desmontara en móvil. Sin puntero fino, el título se queda como
   * un texto normal. */
  if (!reducido && punteroFino) {
    var todas = [];

    items.forEach(function (item) {
      var nombre = item.querySelector('.index-name');
      if (!nombre) return;
      var celdas = preparar(nombre);
      todas.push(celdas);
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

    var medirTodas = function () { todas.forEach(medir); };

    /* Con las fuentes ya resueltas. `document.fonts.ready` cumple igual si la
     * fuente ya estaba en caché, así que no hace falta distinguir el caso. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirTodas);
    else medirTodas();

    var t = null;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(medirTodas, 150);
    });
  }
})();
