/* El hover del índice de proyectos (ticket #55): la imagen flotante ligada al
 * cursor, y las letras de aeropuerto del nombre.
 *
 * Vive en su propio archivo y no en el <script> inline de index.html porque
 * necesita GSAP: el inline corre antes de que los `defer` del <head> hayan
 * terminado, así que allí no hay garantía de que `gsap` exista. Aquí sí — este
 * archivo es también `defer` y va detrás de motion.js en el documento.
 *
 * Degradación: sin JS, sin GSAP o sin puntero fino, el índice sigue siendo
 * cinco enlaces legibles y clicables, con su miniatura en táctil. Nada del
 * contenido depende de esto.
 */
(function () {
  'use strict';

  var indice = document.getElementById('project-index');
  var flotante = document.getElementById('index-float');
  if (!indice || !flotante) return;

  var img = flotante.querySelector('img');
  var items = Array.prototype.slice.call(indice.querySelectorAll('.index-item'));
  if (!items.length) return;

  var reducido = window.Motion
    ? window.Motion.reduced
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Las fotos que ya estaban en el HTML como <img> apiladas ahora son solo
   * rutas. Se precargan al vuelo: sin esto, la primera fila que se apunta
   * cambia el `src` y la imagen tarda en llegar, que es justo el momento en
   * que se está mirando. */
  var fotos = items.map(function (item) {
    var src = item.getAttribute('data-foto');
    if (src) { var p = new Image(); p.src = src; }
    return src;
  });

  // ---------------------------------------------------------------- flotante

  var activo = -1;
  /* Se declara aquí, fuera del bloque de puntero fino, para que el foco de
   * teclado pueda preguntar si existe. Solo se define cuando hay puntero fino
   * y GSAP; en cualquier otro caso se queda sin definir y el teclado toma su
   * propio camino. */
  var colocar;

  /* Los tres proyectos con NDA no enseñan su foto hasta que hay contraseña.
   * La marca es la misma que usan las páginas de proyecto y el chatbot, así que
   * acertarla en cualquier sitio abre los tres mientras dure la pestaña. */
  function ndaAbierto() {
    try { return sessionStorage.getItem('nda-ok') === '1'; } catch (e) { return false; }
  }
  function bloqueado(item) {
    return item.classList.contains('is-locked') && !ndaAbierto();
  }

  function mostrar(i) {
    if (i === activo) return;
    activo = i;
    if (bloqueado(items[i])) {
      /* Ni siquiera se le pone el `src`: la foto de un proyecto bajo NDA no
       * llega al navegador hasta que se ha desbloqueado. Enseñarla difuminada
       * era una promesa falsa — estaba ahí, solo tapada. */
      flotante.classList.add('is-nda');
      img.removeAttribute('src');
    } else {
      flotante.classList.remove('is-nda');
      img.src = fotos[i];
    }
    flotante.classList.add('is-on');
  }

  function esconder() {
    activo = -1;
    flotante.classList.remove('is-on');
  }

  /* ---------- el muro de NDA, en la home ----------
   * Toda la lógica vive aquí y no repartida entre el HTML y este archivo: el
   * muro y lo que pasa después (reanudar la transición al proyecto que se
   * pulsó) son la misma decisión, y separarlos obligaba a comunicarlos por
   * globales.
   *
   * El hash y la marca de sesión son los mismos que usan las tres páginas de
   * proyecto: acertar aquí las abre todas mientras dure la pestaña. */
  var HASH = '16a6293c0df358beac52eef47093b535068570717895e7eb2998f5f6a383bf7d';
  var muro = document.getElementById('gate-wrap');
  var pendiente = null;

  function sha256Hex(texto) {
    var datos = new TextEncoder().encode(texto);
    return crypto.subtle.digest('SHA-256', datos).then(function (d) {
      return Array.prototype.map.call(new Uint8Array(d), function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function cerrarMuro() {
    if (!muro) return;
    muro.hidden = true;
    pendiente = null;
  }

  function abrirMuro(item, i) {
    /* Sin muro en el documento (o sin `crypto.subtle`, que exige contexto
     * seguro), no se secuestra el clic: se deja navegar y la página de proyecto
     * hace lo de siempre. Nunca se queda un enlace sin funcionar. */
    if (!muro || !window.crypto || !crypto.subtle) { location.href = item.getAttribute('href'); return; }
    pendiente = { item: item, i: i };
    muro.hidden = false;
    var campo = document.getElementById('gate-input');
    var error = document.getElementById('gate-error');
    if (error) error.textContent = '';
    if (campo) { campo.value = ''; setTimeout(function () { campo.focus(); }, 40); }
  }

  if (muro) {
    var formulario = document.getElementById('gate-form');
    if (formulario) {
      formulario.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var campo = document.getElementById('gate-input');
        var error = document.getElementById('gate-error');
        sha256Hex(campo.value.trim()).then(function (h) {
          if (h !== HASH) {
            if (error) error.textContent = 'Contraseña incorrecta.';
            campo.value = '';
            campo.focus();
            return;
          }
          try { sessionStorage.setItem('nda-ok', '1'); } catch (e) {}
          var espera = pendiente;
          cerrarMuro();
          if (!espera) return;
          /* Se rehace el hover para que la flotante cambie la estática por la
           * foto de verdad, y se vuelve a pulsar: el mismo manejador de antes,
           * ahora sin candado, hace la transición completa. Reanudar así evita
           * duplicar la coreografía en dos sitios. */
          activo = -1;
          mostrar(espera.i);
          espera.item.click();
        });
      });
    }
    /* Escape y clic fuera cierran. Un muro que solo se puede cerrar acertando
     * es una trampa, no una puerta. */
    muro.addEventListener('click', function (ev) {
      if (ev.target === muro || ev.target.classList.contains('password-gate')) cerrarMuro();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !muro.hidden) cerrarMuro();
    });
  }

  /* Sin GSAP no hay seguimiento ni colocación, pero el resto del archivo —las
   * letras de aeropuerto— tiene que seguir funcionando. El contrato del mapa
   * desde el #39 es que si el CDN no responde nadie se cae; una llamada suelta
   * a `gsap.set` más abajo lanzaría y se llevaría por delante el barrido. */
  var hayGsap = !!window.gsap;

  if (hayGsap && punteroFino && !reducido) {
    /* `quickTo` en vez de un tween por evento: devuelve una función que
     * reapunta el mismo tween en marcha, así que no se crean objetos en cada
     * `pointermove`. El retardo (0,55 s con `power3`) es lo que hace que la
     * imagen "persiga" en vez de ir pegada — pegada al cursor no se lee como
     * un objeto, se lee como parte del puntero. */
    /* El retardo se anima sobre un objeto, no sobre el elemento, y el
     * `transform` lo escribe el ticker sumando el scroll.
     *
     * Por qué así: la imagen dejó de ser `position:fixed` —era lo que impedía
     * el morfismo de ida— y una absoluta se queda quieta en el documento
     * mientras la página se mueve. Sumando `scrollY` en cada fotograma se
     * comporta exactamente como antes a la vista, pero el elemento que el
     * navegador captura ya es una caja normal.
     *
     * Animar el objeto y no el elemento es lo que permite que el retardo viva
     * en coordenadas de pantalla y el scroll se aplique después, sin que una
     * cosa arrastre a la otra. */
    var pos = { x: -9999, y: -9999 };
    var toX = gsap.quickTo(pos, 'x', { duration: 0.55, ease: 'power3' });
    var toY = gsap.quickTo(pos, 'y', { duration: 0.55, ease: 'power3' });

    var saliendo = false;

    gsap.ticker.add(function () {
      /* Durante la salida manda la animación de la fase 1, que escribe
       * `left`/`top`/`width`/`height` directamente. Si el ticker siguiera
       * pisando el `transform`, las dos se pelearían. */
      if (saliendo) return;
      flotante.style.transform =
        'translate3d(' + (pos.x + window.scrollX) + 'px,' + (pos.y + window.scrollY) + 'px,0)';
    });

    /* ---------- fase 1 de la transición al proyecto ----------
     * La imagen crece hasta llenar la pantalla y solo entonces se navega. La
     * página de proyecto recoge el testigo con la portada ya a pantalla
     * completa y la baja a su sitio (assets/js/entrada-proyecto.js).
     *
     * Por qué así y no con View Transitions: cuatro rondas de diagnóstico
     * demostraron que el navegador NO captura la imagen flotante en el
     * documento que sale — solo se creaba `::view-transition-new(project-cover)`,
     * nunca el `old` ni el grupo, así que no había nada que morfear y se veía un
     * fundido. Partirlo en dos animaciones, una dentro de cada página, elimina
     * la dependencia: ninguna de las dos necesita que la otra capture nada.
     *
     * La vuelta (proyecto → índice) sí morfeaba y sigue haciéndolo por su
     * cuenta con la transición nativa; esto solo gobierna la ida. */
    items.forEach(function (item, i) {
      item.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!flotante.classList.contains('is-on') || saliendo) return;

        var destino = item.getAttribute('href');

        /* El muro salta AQUÍ, antes de navegar. Antes vivía solo en la página
         * de proyecto: se veía entrar el proyecto con toda su transición y acto
         * seguido taparse con el muro. Preguntando primero, la transición solo
         * ocurre cuando ya hay algo que enseñar. */
        if (bloqueado(item)) {
          e.preventDefault();
          abrirMuro(item, i);
          return;
        }

        var r = flotante.getBoundingClientRect();
        e.preventDefault();
        saliendo = true;
        gsap.killTweensOf(pos);

        /* Se pasa a `fixed` conservando exactamente la posición que se ve: a
         * partir de aquí la imagen ya no sigue al cursor ni al scroll, va a
         * llenar la pantalla. */
        flotante.style.position = 'fixed';
        flotante.style.transform = 'none';
        flotante.style.aspectRatio = 'auto';
        flotante.style.left = r.left + 'px';
        flotante.style.top = r.top + 'px';
        flotante.style.width = r.width + 'px';
        flotante.style.height = r.height + 'px';

        /* Crece, SE QUEDA, y entonces navega. La pausa no es relleno: es lo
         * que convierte dos animaciones sueltas en una sola que continúa al
         * otro lado. Sin ella, la imagen llegaba a pantalla completa y la
         * página cambiaba en el mismo instante, y el corte se notaba. */
        gsap.timeline({
          onComplete: function () {
            try { sessionStorage.setItem('entrada-proyecto', destino); } catch (err) {}
            location.href = destino;
          }
        })
        .to(flotante, {
          left: 0, top: 0, width: window.innerWidth, height: window.innerHeight,
          duration: 0.62, ease: 'power3.inOut'
        })
        .to({}, { duration: 0.34 });
      });
    });

    /* El bfcache devuelve el documento tal cual se dejó — con la imagen a
     * pantalla completa y en `fixed`. Ya nos pasó una vez con estilos inline
     * que sobrevivieron y descolocaron todo: aquí se limpian a mano. */
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      saliendo = false;
      flotante.classList.remove('is-on');
      flotante.style.cssText = '';
    });

    /* El desfase saca la imagen de debajo del cursor: centrada, el propio
     * puntero tapa el centro de la foto y el `#cursor-dot` invierte justo ahí. */
    var DX = 28, DY = 24;
    var MARGEN = 16;

    /* La imagen no puede salirse de la pantalla. Sin esto, al apuntar las
     * filas de abajo se iba por el borde inferior y desaparecía justo cuando
     * se estaba mirando — el objeto perdía su razón de ser.
     *
     * El efecto secundario es el interesante y es el que se busca: cuando el
     * cursor sigue bajando y la imagen ya no puede, **se queda pegada al borde
     * y el cursor se separa de ella**. Esa distancia creciente entre puntero e
     * imagen se lee como resistencia, como si el objeto tuviera peso y
     * estuviera topando contra el marco. */
    function encajar(v, tam, limite) {
      var max = limite - tam - MARGEN;
      if (max < MARGEN) return (limite - tam) / 2;   // pantallas más pequeñas que la imagen
      return v < MARGEN ? MARGEN : (v > max ? max : v);
    }

    /* Único punto por el que se mueve la imagen. `yaEncajado` lo usa el foco de
     * teclado, que calcula su sitio a partir de la fila y no necesita clamp. */
    colocar = function (x, y, yaEncajado) {
      if (yaEncajado) { toX(x); toY(y); return; }
      toX(encajar(x, flotante.offsetWidth, window.innerWidth));
      toY(encajar(y, flotante.offsetHeight, window.innerHeight));
    };

    window.addEventListener('pointermove', function (e) {
      colocar(e.clientX + DX, e.clientY + DY);
    }, { passive: true });

    items.forEach(function (item, i) {
      item.addEventListener('pointerenter', function () { mostrar(i); });
    });

    /* Aquí hubo un parche que congelaba la imagen con `left`/`top` inline justo
     * antes de navegar, para probar si el problema del morfismo era que el
     * elemento fuese `position:fixed`. **Se retira: causaba el fallo que
     * pretendía arreglar.**
     *
     * Esos estilos inline sobreviven a la vuelta por bfcache. Al volver al
     * índice, la imagen conservaba `left`/`top` de la visita anterior y GSAP le
     * seguía sumando `x`/`y` encima: doble desplazamiento, fuera de pantalla, y
     * el clamp gobernando un valor que ya no era la posición real. El
     * diagnóstico lo enseñó en crudo — la imagen salía en y=892 midiendo 420 de
     * alto, o sea acabando en 1312 con un viewport de ~1030.
     *
     * Y de ahí venía el morfismo roto: una captura mayormente fuera del
     * viewport sale vacía, y sin captura el navegador no crea
     * `::view-transition-old(project-cover)`. Sin `old` no hay grupo, y sin
     * grupo no hay morfismo — solo el `new` apareciendo, que es exactamente el
     * fundido que se veía.
     *
     * La lección, escrita para no repetirla: **no dejar estado inline que
     * sobreviva a una navegación**. El bfcache devuelve el documento tal cual
     * se dejó, incluidos los estilos que se pusieron "solo un momento". */

    /* Y NO se apaga la imagen al volver desde bfcache, aunque tiente: que siga
     * encendida es exactamente lo que hace que el morfismo de vuelta funcione.
     * El documento restaurado es el que LLEGA, y su `project-cover` tiene que
     * existir para que haya con qué emparejar. Apagarla aquí rompería el único
     * sentido que ya iba bien. */
    /* Un solo listener en el <nav> en vez de cinco `pointerleave`: salir de una
     * fila para entrar en la de al lado no debe apagar nada, y con listeners
     * por fila hay un fotograma en que ninguna está activa y la imagen
     * parpadea. Se apaga solo al salir del índice entero. */
    indice.addEventListener('pointerleave', esconder);
  }

  /* Con teclado no hay cursor que seguir, pero sí hace falta que la imagen
   * exista: es el origen del morfismo a la página de proyecto (#42). Se coloca
   * sobre la fila enfocada, quieta. Sin esto, navegar con teclado y pulsar
   * Enter no tendría foto que transformar. */
  items.forEach(function (item, i) {
    item.addEventListener('focus', function () {
      var r = item.getBoundingClientRect();
      var x = r.right - flotante.offsetWidth - 24;
      var y = r.top + 8;
      /* Se coloca por la misma vía que el seguimiento —`colocar`, que existe
       * solo con puntero fino— o, si no la hay, escribiendo el `transform` a
       * mano con el scroll ya sumado. Las dos tienen que dejar la imagen en el
       * mismo sitio: es el origen del morfismo, y si no coincide con lo que se
       * ve, el morfismo arranca de un sitio que no es. */
      if (typeof colocar === 'function') colocar(x, y, true);
      else flotante.style.transform =
        'translate3d(' + (x + window.scrollX) + 'px,' + (y + window.scrollY) + 'px,0)';
      mostrar(i);
    });
    item.addEventListener('blur', esconder);
  });

  // ------------------------------------------------- letras de aeropuerto

  /* El barrido no puede mover el layout. Roboto Flex no es monoespaciada, así
   * que cambiar una letra por otra cambia el ancho de la palabra y arrastra la
   * fila entera — y el alto del hero está calculado para que asome media fila
   * (#51), o sea que un temblor aquí se propaga hasta arriba.
   *
   * Por eso cada carácter se envuelve en un <span> al que se le fija SU ancho
   * natural antes de animar nada. El glifo de dentro cambia; la caja no. */
  var ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function preparar(nombre) {
    var texto = nombre.textContent;
    var frag = document.createDocumentFragment();
    var celdas = [];

    texto.split('').forEach(function (ch) {
      var s = document.createElement('span');
      s.className = 'flap';
      s.textContent = ch;
      frag.appendChild(s);
      celdas.push({ el: s, final: ch });
    });

    nombre.textContent = '';
    nombre.appendChild(frag);
    return celdas;
  }

  /* Medir es un paso aparte de trocear, y **cuándo** se mide fue un fallo real:
   * midiendo al arrancar, Roboto Flex todavía no había cargado (va con
   * `display=swap`), así que cada celda se quedaba con el ancho de la fuente de
   * reserva —más ancha— y al llegar la buena los glifos bailaban dentro de
   * cajas grandes. En móvil se veía clarísimo: "M a n u   C a r d i e l".
   *
   * Se mide con `document.fonts.ready`, igual que motion.js hace con
   * ScrollTrigger y por el mismo motivo. Y se vuelve a medir al cambiar el
   * tamaño, porque el cuerpo del nombre es fluido (`clamp(...,6vw,...)`): un
   * ancho congelado en píxeles deja de valer en cuanto cambia el viewport. */
  function medir(celdas) {
    celdas.forEach(function (c) { c.el.style.width = 'auto'; });
    celdas.forEach(function (c) {
      c.el.style.width = c.el.getBoundingClientRect().width + 'px';
    });
  }

  function barrer(celdas) {
    /* Un solo rAF para todas las celdas de la fila, no un temporizador por
     * letra: es la misma razón por la que la inversión del #54 se mueve con un
     * solo número. N relojes independientes se desincronizan y el efecto se
     * deshilacha. */
    var t0 = null;
    var DUR = 520;          // ms hasta que la última letra se asienta
    var ESCALON = 34;       // ms de retraso por letra: el barrido corre de izquierda a derecha

    function paso(ahora) {
      if (t0 === null) t0 = ahora;
      var t = ahora - t0;
      var vivos = 0;

      for (var i = 0; i < celdas.length; i++) {
        var c = celdas[i];
        if (c.final === ' ') continue;
        var propio = t - i * ESCALON;
        if (propio < 0) { vivos++; continue; }
        if (propio >= DUR) { c.el.textContent = c.final; continue; }
        vivos++;
        /* Cuanto más cerca del final, menos probable que siga girando: la
         * letra se "asienta" en vez de pararse de golpe. */
        if (Math.random() < propio / DUR) c.el.textContent = c.final;
        else c.el.textContent = ALFABETO[(Math.random() * ALFABETO.length) | 0];
      }

      if (vivos) requestAnimationFrame(paso);
      else celdas.forEach(function (c) { c.el.textContent = c.final; });
    }

    requestAnimationFrame(paso);
  }

  /* Solo se trocea el nombre donde el barrido puede ocurrir. En táctil no hay
   * hover que lo dispare, así que partir el título en celdas allí no aporta
   * nada y sí puede romper: es el reparto en `<span>` lo que hacía que el
   * nombre se desmontara en móvil. Sin puntero fino, el título se queda como
   * un texto normal. */
  if (!reducido && punteroFino) {
    var todas = [];

    items.forEach(function (item) {
      var nombre = item.querySelector('.index-name');
      if (!nombre) return;
      var celdas = preparar(nombre);
      todas.push(celdas);
      var corriendo = false;

      var lanzar = function () {
        if (corriendo) return;
        corriendo = true;
        barrer(celdas);
        /* El bloqueo dura lo que el barrido: sin él, mover el ratón dentro de
         * la misma fila relanzaría el efecto y el nombre no llegaría a
         * asentarse nunca. */
        setTimeout(function () { corriendo = false; }, 900);
      };

      item.addEventListener('pointerenter', lanzar);
      item.addEventListener('focus', lanzar);
    });

    var medirTodas = function () { todas.forEach(medir); };

    /* Con las fuentes ya resueltas. `document.fonts.ready` cumple igual si la
     * fuente ya estaba en caché, así que no hace falta distinguir el caso. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirTodas);
    else medirTodas();

    var t = null;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(medirTodas, 150);
    });
  }
})();
