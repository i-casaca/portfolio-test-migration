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
    document.documentElement.classList.remove('muro-abierto');
    pendiente = null;
  }

  function abrirMuro(item, i) {
    /* Sin muro en el documento (o sin `crypto.subtle`, que exige contexto
     * seguro), no se secuestra el clic: se deja navegar y la página de proyecto
     * hace lo de siempre. Nunca se queda un enlace sin funcionar. */
    if (!muro || !window.crypto || !crypto.subtle) { location.href = item.getAttribute('href'); return; }
    pendiente = { item: item, i: i };
    muro.hidden = false;
    /* La marca en la raíz es la que apaga el cursor propio, la mancha, la
     * imagen flotante y los hovers del índice (ver site.css). Se pone aquí y no
     * en el muro para que alcance a capas que viven fuera de él. */
    document.documentElement.classList.add('muro-abierto');
    esconder();
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

  /* El seguimiento —retardo, suma del scroll y clamp contra los bordes— vive en
   * assets/js/flotante.js desde el #56, compartido con el Prev/Next de las
   * páginas de proyecto. El porqué de cada pieza está allí. Aquí se queda lo que
   * SÍ es propio del índice: el muro de NDA y la fase 1 de la transición. */
  var seguidor = (hayGsap && punteroFino && !reducido)
    ? window.Flotante && window.Flotante.crear(flotante)
    : null;

  if (seguidor) {
    colocar = seguidor.colocar;
    var saliendo = false;

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
        /* A partir de aquí manda la fase 1: el seguidor suelta el `transform`
         * para no pelearse con el `left`/`top`/`width`/`height` de la timeline. */
        seguidor.pausar(true);

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
      seguidor.reset();
    });

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

  /* El barrido de letras vive en assets/js/flap.js desde el #56, cuando la
   * navegación Prev/Next de las páginas de proyecto pidió el mismo gesto. El
   * porqué de cada pieza —por qué se trocea, por qué se congela el ancho, por
   * qué se mide con `document.fonts.ready`— está allí.
   *
   * Aquí solo importa una consecuencia local: el alto del hero está calculado
   * para que asome media fila del primer proyecto (#51), así que un temblor de
   * ancho en este nombre se propaga hasta arriba del todo. Es exactamente lo
   * que el congelado de cajas impide.
   *
   * Solo se trocea el nombre donde el barrido puede ocurrir. En táctil no hay
   * hover que lo dispare, así que partir el título en celdas allí no aporta
   * nada y sí puede romper: es el reparto en `<span>` lo que hacía que el
   * nombre se desmontara en móvil. Sin puntero fino, el título se queda como
   * un texto normal. */
  if (!reducido && punteroFino && window.Flap) {
    var preparar = window.Flap.preparar;
    var medir = window.Flap.medir;
    var barrer = window.Flap.barrer;
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
