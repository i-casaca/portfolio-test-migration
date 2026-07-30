/* Aparición de las imágenes al entrar en pantalla.
 *
 * El estado oculto lo pone el CSS bajo `html.js`, así que si este script no
 * llega a ejecutarse las imágenes se ven igual (ver site.css). Aquí solo se
 * marca cada una como visible cuando asoma por el viewport.
 */
(function () {
  'use strict';

  var pending = [].slice.call(document.querySelectorAll('.media'));
  if (!pending.length) return;

  function reveal(el) {
    el.classList.add('is-visible');
    var i = pending.indexOf(el);
    if (i > -1) pending.splice(i, 1);
  }

  function revealAll() {
    while (pending.length) reveal(pending[0]);
  }

  // Sin IntersectionObserver, o si se pide menos movimiento, se muestran ya.
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealAll();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      io.unobserve(entries[i].target);
      reveal(entries[i].target);
    }
  }, {
    // Se dispara un poco antes de que la imagen llegue al borde inferior, para
    // que el movimiento acompañe al scroll en vez de ir por detrás.
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.05
  });

  for (var i = 0; i < pending.length; i++) io.observe(pending[i]);

  /* Red de seguridad. El observador solo avisa cuando algo ENTRA en pantalla,
   * y hay saltos en los que una imagen pasa de estar por debajo a estar por
   * encima sin llegar a asomar: recargar a media página (el navegador restaura
   * el scroll después de montar el observador), o abrir la página con un ancla.
   * Esas imágenes se quedarían invisibles para siempre, así que lo que ya ha
   * quedado atrás se da por visto. */
  var queued = false;

  function sweepAbove() {
    queued = false;
    for (var i = pending.length - 1; i >= 0; i--) {
      if (pending[i].getBoundingClientRect().bottom < 0) {
        io.unobserve(pending[i]);
        reveal(pending[i]);
      }
    }
    if (!pending.length) {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    }
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sweepAbove);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', sweepAbove);
})();
