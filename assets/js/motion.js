/* Cimientos de motion: registra los plugins de GSAP, engancha Lenis a su
 * ticker, y publica `window.Motion` — la tabla de eases/duraciones y el
 * estado de `prefers-reduced-motion` que el resto de scripts del sitio
 * (reveal.js hoy; la entrada y las transiciones de página después) leen en
 * vez de repetir cada uno su propia media query o sus propios números.
 *
 * Si el CDN de GSAP no responde, este script no encuentra `window.gsap` y no
 * hace nada: `Motion.ready` se queda en `false` y quien lo consulte cae a su
 * alternativa sin animación. El sitio nunca depende de que esto cargue.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!(window.gsap && window.gsap.registerPlugin);

  if (hasGSAP) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.TextPlugin) gsap.registerPlugin(TextPlugin);
  }

  /* Las seis páginas cargan Google Fonts con `display=swap` y varias
   * imágenes con `loading="lazy"`: si un trigger se crea antes de que las
   * fuentes o esas imágenes asienten el layout, ScrollTrigger calcula su
   * posición contra un documento más corto de lo que será — y puede darlo
   * por "ya cruzado" antes de tiempo. Un refresh cuando fuentes e imágenes
   * están listas corrige esa posición para cualquier trigger que exista en
   * ese momento, sin que cada script que cree uno tenga que ocuparse de esto. */
  if (hasGSAP && window.ScrollTrigger) {
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  window.Motion = {
    reduced: reduced,
    ready: hasGSAP,

    /* Punto de partida propuesto en el ticket #39. `move` es para
     * transiciones de página y cambios de tamaño, no para entradas/salidas
     * de contenido. `back`/`elastic` no llevan token propio a propósito:
     * son toques de personalidad puntuales, nunca un default que otro
     * ticket pueda coger sin pensarlo. */
    ease: {
      enter: 'power3.out',
      exit: 'power3.in',
      move: 'power2.inOut'
    },
    dur: {
      enter: 0.8,
      exit: 0.5,
      move: 0.6
    }
  };

  if (reduced || !hasGSAP || !window.Lenis) return;

  var lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger ? ScrollTrigger.update : function () {});
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Expuesto para quien necesite bloquear el scroll (la entrada, #40) o
  // saltar a un punto concreto (las transiciones de página, #42), en vez de
  // que cada ticket cree su propia instancia de Lenis.
  window.Motion.lenis = lenis;
})();
