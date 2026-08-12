/* El Prev/Next del pie de las páginas de proyecto (ticket #56).
 *
 * Al apuntar una de las dos salidas: el nombre del proyecto vecino barre el
 * alfabeto debajo de la palabra (flap.js, el mismo gesto del índice) y su foto
 * aparece centrada entre las dos.
 *
 * Degradación: sin JS son dos enlaces con su nombre visible —el CSS deja
 * `.pnav-name` a la vista donde no hay hover—, y nada del contenido depende de
 * esto. Sin `Flap`, el nombre aparece sin barrer.
 */
(function () {
  'use strict';

  var nav = document.querySelector('.project-nav');
  if (!nav) return;

  var preview = nav.querySelector('.pnav-preview');
  var img = preview && preview.querySelector('img');
  var enlaces = Array.prototype.slice.call(nav.querySelectorAll('.pnav'));
  if (!preview || !img || !enlaces.length) return;

  var reducido = window.Motion
    ? window.Motion.reduced
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Se precargan solo las fotos que existen. Los proyectos con NDA **no traen
   * `data-foto`**, y eso es la decisión del #55 llevada hasta el final: su
   * imagen no llega al navegador hasta que hay contraseña, así que aquí no hay
   * nada que precargar ni que enseñar — enseñan estática. */
  enlaces.forEach(function (a) {
    var src = a.getAttribute('data-foto');
    if (src) { var p = new Image(); p.src = src; }
  });

  function mostrar(a) {
    var nda = a.hasAttribute('data-nda');
    preview.classList.toggle('is-nda', nda);

    /* El `src` solo se escribe para los que sí tienen foto. Nunca se borra: el
     * `.is-nda` ya esconde el <img> por CSS, y quitar el src provocaría una
     * recarga en cada ida y vuelta del ratón. La foto que pueda quedar debajo
     * es la del OTRO vecino, que es pública por definición. */
    if (!nda) {
      var src = a.getAttribute('data-foto');
      if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
    }

    preview.classList.add('is-on');
  }

  function esconder() {
    preview.classList.remove('is-on');
  }

  enlaces.forEach(function (a) {
    a.addEventListener('pointerenter', function () { mostrar(a); });
    a.addEventListener('pointerleave', esconder);
    /* Con teclado el preview también aparece: es información sobre a dónde
     * lleva el enlace, no un adorno del ratón. */
    a.addEventListener('focus', function () { mostrar(a); });
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
        /* El bloqueo dura lo que el barrido: sin él, mover el ratón dentro del
         * mismo enlace lo relanzaría y el nombre no se asentaría nunca. */
        setTimeout(function () { corriendo = false; }, 900);
      };

      a.addEventListener('pointerenter', lanzar);
      a.addEventListener('focus', lanzar);
    });

    var medirTodas = function () { todas.forEach(window.Flap.medir); };

    /* Con las fuentes ya resueltas: midiendo antes, las cajas se congelan con
     * el ancho de la fuente de reserva. Es el fallo que costó una ronda en el
     * #55, y aquí valdría igual. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirTodas);
    else medirTodas();

    var t = null;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(medirTodas, 150);
    });
  }
})();
