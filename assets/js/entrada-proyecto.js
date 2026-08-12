/* Fase 2 de la entrada a una página de proyecto (ticket #55).
 *
 * El índice deja la foto del proyecto ocupando la pantalla entera y navega
 * (fase 1, en assets/js/indice.js). Aquí se recoge el testigo: la portada
 * aparece a pantalla completa, baja a su hueco de layout, y mientras tanto la
 * cabecera se enciende por partes.
 *
 * Por qué no lo hace una View Transition entre documentos: cuatro rondas de
 * diagnóstico demostraron que el navegador no captura la imagen flotante del
 * índice en el documento que sale. Se creaba `::view-transition-new(project-
 * cover)` pero nunca el `old` ni el grupo, así que no había nada que morfear y
 * lo que se veía era un fundido. Partirlo en dos animaciones —una dentro de
 * cada página— quita esa dependencia: ninguna necesita que la otra capture
 * nada, y funciona igual en cualquier navegador.
 *
 * Solo corre si se llega desde el índice. Entrando por URL directa, recargando
 * o volviendo atrás, este archivo no hace nada y la página es la de siempre.
 */
(function () {
  'use strict';

  var destino;
  try {
    destino = sessionStorage.getItem('entrada-proyecto');
    sessionStorage.removeItem('entrada-proyecto');
  } catch (e) { return; }
  if (!destino) return;

  /* La marca lleva el href que se pulsó. Se comprueba contra esta página para
   * que un testigo viejo no dispare la entrada en otro proyecto. */
  var aqui = location.pathname.split('/').pop();
  if (destino.split('/').pop() !== aqui) return;

  var portada = document.querySelector('.project-body .media:first-of-type');
  var foto = portada && portada.querySelector('img');
  if (!foto) return;

  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducido || !window.gsap) return;

  /* El velo se pinta ANTES de nada y encima de todo: es la continuación exacta
   * del fotograma con el que se dejó el índice, así que el cambio de documento
   * no se ve. Va con la foto ya cargada del `src` de la portada — el navegador
   * la sirve de caché, es la misma que se estaba mirando. */
  var velo = document.createElement('div');
  velo.setAttribute('aria-hidden', 'true');
  velo.style.cssText =
    'position:fixed;inset:0;z-index:9990;overflow:hidden;background:var(--bg);' +
    'will-change:transform';
  var clon = document.createElement('img');
  clon.src = foto.currentSrc || foto.src;
  clon.alt = '';
  clon.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
  velo.appendChild(clon);

  function arrancar() {
    var r = portada.getBoundingClientRect();
    document.body.appendChild(velo);
    /* La portada de verdad se oculta mientras el velo hace su viaje, y vuelve
     * justo al final. Con las dos visibles a la vez se veía doble. */
    portada.style.visibility = 'hidden';

    gsap.set(velo, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });
    gsap.to(velo, {
      left: r.left, top: r.top, width: r.width, height: r.height,
      duration: 0.72, ease: 'power3.inOut',
      onComplete: function () {
        portada.style.visibility = '';
        velo.remove();
      }
    });

    /* La cabecera se enciende por partes en vez de aparecer entera: el
     * escalonado es lo que hace que se lea como que la página se está armando,
     * no como un fundido. Empieza cuando el velo ya ha arrancado su viaje. */
    var piezas = [].slice.call(document.querySelectorAll(
      '.project-header .eyebrow, .project-header h1, .project-header .meta-row > *'
    ));
    if (piezas.length) {
      gsap.set(piezas, { opacity: 0 });
      gsap.to(piezas, {
        opacity: 1, duration: 0.24, ease: 'none',
        stagger: { each: 0.07, from: 'start' }, delay: 0.18
      });
    }
  }

  /* Antes de medir hay que tener el layout asentado: la portada declara
   * `width`/`height` en el <img>, así que su hueco existe desde el parseo, pero
   * las fuentes mueven la cabecera de arriba y con ella la posición final. Es
   * el mismo motivo por el que motion.js espera a `document.fonts.ready`. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar, { once: true });
  } else {
    arrancar();
  }
})();
