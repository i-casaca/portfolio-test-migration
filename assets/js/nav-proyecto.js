/* Las dos salidas del pie de una página de proyecto — anterior y siguiente
 * (ticket #56).
 *
 * No hay gesto nuevo aquí: son dos filas del índice, así que se comportan como
 * el índice. Al apuntar una, su foto persigue al cursor (`flotante.js`, la misma
 * pieza que usa la home) y el nombre barre el alfabeto (`flap.js`). Este archivo
 * solo cablea las dos cosas a estas dos filas.
 *
 * Degradación: sin JS —o sin GSAP, o sin puntero fino— las dos salidas son dos
 * enlaces con su número, su nombre y su rol, perfectamente legibles y clicables.
 * Nada del contenido depende de esto.
 */
(function () {
  'use strict';

  var nav = document.querySelector('.project-nav');
  var flotante = document.getElementById('pnav-float');
  if (!nav || !flotante) return;

  var img = flotante.querySelector('img');
  var enlaces = Array.prototype.slice.call(nav.querySelectorAll('.pnav'));
  if (!img || !enlaces.length) return;

  var reducido = window.Motion
    ? window.Motion.reduced
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Se precargan solo las fotos que existen. Los proyectos con NDA **no traen
   * `data-foto`**: es la decisión del #55 llevada hasta el final — su imagen no
   * llega al navegador hasta que hay contraseña, así que aquí no hay nada que
   * precargar ni que enseñar. Enseñan estática. */
  enlaces.forEach(function (a) {
    var src = a.getAttribute('data-foto');
    if (src) { var p = new Image(); p.src = src; }
  });

  var activo = null;

  function mostrar(a) {
    if (a === activo) return;
    activo = a;
    var nda = a.hasAttribute('data-nda');
    flotante.classList.toggle('is-nda', nda);
    if (nda) {
      /* Ni siquiera se le pone el `src`. */
      img.removeAttribute('src');
    } else {
      img.src = a.getAttribute('data-foto');
    }
    flotante.classList.add('is-on');
  }

  function esconder() {
    activo = null;
    flotante.classList.remove('is-on');
  }

  var seguidor = (punteroFino && !reducido)
    ? window.Flotante && window.Flotante.crear(flotante)
    : null;

  if (seguidor) {
    enlaces.forEach(function (a) {
      a.addEventListener('pointerenter', function () { mostrar(a); });
    });
    /* Un solo listener en el <nav> y no un `pointerleave` por fila: pasar de una
     * fila a la de al lado no debe apagar nada, y con listeners por fila hay un
     * fotograma en que ninguna está activa y la imagen parpadea. Es la misma
     * razón por la que el índice lo hace así. */
    nav.addEventListener('pointerleave', esconder);
  }

  /* Con teclado no hay cursor que seguir, pero la imagen sí tiene que aparecer:
   * dice a qué proyecto lleva el enlace enfocado. Se coloca sobre la fila,
   * quieta, por la misma vía que el seguimiento o escribiendo el `transform` a
   * mano con el scroll ya sumado. */
  enlaces.forEach(function (a) {
    a.addEventListener('focus', function () {
      var r = a.getBoundingClientRect();
      var x = r.right - flotante.offsetWidth - 24;
      var y = r.top + 8;
      if (seguidor) seguidor.colocar(x, y, true);
      else flotante.style.transform =
        'translate3d(' + (x + window.scrollX) + 'px,' + (y + window.scrollY) + 'px,0)';
      mostrar(a);
    });
    a.addEventListener('blur', esconder);
  });

  // ------------------------------------------------- letras de aeropuerto

  /* Mismo criterio que el índice (#55): solo se trocea donde el barrido puede
   * ocurrir. Sin puntero fino no hay hover que lo dispare, y repartir el nombre
   * en <span> allí no aporta nada y sí puede romper. */
  if (!reducido && punteroFino && window.Flap) {
    var todas = [];

    enlaces.forEach(function (a) {
      var nombre = a.querySelector('.pnav-name');
      if (!nombre) return;
      var celdas = window.Flap.preparar(nombre);
      todas.push(celdas);
      var corriendo = false;

      var lanzar = function () {
        if (corriendo) return;
        corriendo = true;
        window.Flap.barrer(celdas);
        /* El bloqueo dura lo que el barrido: sin él, mover el ratón dentro de la
         * misma fila lo relanzaría y el nombre no se asentaría nunca. */
        setTimeout(function () { corriendo = false; }, 900);
      };

      a.addEventListener('pointerenter', lanzar);
      a.addEventListener('focus', lanzar);
    });

    var medirTodas = function () { todas.forEach(window.Flap.medir); };

    /* Con las fuentes ya resueltas: midiendo antes, las cajas se congelan con el
     * ancho de la fuente de reserva. Es el fallo que costó una ronda en el #55, y
     * aquí valdría igual. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirTodas);
    else medirTodas();

    var t = null;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(medirTodas, 150);
    });
  }
})();
