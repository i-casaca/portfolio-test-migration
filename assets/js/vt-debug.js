/* ANDAMIAJE DE DIAGNÓSTICO — no se fusiona. Solo se carga con ?vt.
 *
 * Responde una pregunta concreta que el panel de navegador de la sesión no
 * puede responder (ahí no se crean transiciones): al navegar del índice a una
 * página de proyecto, ¿el navegador EMPAREJA `project-cover` entre las dos
 * páginas, o las trata como dos capturas sueltas y por eso se ve un fundido?
 *
 * Se apunta a `pageswap` (documento que se va) y `pagereveal` (documento que
 * llega), guarda lo que ve en sessionStorage y lo pinta al llegar.
 */
(function () {
  'use strict';

  var CLAVE = 'vt-debug';

  /* El interruptor vive aquí y no en el cargador: `?vt` no sobrevive al clic
   * hacia la página de proyecto, así que la primera visita con el parámetro lo
   * deja apuntado en sessionStorage y a partir de ahí el diagnóstico sigue
   * activo por toda la navegación. Sin él, el archivo no hace nada. */
  try {
    if (/[?&]vt\b/.test(location.search)) sessionStorage.setItem('vt-on', '1');
    if (!sessionStorage.getItem('vt-on')) return;
  } catch (e) { return; }

  function nombrados() {
    return [].slice.call(document.querySelectorAll('*'))
      .map(function (e) {
        var n = getComputedStyle(e).viewTransitionName;
        if (!n || n === 'none') return null;
        var r = e.getBoundingClientRect();
        return {
          nombre: n,
          que: e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : ''),
          posicion: getComputedStyle(e).position,
          rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
          visible: getComputedStyle(e).opacity !== '0' && r.width > 0 && r.height > 0
        };
      })
      .filter(Boolean);
  }

  window.addEventListener('pageswap', function (e) {
    sessionStorage.setItem(CLAVE, JSON.stringify({
      salida: {
        pagina: location.pathname.split('/').pop(),
        huboTransicion: !!e.viewTransition,
        nombrados: nombrados()
      }
    }));
  });

  window.addEventListener('pagereveal', function (e) {
    var prev = {};
    try { prev = JSON.parse(sessionStorage.getItem(CLAVE) || '{}'); } catch (err) {}
    prev.entrada = {
      pagina: location.pathname.split('/').pop(),
      huboTransicion: !!e.viewTransition,
      nombrados: nombrados()
    };
    sessionStorage.setItem(CLAVE, JSON.stringify(prev));
    if (e.viewTransition) {
      e.viewTransition.ready.then(function () {
        var grupos = document.getAnimations()
          .map(function (a) { return a.effect && a.effect.pseudoElement; })
          .filter(function (p) { return p && p.indexOf('view-transition') !== -1; });
        var d = JSON.parse(sessionStorage.getItem(CLAVE));
        d.gruposCreados = grupos.filter(function (v, i, a) { return a.indexOf(v) === i; });
        sessionStorage.setItem(CLAVE, JSON.stringify(d));
        pintar();
      }, function () {});
    }
  });

  function pintar() {
    var d;
    try { d = JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); } catch (e) { return; }
    if (!d || !d.salida) return;

    var salida = (d.salida.nombrados || []).filter(function (x) { return x.nombre === 'project-cover'; })[0];
    var entrada = (d.entrada && d.entrada.nombrados || []).filter(function (x) { return x.nombre === 'project-cover'; })[0];
    var grupoCover = (d.gruposCreados || []).some(function (g) { return g.indexOf('project-cover') !== -1; });

    var veredicto = !d.entrada ? 'sin datos de llegada'
      : !d.entrada.huboTransicion ? 'NO hubo transición en la llegada'
      : !salida ? 'el nombre NO estaba en la salida'
      : !entrada ? 'el nombre NO está en la llegada'
      : grupoCover ? 'EMPAREJADO — el morfismo debería verse'
      : 'nombre en los dos lados pero SIN grupo: no empareja';

    var caja = document.createElement('div');
    caja.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:100000;max-width:560px;' +
      'background:#12100e;color:#EBE3D8;border:1px solid #4a423a;border-radius:6px;padding:12px;' +
      'font:11px/1.5 ui-monospace,Menlo,monospace;white-space:pre-wrap;box-shadow:0 10px 34px rgba(0,0,0,.6)';
    caja.textContent =
      'VT · ' + veredicto + '\n\n' +
      'salida  (' + d.salida.pagina + ')  transición=' + d.salida.huboTransicion + '\n' +
      '  project-cover: ' + (salida ? JSON.stringify(salida) : '— ausente —') + '\n\n' +
      'llegada (' + (d.entrada ? d.entrada.pagina : '?') + ')  transición=' + (d.entrada ? d.entrada.huboTransicion : '?') + '\n' +
      '  project-cover: ' + (entrada ? JSON.stringify(entrada) : '— ausente —') + '\n\n' +
      'grupos creados: ' + JSON.stringify(d.gruposCreados || []);
    document.body.appendChild(caja);
    caja.addEventListener('click', function () { caja.remove(); });
  }

  if (document.readyState === 'complete') pintar();
  else window.addEventListener('load', pintar);
})();
