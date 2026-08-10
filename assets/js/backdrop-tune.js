/* ANDAMIAJE DE REVISIÓN — no se fusiona. Panel para dialogar los números del
 * fondo en el navegador en vez de a ojo en el editor. Solo se carga con ?tune.
 * Al cerrar el ticket #53, este archivo y las 5 líneas que lo cargan en
 * backdrop.js se borran, y los valores elegidos quedan fijos en site.css.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var grain = document.querySelector('.grain');

  var blur = document.querySelector('#blob-goo feGaussianBlur');
  var mat = document.querySelector('#blob-goo feColorMatrix');

  /* Los dos primeros van al filtro SVG, no a una custom property: la fusión
   * de los círculos vive en la feColorMatrix. `fundido` es cuánto se
   * desparraman antes del umbral; `umbral` es cuánto alfa hace falta para
   * que el borde exista — subirlo adelgaza los istmos entre lóbulos. */
  var controls = [
    { label: 'Fundido (stdDeviation)', min: 6, max: 40, step: 1, unit: '', val: 18,
      apply: function (v) { blur.setAttribute('stdDeviation', v); } },
    { label: 'Umbral del borde (alfa)', min: 8, max: 50, step: 1, unit: '', val: 26,
      apply: function (v) {
        mat.setAttribute('values',
          '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ' + v + ' ' + (-Math.round(v * 0.46)));
      } },
    { label: 'Tamaño del círculo', prop: '--blob-r', min: 40, max: 240, step: 4, unit: 'px', val: 132 },
    { label: 'Lado de la caja', prop: '--blob-box', min: 400, max: 1200, step: 20, unit: 'px', val: 760 }
  ];

  var box = document.createElement('div');
  box.id = 'tune-panel';
  box.innerHTML =
    '<style>' +
    '#tune-panel{position:fixed;right:16px;bottom:16px;z-index:100000;width:264px;' +
    'background:#12100e;border:1px solid #4a423a;border-radius:6px;padding:14px;' +
    'font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#EBE3D8;' +
    'box-shadow:0 12px 40px rgba(0,0,0,.6);}' +
    '#tune-panel h4{margin:0 0 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.65;font-weight:500;}' +
    '#tune-panel label{display:block;margin:0 0 11px;}' +
    '#tune-panel .row{display:flex;justify-content:space-between;margin-bottom:3px;opacity:.85;}' +
    '#tune-panel input[type=range]{width:100%;accent-color:#EBE3D8;}' +
    '#tune-panel .fps{margin-top:4px;padding-top:9px;border-top:1px solid #3a332c;display:flex;justify-content:space-between;}' +
    '#tune-panel .fps b{font-weight:600;}' +
    '#tune-panel button{margin-top:9px;width:100%;background:#241e19;color:#EBE3D8;border:1px solid #4a423a;' +
    'border-radius:4px;padding:6px;font:inherit;cursor:pointer;}' +
    '#tune-panel code{display:block;margin-top:9px;padding:7px;background:#0b0a09;border-radius:4px;' +
    'font-size:10.5px;white-space:pre-wrap;word-break:break-all;opacity:.8;}' +
    '</style><h4>Fondo · ticket #53</h4>';
  document.body.appendChild(box);

  var out = document.createElement('code');

  function render() {
    out.textContent = controls
      .map(function (c) { return (c.prop || c.label) + ': ' + c.val + c.unit + ';'; })
      .join('\n') + '\ngrano opacidad: ' + (grain ? getComputedStyle(grain).opacity : '—');
  }

  controls.forEach(function (c) {
    var l = document.createElement('label');
    var row = document.createElement('span');
    row.className = 'row';
    var name = document.createElement('span');
    name.textContent = c.label;
    var num = document.createElement('span');
    num.textContent = c.val + c.unit;
    row.appendChild(name);
    row.appendChild(num);

    var input = document.createElement('input');
    input.type = 'range';
    input.min = c.min; input.max = c.max; input.step = c.step; input.value = c.val;
    input.addEventListener('input', function () {
      c.val = +input.value;
      num.textContent = c.val + c.unit;
      if (c.apply) c.apply(c.val); else root.style.setProperty(c.prop, c.val + c.unit);
      render();
    });

    l.appendChild(row);
    l.appendChild(input);
    box.appendChild(l);
  });

  /* Medidor de fps propio: el ticket pide medir el coste, no estimarlo. */
  var fpsWrap = document.createElement('div');
  fpsWrap.className = 'fps';
  fpsWrap.innerHTML = '<span>fps (mín / actual)</span><b id="tune-fps">— / —</b>';
  box.appendChild(fpsWrap);

  var btn = document.createElement('button');
  btn.textContent = 'Grano: apagar / encender';
  btn.addEventListener('click', function () {
    if (!grain) return;
    grain.style.display = grain.style.display === 'none' ? '' : 'none';
  });
  box.appendChild(btn);
  box.appendChild(out);
  render();

  var readout = document.getElementById('tune-fps');
  var last = performance.now();
  var frames = 0;
  var min = 999;
  (function tick(now) {
    frames++;
    if (now - last >= 500) {
      var fps = Math.round((frames * 1000) / (now - last));
      /* Los primeros medio segundo incluyen el arranque de la página; no
       * cuentan para el mínimo. */
      if (now > 2500 && fps < min) min = fps;
      readout.textContent = (min === 999 ? '—' : min) + ' / ' + fps;
      frames = 0;
      last = now;
    }
    requestAnimationFrame(tick);
  })(performance.now());
})();
