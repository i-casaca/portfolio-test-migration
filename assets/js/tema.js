/* La inversión de tema, conducida por el scroll (ticket #54).
 *
 * El claro no es una zona del documento: es **el mundo de los proyectos**. La
 * página entera se va invirtiendo conforme la lista de proyectos toma la
 * pantalla, y se deshace por los dos lados — subiendo al hero o bajando a
 * "Sobre mí".
 *
 * Este archivo escribe UNA custom property, `--t` (0 = oscuro, 1 = claro), y
 * nada más. Todos los colores del sitio se derivan de ella en site.css, así
 * que se recalculan en el mismo paso de estilo y no pueden desincronizarse.
 *
 * Es la corrección de la primera versión, que disparaba un volteo con
 * `transition` sobre cientos de elementos: cada uno arrancaba su animación en
 * un fotograma distinto y lo que no era color saltaba de golpe, con un
 * parpadeo escalonado bien visible. Aquí no hay ninguna transición CSS: el
 * scroll ES la línea de tiempo.
 *
 * Sin JavaScript, `--t` se queda en 0 y el sitio es oscuro de arriba abajo —
 * exactamente el que ya se publicaba. Degradación honesta: nada se rompe.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var indice = document.getElementById('trabajo');
  if (!indice) return;

  /* Umbrales de OCUPACIÓN: qué fracción de la pantalla cubre la lista.
   * Medir ocupación en vez de posición hace que las dos rampas —la de entrada
   * y la de salida— salgan simétricas solas, sin escribir dos cálculos: da
   * igual que la lista esté entrando por abajo o saliendo por arriba, lo que
   * cuenta es cuánto manda en pantalla. */
  var DESDE = 0.18;   /* asoma: empieza a invertir */
  var HASTA = 0.62;   /* manda en pantalla: inversión completa */

  /* Dónde salta la tinta. Calculado, no elegido a ojo: es el punto donde el
   * fondo a medio camino contrasta lo mismo con los dos extremos de tinta
   * (3,72:1 con el hueso, 3,67:1 con el negro), así que saltar ahí maximiza el
   * peor instante de todo el recorrido. Ver el comentario largo en site.css. */
  var SALTO_TINTA = 0.48;

  var ultimo = -1;
  var ultimoK = -1;

  function progreso() {
    var r = indice.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    var p = (visible / vh - DESDE) / (HASTA - DESDE);
    p = p < 0 ? 0 : (p > 1 ? 1 : p);
    /* Smoothstep: arranca y termina despacio. Lineal, la inversión "salía" y
     * "entraba" con un canto perceptible justo en los extremos, que es donde
     * el ojo está mirando. */
    return p * p * (3 - 2 * p);
  }

  function pintar() {
    var p = progreso();
    var k = p >= SALTO_TINTA ? 1 : 0;

    /* Cambiar una custom property heredada en la raíz invalida el estilo de
     * todo el documento, así que no se escribe si el cambio no se va a ver.
     * Menos de medio punto porcentual no lo distingue nadie. */
    if (Math.abs(p - ultimo) < 0.005 && k === ultimoK) return;
    ultimo = p;
    ultimoK = k;

    /* Los dos se escriben en el mismo turno, así que el navegador los resuelve
     * en un único recálculo de estilo: fondo y tinta nunca van desfasados ni
     * un fotograma. Ese desfase, multiplicado por cientos de elementos, era
     * exactamente el parpadeo de la primera versión. */
    root.style.setProperty('--t', p.toFixed(3));
    root.style.setProperty('--tk', String(k));
  }

  /* `prefers-reduced-motion` no apaga el cambio de tema —es estado, no
   * decoración—, pero sí lo saca del scroll: se resuelve a uno de los dos
   * extremos y no hay nada moviéndose por el camino. */
  var reducido = window.Motion
    ? window.Motion.reduced
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducido) {
    var fijar = function () {
      var v = progreso() >= SALTO_TINTA ? '1' : '0';
      root.style.setProperty('--t', v);
      root.style.setProperty('--tk', v);
    };
    window.addEventListener('scroll', fijar, { passive: true });
    window.addEventListener('resize', fijar);
    fijar();
    return;
  }

  /* Con GSAP presente, el scroll lo reparte ScrollTrigger, que es quien ya
   * está sincronizado con Lenis desde el #39 — engancharse aquí evita un
   * segundo listener compitiendo con el scroll suave. Sin GSAP, un listener
   * propio pasivo hace el mismo trabajo. */
  if (window.Motion && window.Motion.ready && window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: indice,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: pintar,
      onRefresh: pintar
    });
  } else {
    window.addEventListener('scroll', pintar, { passive: true });
    window.addEventListener('resize', pintar);
  }

  pintar();
})();
