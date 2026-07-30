/* Transición entre páginas.
 *
 * Ida (este archivo): al pulsar un enlace interno, un panel casi negro sube
 * desde abajo, aparece el spinner, y solo entonces se salta a la página nueva.
 *
 * Vuelta: NO se hace aquí. El panel de entrada es una animación CSS pura
 * (`html.pt-cover::after` en site.css) que se destapa sola. Así, si este script
 * falla o tarda, la página nueva nunca se queda con la pantalla negra puesta.
 */
(function () {
  'use strict';

  // Quien pide menos movimiento navega directamente, sin panel ni espera.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var COVER_MS = 400; // lo que tarda el panel en cubrir la pantalla
  var HOLD_MS = 350;  // spinner a la vista antes de saltar (total < 1 s)

  var overlay = null;
  var leaving = false;

  function buildOverlay() {
    var el = document.createElement('div');
    el.id = 'pt';
    el.setAttribute('aria-hidden', 'true');

    // Seis celdas: la misma rejilla del hero, en miniatura.
    var spinner = document.createElement('div');
    spinner.className = 'pt-spinner';
    for (var i = 0; i < 6; i++) spinner.appendChild(document.createElement('span'));

    el.appendChild(spinner);
    document.body.appendChild(el);
    return el;
  }

  /* Devuelve la URL de destino si el enlace es una navegación interna que
   * merece transición, o false en cualquier otro caso (anclas de la misma
   * página, descarga del CV, enlaces externos...). */
  function internalTarget(a) {
    if (!a || !a.href) return false;
    if (a.hasAttribute('download')) return false;
    if (a.target && a.target !== '_self') return false;

    var raw = a.getAttribute('href') || '';
    if (!raw || raw.charAt(0) === '#') return false;

    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return false; }

    if (url.origin !== location.origin) return false;
    if (!/\.html?$/.test(url.pathname) && !/\/$/.test(url.pathname)) return false;
    // Mismo documento y solo cambia el ancla: es un scroll, no una navegación.
    if (url.pathname === location.pathname && url.search === location.search) return false;

    return url.href;
  }

  document.addEventListener('click', function (e) {
    if (leaving || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    var dest = internalTarget(a);
    if (!dest) return;

    e.preventDefault();
    leaving = true;

    if (!overlay) overlay = buildOverlay();
    // Fuerza un reflow: sin esto el navegador puede fusionar la creación del
    // elemento y el cambio de clase, y el panel aparecería de golpe.
    void overlay.offsetWidth;
    overlay.classList.add('is-in');

    // La marca que le dice a la página siguiente que entre tapada.
    try { sessionStorage.setItem('pt-nav', '1'); } catch (err) {}

    setTimeout(function () { location.href = dest; }, COVER_MS + HOLD_MS);
  });

  // Al volver con el botón atrás, el navegador puede restaurar la página tal
  // como estaba: con el panel puesto y a medio salir. Hay que destaparla.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    leaving = false;
    if (overlay) overlay.classList.remove('is-in');
    try { sessionStorage.removeItem('pt-nav'); } catch (err) {}
  });
})();
