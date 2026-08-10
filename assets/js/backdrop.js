/* La mancha del fondo (ticket #53): una silueta orgánica que persigue al
 * puntero e invierte el color de lo que cubre.
 *
 * El aspecto lo pone el CSS (#backdrop-blob en site.css: blur + contrast
 * sobre varios círculos blancos, y mix-blend-mode:difference para invertir).
 * Aquí solo se mueven los círculos: cada uno persigue la posición del ratón
 * con un retardo distinto, y el desfase entre ellos es lo que estira la
 * mancha cuando el ratón corre y la vuelve redonda cuando se para.
 *
 * Mejora progresiva de arriba abajo: si este archivo no carga, no se ejecuta
 * o el navegador no tiene puntero fino, la página es exactamente la de antes.
 * Nada del contenido depende de esto.
 */
(function () {
  'use strict';

  var BALLS = 7;

  /* Sin puntero fino (móvil, tableta) no hay nada que seguir, y el filtro de
   * la capa es caro. El CSS oculta la capa con la misma condición; esto evita
   * además construir los nodos y arrancar el bucle. */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduced = window.Motion
    ? window.Motion.reduced
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!fine || reduced) return;

  var layer = document.getElementById('backdrop-blob');
  if (!layer) return;

  /* El filtro que funde los círculos en una silueta. Va inyectado y no en las
   * seis páginas porque es andamiaje del efecto, no contenido.
   *
   * Por qué SVG y no `blur() contrast()` de CSS: sobre un fondo transparente,
   * el `contrast()` de CSS no umbraliza el canal alfa — se probó y los
   * círculos se quedaban sueltos, como un collar de perlas. Lo que los funde
   * es la última fila de la feColorMatrix, que multiplica el alfa: donde dos
   * desenfoques se solapan el alfa sube lo suficiente para pasar el umbral, y
   * ahí es donde nace el istmo entre dos lóbulos.
   *
   * Los dos números salen de una revisión en vivo con Ismael, sobre el sitio
   * real y con un medidor de fps delante. Un `stdDeviation` alto (28) con un
   * multiplicador de alfa BAJO (8) es lo que da el borde con halo en vez del
   * canto duro: el umbral se cruza despacio, así que el filo se difumina.
   * Con multiplicadores altos (se probó 26) la silueta salía recortada a
   * cuchillo, y sobre el fondo cálido leía como un pegote, no como niebla.
   *
   * `color-interpolation-filters="sRGB"` no es opcional: el valor por defecto
   * (linearRGB) recalcula el desenfoque en otro espacio y devuelve un borde
   * lechoso en vez de limpio. */
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('style', 'position:absolute');
  svg.innerHTML =
    '<filter id="blob-goo" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">' +
    '<feGaussianBlur in="SourceGraphic" stdDeviation="28" result="b"/>' +
    '<feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 8 -4"/>' +
    '</filter>';
  document.body.appendChild(svg);

  /* Los círculos se crean aquí y no en el HTML: son andamiaje del efecto, no
   * contenido, y así las seis páginas solo llevan el contenedor vacío. */
  var balls = [];
  var i;
  for (i = 0; i < BALLS; i++) {
    var el = document.createElement('i');
    layer.appendChild(el);
    balls.push({
      el: el,
      x: 0,
      y: 0,
      /* Retardo decreciente: el primero va casi pegado al ratón y el último
       * arrastra. La diferencia entre ambos ES la estela. */
      lag: 0.34 - i * 0.035,
      /* Los de la cola, más pequeños: la mancha acaba en punta en vez de
       * cortarse en seco. */
      scale: 1 - i * 0.085
    });
  }

  var mx = -400;
  var my = -400;
  var on = false;
  var idle = 0;
  var running = false;

  /* Lado de la caja y margen de guarda, leídos del CSS para que el número
   * viva en un sitio solo. `contain:strict` recorta lo que se salga, así que
   * ningún círculo puede acercarse al borde más que su propio radio. */
  var box = parseFloat(getComputedStyle(layer).width) || 760;
  /* Un diámetro entero de guarda. Tiene que cubrir el radio del círculo (92)
   * MÁS lo que se desparrama el desenfoque (unas 3 desviaciones típicas: 84).
   * Con menos, un tirón brusco lleva un círculo al borde y `contain:strict`
   * le corta el halo en línea recta, que canta muchísimo. */
  var guard = parseFloat(getComputedStyle(balls[0].el).width) || 184;

  function clamp(v) {
    return v < guard ? guard : (v > box - guard ? box - guard : v);
  }

  function frame() {
    var moving = false;
    var i, b;

    /* La cadena se recorre DESDE LA COLA. Cada círculo persigue al anterior, y
     * hacerlo al revés (de la cabeza hacia atrás) fue un fallo real durante la
     * construcción: como el anterior ya se había movido en ese mismo
     * fotograma, el desplazamiento se propagaba entero por la cadena de golpe
     * y los siete viajaban pegados — una bola, nunca una estela. Recorriendo
     * al revés, cada eslabón lee la posición que el de delante tenía en el
     * fotograma anterior, y ese retraso de un fotograma por eslabón es
     * exactamente lo que estira la mancha cuando el ratón corre. */
    for (i = balls.length - 1; i >= 0; i--) {
      b = balls[i];
      var tx = i === 0 ? mx : balls[i - 1].x;
      var ty = i === 0 ? my : balls[i - 1].y;
      var dx = tx - b.x;
      var dy = ty - b.y;

      b.x += dx * b.lag;
      b.y += dy * b.lag;

      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) moving = true;
    }

    /* La caja se centra entre la cabeza y la cola, que es donde está el
     * grueso de la mancha; así el filtro no procesa pantalla vacía. */
    var head = balls[0];
    var tail = balls[balls.length - 1];
    var bx = (head.x + tail.x) / 2;
    var by = (head.y + tail.y) / 2;
    layer.style.transform = 'translate3d(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px,0)';

    /* Los círculos van en coordenadas de la caja, no de la pantalla. Si un
     * tirón brusco estira la estela más que la caja, el clamp comprime la
     * cola en vez de dejar que `contain` la corte en seco. */
    for (i = 0; i < balls.length; i++) {
      b = balls[i];
      var lx = clamp(b.x - bx + box / 2);
      var ly = clamp(b.y - by + box / 2);
      b.el.style.transform =
        'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0) scale(' + b.scale + ')';
    }

    /* Parar el bucle cuando la mancha ya ha alcanzado al ratón y este no se
     * mueve. Un blur+contrast a pantalla completa recalculándose 60 veces por
     * segundo con el ratón quieto es puro gasto de batería. Se despierta solo
     * en el siguiente `pointermove`. */
    if (!moving) {
      idle++;
      if (idle > 12) { running = false; return; }
    } else {
      idle = 0;
    }

    requestAnimationFrame(frame);
  }

  function wake() {
    if (running || document.hidden) return;
    running = true;
    idle = 0;
    requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', function (e) {
    mx = e.clientX;
    my = e.clientY;

    if (!on) {
      on = true;
      /* La primera vez, los círculos aparecen ya en el cursor en vez de
       * volar desde la esquina. */
      for (var i = 0; i < balls.length; i++) { balls[i].x = mx; balls[i].y = my; }
      layer.classList.add('is-on');
    }
    wake();
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    on = false;
    layer.classList.remove('is-on');
  });

  /* En una pestaña de fondo el rAF no corre; al volver, el bucle podría creer
   * que sigue vivo. Se rearma explícitamente. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; } else if (on) { wake(); }
  });

})();
