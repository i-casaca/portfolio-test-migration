/* Las letras de aeropuerto: un texto que barre el alfabeto y se asienta de
 * izquierda a derecha.
 *
 * Decidido y construido en el hover del índice
 * (ticket #55, assets/js/indice.js). Sale a su propio archivo en el #56, cuando
 * la navegación entre proyectos —Prev/Next al pie de cada página de proyecto—
 * pide el mismo gesto: son dos sitios, así que o se comparte o se duplica, y
 * duplicar es exactamente lo que este ticket acaba de deshacer con el CSS del
 * muro de NDA.
 *
 * `window.Flap` expone las tres piezas por separado a propósito, porque cada
 * una tiene su momento: `preparar` trocea (una vez, al montar), `medir` congela
 * los anchos (cuando las fuentes están listas, y otra vez al redimensionar) y
 * `barrer` anima (en cada hover). Mezclarlas fue justo el fallo del #55.
 */
(function () {
  'use strict';

  var ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* El barrido no puede mover el layout. Roboto Flex no es monoespaciada, así
   * que cambiar una letra por otra cambia el ancho de la palabra y arrastra lo
   * que tenga al lado. Por eso cada carácter se envuelve en un <span> al que
   * `medir` le fija SU ancho natural: el glifo de dentro cambia, la caja no.
   *
   * Devuelve las celdas; quien llama las guarda para medirlas y barrerlas. */
  function preparar(el) {
    var texto = el.textContent;
    var frag = document.createDocumentFragment();
    var celdas = [];

    texto.split('').forEach(function (ch) {
      var s = document.createElement('span');
      s.className = 'flap';
      s.textContent = ch;
      frag.appendChild(s);
      celdas.push({ el: s, final: ch });
    });

    el.textContent = '';
    el.appendChild(frag);
    return celdas;
  }

  /* Medir es un paso aparte de trocear, y **cuándo** se mide fue un fallo real
   * del #55: midiendo al arrancar, la fuente todavía no había cargado (va con
   * `display=swap`), así que cada celda se quedaba con el ancho de la fuente de
   * reserva —más ancha— y al llegar la buena los glifos bailaban dentro de
   * cajas grandes. En móvil se veía clarísimo: "M a n u   C a r d i e l".
   *
   * Se mide con `document.fonts.ready`, y se vuelve a medir al cambiar el
   * tamaño, porque estos cuerpos son fluidos (`clamp(...,vw,...)`): un ancho
   * congelado en píxeles deja de valer en cuanto cambia el viewport. */
  function medir(celdas) {
    celdas.forEach(function (c) { c.el.style.width = 'auto'; });
    celdas.forEach(function (c) {
      c.el.style.width = c.el.getBoundingClientRect().width + 'px';
    });
  }

  /* Un solo rAF para todas las celdas, no un temporizador por letra: es la
   * misma razón por la que la inversión del #54 se mueve con un solo número. N
   * relojes independientes se desincronizan y el efecto se deshilacha. */
  function barrer(celdas, opciones) {
    var o = opciones || {};
    var DUR = o.dur || 520;          // ms hasta que la última letra se asienta
    var ESCALON = o.escalon || 34;   // ms de retraso por letra: barre de izquierda a derecha
    var t0 = null;

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

  window.Flap = { preparar: preparar, medir: medir, barrer: barrer };
})();
