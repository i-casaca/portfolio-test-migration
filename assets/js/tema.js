/* El volteo de tema (ticket #54).
 *
 * El claro no es una zona del documento: es **el mundo de los proyectos**. La
 * página entera se invierte cuando la lista de proyectos manda en pantalla, y
 * vuelve a oscuro por los dos lados — subiendo al hero o bajando a "Sobre mí".
 * Por eso el atributo va en `<html>` y no en las secciones.
 *
 * Umbral, no fregado: se cruza y voltea con su propia transición (ver
 * `.tema-volteando` en site.css), y se queda. Decidido con Ismael: fregar la
 * inversión contra el scroll deja la página en grises intermedios, donde el
 * contraste no está medido y el texto pierde legibilidad justo mientras se
 * mueve.
 *
 * Sin JavaScript no hay volteo y el sitio se queda oscuro de arriba abajo —
 * que es exactamente el sitio que ya se publicaba. Es una degradación honesta:
 * nada se rompe y nada se vuelve ilegible.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var indice = document.getElementById('trabajo');
  if (!indice) return;

  var reducido = window.Motion ? window.Motion.reduced : false;
  var volteo = null;

  function aplicar(claro) {
    if ((root.dataset.tema === 'claro') === claro) return;

    /* La clase de transición se pone ANTES de cambiar el atributo, o el
     * navegador ya habría resuelto los colores nuevos sin nada que
     * interpolar. */
    if (!reducido) {
      root.classList.add('tema-volteando');
      clearTimeout(volteo);
      volteo = setTimeout(function () {
        root.classList.remove('tema-volteando');
      }, 450);
    }

    if (claro) root.dataset.tema = 'claro';
    else delete root.dataset.tema;
  }

  /* Sin GSAP no hay ScrollTrigger, y el sitio se queda en oscuro. Mismo
   * contrato que el resto de scripts desde el #39: si el CDN no responde,
   * nadie se cae. */
  if (!window.Motion || !window.Motion.ready || !window.ScrollTrigger) return;

  /* `top 40%` / `bottom 40%`: el claro vive mientras la lista cubre la pantalla
   * de su cuarenta por ciento hacia abajo — es decir, cuando ya ocupa el grueso
   * del viewport y apuntar un proyecto es posible sin seguir bajando. Las dos
   * marcas son simétricas a propósito: el mismo punto geométrico decide el
   * volteo se llegue desde el hero o desde "Sobre mí", así que subir deshace el
   * camino exactamente por donde se hizo.
   *
   * ScrollTrigger da los cuatro cruces que hacen falta —entrar y salir por cada
   * lado— sin que haya que escribir a mano ni el cálculo de solape ni la
   * histéresis: el propio trigger no vuelve a disparar dentro de su tramo. */
  ScrollTrigger.create({
    trigger: indice,
    start: 'top 40%',
    end: 'bottom 40%',
    onEnter:     function () { aplicar(true); },
    onEnterBack: function () { aplicar(true); },
    onLeave:     function () { aplicar(false); },
    onLeaveBack: function () { aplicar(false); }
  });
})();
