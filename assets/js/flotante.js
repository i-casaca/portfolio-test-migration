/* La imagen que persigue al cursor con retardo.
 *
 * Decidida y construida en el hover del índice
 * (ticket #55, assets/js/indice.js). Sale a su propio archivo en el #56, cuando
 * la navegación entre proyectos —Prev/Next al pie de cada página de proyecto—
 * pide el mismo objeto: son dos sitios, así que o se comparte o se duplica.
 *
 * Aquí vive SOLO el seguimiento: el retardo, la suma del scroll y el clamp
 * contra los bordes. Lo que cuelga de él en cada página se queda en su archivo
 * —el muro de NDA y la fase 1 de la transición en `indice.js`, el barrido de
 * nombres en `nav-proyecto.js`—, porque eso sí es distinto en cada sitio.
 *
 * Necesita GSAP. Sin él devuelve `null` y quien llama sigue sin seguimiento;
 * el contrato del mapa desde el #39 es que si el CDN no responde nadie se cae.
 */
(function () {
  'use strict';

  /* El desfase saca la imagen de debajo del cursor: centrada, el propio puntero
   * tapa el centro de la foto y el `#cursor-dot` invierte justo ahí. */
  var DX = 28, DY = 24;
  var MARGEN = 16;

  function crear(el, opciones) {
    if (!el || !window.gsap) return null;
    var o = opciones || {};
    var dx = o.dx == null ? DX : o.dx;
    var dy = o.dy == null ? DY : o.dy;

    /* `quickTo` en vez de un tween por evento: devuelve una función que reapunta
     * el mismo tween en marcha, así que no se crean objetos en cada
     * `pointermove`. El retardo (0,55 s con `power3`) es lo que hace que la
     * imagen "persiga" en vez de ir pegada — pegada al cursor no se lee como un
     * objeto, se lee como parte del puntero. */
    var pos = { x: -9999, y: -9999 };
    var toX = gsap.quickTo(pos, 'x', { duration: 0.55, ease: 'power3' });
    var toY = gsap.quickTo(pos, 'y', { duration: 0.55, ease: 'power3' });

    var pausado = false;

    /* El retardo se anima sobre un OBJETO, no sobre el elemento, y el
     * `transform` lo escribe el ticker sumando el scroll.
     *
     * Por qué así: la imagen no es `position:fixed` —eso era lo que impedía el
     * morfismo de ida en el #55— y una absoluta se queda quieta en el documento
     * mientras la página se mueve. Sumando `scrollY` en cada fotograma se
     * comporta igual a la vista, pero el elemento que el navegador captura es
     * una caja normal.
     *
     * Animar el objeto y no el elemento es lo que permite que el retardo viva en
     * coordenadas de pantalla y el scroll se aplique después, sin que una cosa
     * arrastre a la otra. */
    gsap.ticker.add(function () {
      /* Pausado, manda quien haya tomado el control (en el índice, la fase 1 de
       * la transición, que escribe `left`/`top`/`width`/`height` a pelo). Si el
       * ticker siguiera pisando el `transform`, las dos se pelearían. */
      if (pausado) return;
      el.style.transform =
        'translate3d(' + (pos.x + window.scrollX) + 'px,' + (pos.y + window.scrollY) + 'px,0)';
    });

    /* La imagen no puede salirse de la pantalla. Sin esto, al apuntar las filas
     * de abajo se iba por el borde inferior y desaparecía justo cuando se estaba
     * mirando — el objeto perdía su razón de ser.
     *
     * El efecto secundario es el que se busca: cuando el cursor sigue bajando y
     * la imagen ya no puede, **se queda pegada al borde y el cursor se separa de
     * ella**. Esa distancia creciente se lee como peso. */
    function encajar(v, tam, limite) {
      var max = limite - tam - MARGEN;
      if (max < MARGEN) return (limite - tam) / 2;   // pantallas menores que la imagen
      return v < MARGEN ? MARGEN : (v > max ? max : v);
    }

    /* Único punto por el que se mueve la imagen. `yaEncajado` lo usa el foco de
     * teclado, que calcula su sitio a partir de la fila y no necesita clamp. */
    function colocar(x, y, yaEncajado) {
      if (yaEncajado) { toX(x); toY(y); return; }
      toX(encajar(x, el.offsetWidth, window.innerWidth));
      toY(encajar(y, el.offsetHeight, window.innerHeight));
    }

    window.addEventListener('pointermove', function (e) {
      colocar(e.clientX + dx, e.clientY + dy);
    }, { passive: true });

    return {
      colocar: colocar,
      /* Ceder o recuperar el control del `transform`. Al pausar se matan los
       * tweens en vuelo, o al reanudar la imagen daría un salto hacia donde
       * apuntaba el tween antiguo. */
      pausar: function (v) {
        pausado = !!v;
        if (pausado) gsap.killTweensOf(pos);
      },
      /* El bfcache devuelve el documento tal cual se dejó, incluidos los estilos
       * inline que se pusieron "solo un momento". Ya costó una ronda de
       * diagnóstico en el #55: la lección es no dejar estado inline que
       * sobreviva a una navegación, y si se deja, limpiarlo a mano. */
      reset: function () {
        pausado = false;
        el.style.cssText = '';
      }
    };
  }

  window.Flotante = { crear: crear };
})();
