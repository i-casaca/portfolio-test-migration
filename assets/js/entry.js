/* La entrada de la home (ticket #40): secuencia de saludos que se funde con
 * el hero en vez de taparlo. Sin GSAP, con menos movimiento, o en una visita
 * que ya la vio antes, esta sección no se activa nunca — sigue oculta por el
 * `display:none` base de `.entry` en index.html, y el sitio entra directo
 * por el hero. Es pura mejora progresiva, no una puerta.
 */
(function () {
  'use strict';

  var entry = document.getElementById('entry');
  if (!entry) return;

  var M = window.Motion;
  var seen;
  try { seen = localStorage.getItem('entry-seen'); } catch (e) { seen = '1'; }

  // Bypass de prueba: abrir la home con `?entrada` al final de la URL fuerza
  // la secuencia aunque el navegador ya la haya visto — para probar el
  // ritmo/tamaño/spinner sin tener que borrar el localStorage a mano cada
  // vez. No toca el comportamiento real (`release()` sigue marcando la
  // visita como vista igual); es solo una puerta trasera de desarrollo.
  var forceReplay = /(?:[?&])entrada(?:[=&]|$)/.test(location.search);

  if (!M || !M.ready || M.reduced || (seen && !forceReplay)) return;

  // Dimensionar cada palabra depende de su métrica real, así que hay que
  // esperar a que las 4 displays estén aplicadas de verdad — medir contra la
  // tipografía de reserva daría un tamaño equivocado. `document.fonts.ready`
  // no basta (GSAP sigue avisando "SplitText called before fonts loaded" con
  // esa espera sola); `document.fonts.load()` por cada familia concreta sí
  // resuelve cuando esa fuente en particular está lista para pintar.
  //
  // La familia y el texto salen del propio DOM, no de una lista escrita
  // aparte: las displays llegan subseteadas con `?text=` (solo los glifos de
  // su palabra), así que hay que pedirle a `fonts.load` esa misma palabra —
  // con el texto de prueba por defecto comprobaría glifos que el subset no
  // trae. Leerlo del DOM es además lo que evita que se desincronice cuando
  // cambian los saludos, que es justo lo que pasó al pasar de una palabra a
  // otra en este ticket.
  var displayWords = [].slice.call(
    document.querySelectorAll('#entry .entry-word:not(.entry-naming)')
  ).map(function (el) {
    return { font: '16px ' + el.style.fontFamily, text: el.textContent };
  });
  var fontsReady = document.fonts
    ? Promise.all(displayWords.map(function (w) {
        return document.fonts.load(w.font, w.text).catch(function () { /* que no bloquee la entrada */ });
      }))
    : Promise.resolve();
  // Además de las cuatro displays, hay que esperar a que el documento entero
  // deje de cargar fuentes: SplitText mira `document.fonts.status` global, no
  // las familias concretas, así que con Roboto Flex o las displays del hero
  // todavía en vuelo avisaría igual aunque lo suyo ya esté listo.
  fontsReady.then(fontsSettled).then(start);

  function start() {
    // `naming-flying` mantiene oculto el wordmark real del nav mientras el
    // logo volador está en pantalla — el relevo lo hace `landWordmark()`.
    document.documentElement.classList.add('js-entry', 'is-entering', 'naming-flying');
    if (M.lenis) M.lenis.stop();

    var words = Array.from(entry.querySelectorAll('.entry-word:not(.entry-naming)'));
    var naming = document.getElementById('entry-naming');
    var navWordmark = document.querySelector('.nav .wordmark');

    words.forEach(fitWord);

    // El naming se centra a mano (`position:fixed` + xPercent/yPercent, no
    // el `grid-area` que comparten los demás saludos — ver el porqué en el
    // CSS de `.entry-naming`) antes de medirlo, para que el vuelo se calcule
    // contra su posición real. Es el logo (un <svg>), así que se dimensiona
    // por ancho — `fitWord` cambia font-size, que aquí no pinta nada.
    gsap.set(naming, { xPercent: -50, yPercent: -50 });
    fitNamingWidth(naming);

    var namingRect = naming.getBoundingClientRect();
    var navRect = navWordmark.getBoundingClientRect();
    // Sin caja real que medir no hay vuelo que calcular con sentido: se
    // deja el naming quieto (sigue siendo visible, solo no viaja) en vez de
    // aplicar un scale infinito o NaN.
    var canFly = namingRect.width > 0 && namingRect.height > 0 && navRect.width > 0;
    var flyScale = canFly ? navRect.width / namingRect.width : 1;
    var flyDX = canFly ? (navRect.left + navRect.width / 2) - (namingRect.left + namingRect.width / 2) : 0;
    var flyDY = canFly ? (navRect.top + navRect.height / 2) - (namingRect.top + namingRect.height / 2) : 0;

    var wordSplits = words.map(function (el) {
      return new SplitText(el, { type: 'chars,words', mask: 'words', charsClass: 'char', wordsClass: 'word' });
    });

    var ENTER = 0.32, EXIT = 0.22, HOLD = 0.1, STAGGER = 0.012;

    var tl = gsap.timeline();

    // Cada saludo entra por sus caracteres desde abajo y sale por arriba; el
    // siguiente ya está entrando cuando el anterior todavía sale, así el ojo
    // no ve un hueco entre uno y otro — la gramática de texto de DESIGN.md.
    words.forEach(function (word, i) {
      var chars = wordSplits[i].chars;
      tl.set(word, { opacity: 1, visibility: 'visible' }, i === 0 ? 0 : '<0.1')
        .from(chars, { yPercent: 100, opacity: 0, duration: ENTER, ease: M.ease.enter, stagger: STAGGER }, '<');
      tl.to(chars, { yPercent: -120, opacity: 0, duration: EXIT, ease: M.ease.exit, stagger: STAGGER * 0.8 }, '+=' + HOLD);
    });

    // El naming: el logo aparece con un glitch — un puñado de saltos de
    // posición e intermitencias muy rápidos — y se asienta limpio, quieto.
    // No es una entrada por caracteres: es la firma del sitio, no una
    // palabra más del chiste. Se queda ahí, estático, un buen rato —
    // aguantando de verdad, no de pasada — antes de volar a su sitio.
    tl.add(glitchIn(naming), '+=' + HOLD)
      .to('.entry-loading', { opacity: 0, duration: 0.2 }, '<+1.7')
      .addLabel('pausa', '+=1.3')
      // El naming vuela a su sitio real en la cabecera mientras el resto del
      // sitio aparece debajo — la salida de la carga y la llegada al hero
      // son el mismo movimiento, no dos pasos distintos.
      .to(naming, { x: flyDX, y: flyDY, scale: flyScale, duration: 0.6, ease: M.ease.move }, 'pausa')
      .to(entry, { height: 0, duration: 0.6, ease: M.ease.move }, 'pausa')
      .to(['.hero-eyebrow', '.project-index'], { opacity: 1, duration: 0.5, ease: M.ease.enter }, 'pausa+=0.15')
      // El scroll y los enlaces del nav vuelven a la vida a mitad del vuelo,
      // pero el wordmark real sigue oculto (`html.naming-flying`): el único
      // logo pintado en pantalla sigue siendo el volador.
      .call(release, null, 'pausa+=0.2')
      // Medio segundo después de que el vuelo termine (acaba en `pausa+0.6`),
      // el relevo: se apaga el volador y aparece el real en el mismo
      // fotograma. Instantáneo y simultáneo a propósito — un fundido entre
      // los dos es justo lo que dejaba ver el artificio, porque durante la
      // mezcla se leían como dos logos cruzándose en vez de como uno solo.
      .set(naming, { display: 'none' }, 'pausa+=1.1')
      .call(landWordmark, null, 'pausa+=1.1');
  }

  function release() {
    try { localStorage.setItem('entry-seen', '1'); } catch (e) {}
    document.documentElement.classList.remove('is-entering');
    if (M.lenis) M.lenis.start();
  }

  function landWordmark() {
    document.documentElement.classList.remove('naming-flying');
  }

  // Espera a que el documento deje de cargar fuentes. `document.fonts.ready`
  // por sí solo no basta: resuelve, y el estado puede volver a `loading` en
  // cuanto arranca otra fuente de la página, así que se vuelve a comprobar
  // hasta que quede estable. El tope de 3 s es la red de seguridad — la
  // entrada nunca se queda esperando a una fuente que no llega.
  function fontsSettled() {
    if (!document.fonts) return Promise.resolve();
    var deadline = Date.now() + 3000;
    function step() {
      if (document.fonts.status === 'loaded' || Date.now() > deadline) return Promise.resolve();
      return document.fonts.ready.then(function () {
        return new Promise(function (r) { setTimeout(r, 30); }).then(step);
      });
    }
    return step();
  }

  // Las bandas horizontales en las que se corta el logo durante el glitch:
  // clones de la base, cada uno recortado a su franja con `clip-path`. Las
  // franjas se reparten el alto sin solaparse ni dejar hueco, así que entre
  // todas recomponen el logo exacto — con desplazamiento 0 no se distingue
  // del entero. Se crean aquí y no en el HTML porque son puro adorno de la
  // entrada: sin JS no existen, igual que el resto.
  function buildBands(el, n) {
    var base = el.querySelector('.naming-base');
    var out = [];
    for (var i = 0; i < n; i++) {
      var s = base.cloneNode(true);
      s.setAttribute('class', 'naming-band');
      var top = i * 100 / n;
      var bottom = 100 - (i + 1) * 100 / n;
      s.style.clipPath = 'inset(' + top.toFixed(4) + '% 0 ' + bottom.toFixed(4) + '% 0)';
      el.appendChild(s);
      out.push(s);
    }
    return out;
  }

  // Escala la palabra a un tamaño base, mide su caja real, y calcula el
  // font-size que la llevaría a ocupar casi toda la pantalla — por ancho o
  // por alto, lo que primero se cumpla. Cada display tiene proporciones muy
  // distintas (Monoton es alto y fino, Rubik Mono One es corto y macizo), así
  // que un tamaño fijo dejaría unas palabras enormes y otras diminutas.
  function fitWord(el) {
    var probe = 200;
    el.style.fontSize = probe + 'px';
    var rect = el.getBoundingClientRect();
    var maxW = window.innerWidth * 0.92;
    var maxH = window.innerHeight * 0.6;
    // Si el viewport o la caja medida son 0 (visor todavía sin pintar, por
    // ejemplo), no hay nada sensato que calcular: se deja la palabra en su
    // tamaño de sonda en vez de un font-size:0 invisible.
    if (!maxW || !maxH || !rect.width || !rect.height) return;
    var scale = Math.min(maxW / rect.width, maxH / rect.height);
    el.style.fontSize = Math.round(probe * scale) + 'px';
  }

  // Igual que `fitWord`, pero dimensionando por `width` en vez de
  // `font-size` — el naming es un `<svg>` (`height:auto` seguido en CSS),
  // no texto.
  function fitNamingWidth(el) {
    var probe = 800;
    el.style.width = probe + 'px';
    var rect = el.getBoundingClientRect();
    var maxW = window.innerWidth * 0.7;
    var maxH = window.innerHeight * 0.35;
    if (!maxW || !maxH || !rect.width || !rect.height) return;
    var scale = Math.min(maxW / rect.width, maxH / rect.height);
    el.style.width = Math.round(probe * scale) + 'px';
  }

  // El glitch de entrada del naming. El logo **nunca deja de leerse**: se
  // corta en bandas horizontales de canto limpio que se deslizan a lo ancho,
  // con las franjas de color asomando por los bordes. Nada de deformar el
  // trazo — se probó con turbulencia y el logo se leía como confeti, que es
  // justo lo contrario de lo que se busca.
  //
  // El truco de las bandas: entre todas recomponen el logo exacto, así que
  // con desplazamiento 0 son indistinguibles del logo entero. Lo único que
  // se anima es cuánto se sale cada una de su sitio.
  //
  // Tres ráfagas, con un amago de recomponerse entre una y otra que no llega
  // a cuajar — así la segunda y la tercera se sienten como una recaída.
  function glitchIn(el) {
    var base = el.querySelector('.naming-base');
    var ghosts = [].slice.call(el.querySelectorAll('.naming-ghost'));
    var bands = buildBands(el, 12);

    var seg = gsap.timeline();
    seg.set(el, { opacity: 1, visibility: 'visible', x: 0, y: 0, skewX: 0, scale: 1 });
    // Durante el glitch mandan las bandas: la base se apaga para que, cuando
    // una banda se desplace, quede el hueco limpio en vez de verse el logo
    // entero por debajo.
    seg.set(base, { opacity: 0 });
    seg.set(bands, { opacity: 1, x: 0 });

    var BURSTS = 3, STEPS = 11;
    for (var b = 0; b < BURSTS; b++) {
      for (var i = 0; i < STEPS; i++) {
        // El `to` de duración corta es lo que hace avanzar la timeline; los
        // `set` de abajo cuelgan de él con '<'. Un parpadeo corto y poco
        // profundo, de vez en cuando: en la referencia el logo casi nunca
        // desaparece del todo.
        seg.to(el, {
          opacity: Math.random() > 0.12 ? 1 : 0.35,
          duration: 0.05,
          ease: 'none'
        }, '>')
          // Las franjas de color: unos pocos px, lo justo para que se vea el
          // canto rojo o verde asomando por detrás del hueso.
          .set(ghosts[0], { opacity: 0.9, x: -3 - Math.random() * 7 }, '<')
          .set(ghosts[1], { opacity: 0.9, x: 3 + Math.random() * 7 }, '<');

        // Las bandas: la mayoría se quedan en su sitio y solo unas pocas se
        // deslizan. Eso es lo que mantiene el logo legible — si saltan todas
        // a la vez deja de leerse.
        bands.forEach(function (s) {
          seg.set(s, {
            x: Math.random() < 0.3 ? (Math.random() - 0.5) * 120 : 0
          }, '<');
        });
      }
      if (b < BURSTS - 1) {
        seg.to(el, { opacity: 1, duration: 0.1, ease: 'power1.out' })
          .set(bands, { x: 0 }, '<')
          .set(ghosts, { x: 0, opacity: 0.35 }, '<');
      }
    }

    // Se recompone: bandas a su sitio, color fuera, y la base vuelve a ser
    // el logo — a partir de aquí es una pieza sola otra vez, la que vuela.
    seg.to(el, { opacity: 1, duration: 0.14, ease: M.ease.enter })
      .set(bands, { x: 0 }, '<')
      .to(ghosts, { opacity: 0, x: 0, duration: 0.14, ease: M.ease.enter }, '<')
      .set(base, { opacity: 1 })
      .set(bands, { opacity: 0 });
    return seg;
  }
})();
