/* Aparición de las imágenes al entrar en pantalla, sobre ScrollTrigger.
 *
 * El estado oculto lo pone el CSS bajo `html.js`, así que si este script no
 * llega a ejecutarse las imágenes se ven igual (ver site.css). Aquí solo se
 * anima la entrada de cada una cuando asoma por el viewport.
 */
(function () {
  'use strict';

  /* La portada del proyecto se queda fuera del reveal: vive por encima del
   * pliegue y es el destino de la fase 2 de la transición
   * (assets/js/entrada-proyecto.js), así que revelarla por scroll la dejaba
   * invisible justo cuando tenía que estar ahí.
   *
   * OJO (revisado en el ticket #46): este filtro **ya no filtra nada**. Se
   * escribió cuando la portada llevaba `view-transition-name: project-cover`,
   * y el #55 retiró ese nombre del sitio entero al sacar la ida de las View
   * Transitions. Hoy quien de verdad deja la portada visible es la regla
   * `html.js .project-body .media:first-of-type` de site.css, no esta línea.
   * Se conserva —es inocua: este script solo anima HACIA visible— porque
   * quitarla ahora tocaría el reveal de las cinco páginas sin necesidad, y
   * porque la vuelta proyecto→índice sigue pendiente de decidir si recupera el
   * morfismo de la foto. Si se recupera, el nombre vuelve aquí y el filtro
   * vuelve a tener sentido; si se descarta, esta línea se va con él. */
  var els = [].slice.call(document.querySelectorAll('.media'))
    .filter(function (el) { return getComputedStyle(el).viewTransitionName !== 'project-cover'; });
  if (!els.length) return;

  function revealAll() {
    els.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var M = window.Motion;

  // Sin Motion.js (el CDN de GSAP no respondió), o si se pide menos
  // movimiento, se muestran ya: el sitio nunca deja una imagen invisible
  // esperando a una librería que no ha llegado.
  if (!M || !M.ready || M.reduced) {
    revealAll();
    return;
  }

  /* Los triggers se crean con `once:true`: si se calculan contra un
   * documento que todavía no ha asentado su alto real (fuentes servidas con
   * `display=swap`, imágenes `loading="lazy"` con su hueco reservado pero el
   * layout aún recalculando), pueden darse por "ya cruzados" antes de
   * tiempo, disparar la animación de golpe y autodestruirse — un refresh
   * posterior no revive un trigger `once` que ya se mató. Por eso se espera
   * a que carguen los recursos de la página Y las fuentes antes de crear
   * ninguno, en vez de crearlos ya y corregirlos después. */
  function createTriggers() {
    els.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: M.dur.enter,
        ease: M.ease.enter,
        scrollTrigger: {
          trigger: el,
          // Se dispara un poco antes de que la imagen llegue al borde
          // inferior, para que el movimiento acompañe al scroll en vez de
          // ir por detrás.
          start: 'top 88%',
          once: true
        }
      });
    });
  }

  var loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(function (resolve) { window.addEventListener('load', resolve); });
  var fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();

  Promise.all([loaded, fontsReady]).then(createTriggers);
})();
