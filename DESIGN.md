# Design

El sistema visual del sitio. Qué se decidió, con qué valores y por qué. Es el contrato: cualquier
pasada de diseño —humana o de `/impeccable`— lo lee antes de tocar código, y ninguna decisión se
considera tomada hasta que está escrita aquí.

El contexto estratégico (a quién le habla, qué afirma, qué no debe parecer) vive en
[PRODUCT.md](PRODUCT.md).

> **Estado**: este documento se está escribiendo por partes. Cada sección dice quién la rellena. Una
> sección marcada como pendiente significa que la decisión aún no está tomada, no que dé igual.

## Registro y estrategia

Registro **brand**: el diseño es el producto. La impresión que se lleva un visitante *es* la cosa
que se está fabricando, así que el sitio tiene permiso para motion de carga ambicioso, para dedicar
un viewport entero a una sola idea y para una paleta con opinión.

Lo que este sitio **no** es: no es una landing que convierte por fricción, no es una aplicación, y
no es un escaparate de tarjetas. Nadie viene a completar una tarea; vienen a formarse un juicio.

Dirección de estrategia cromática: **saturada por compromiso** — una superficie oscura continua que
ocupa todo el sitio, y el color saturado reservado a un único sitio (la fotografía de proyecto). No
es restraint: no hay neutros de relleno alrededor. Los valores exactos los fija la sección
[Color](#color).

## Color

Decidido en el ticket
[El sistema visual oscuro: color, grano y escala tipográfica](https://github.com/i-casaca/portfolio-test-migration/issues/38),
viendo un prototipo real contra las fotos de los proyectos — no eligiendo sobre una paleta abstracta.

### Los dos tokens

```css
--bg:       oklch(22% 0.014 50);   /* #201915 — fondo, toda la superficie */
--surface1: oklch(27% 0.014 50);   /* un paso elevado: franja de contacto, tarjetas, muro NDA */
--surface2: oklch(32% 0.014 50);   /* dos pasos: hover sobre una superficie ya elevada */
--ink:      oklch(92% 0.018 78);   /* #EBE3D8 — texto, bordes, iconografía */
--line:     oklch(92% 0.018 78 / .14);
```

Contraste `--bg`/`--ink`: **13,6:1**, muy por encima del mínimo de 4.5:1. La profundidad entre
`--bg`/`--surface1`/`--surface2` sale de subir la luminosidad manteniendo el mismo tono y croma —
nunca de una sombra — que es como se construye elevación en un registro oscuro.

**Solo dos tokens, deliberadamente.** No hay un tercer color de acento: la fotografía de proyecto es
la única fuente de color saturado del sitio. Ver [Excepciones deliberadas](#excepciones-deliberadas).
Sustituye por completo a la paleta crema/menta del MVP (`--cream`, `--mint`, `--ink` en
`assets/css/site.css`), que desaparece de `:root`.

**Toda opacidad usada como color de texto se fijó en ≥ 0,55.** Es el suelo real: por debajo de eso el
hueso sobre `--bg` cae de 4,97:1 hacia abajo y dejar de cumplir AA en texto que no es grande. Un
`.disclaimer` a 0,5 y un `cv-year` a 0,5 se detectaron así durante la implementación y se subieron a
0,6. Antes de bajar una opacidad de texto por debajo de 0,55, hay que volver a medir.

### El grano

Capa fija en `position:fixed`, generada con un `<feTurbulence>` servido como SVG en un data-URI —
cero assets nuevos que commitear. Se anima con `steps(4)` sobre un `translate` de cuatro posiciones,
para que el ruido salte en vez de deslizarse (respeta `prefers-reduced-motion`: sin animación, la
textura se queda fija).

**Opacidad: 0,07.** Se probó primero a 0,045 (casi imperceptible) y se subió a petición explícita de
Ismael tras ver el prototipo — "más presente". El límite superior probado antes de que empiece a
leerse como suciedad en vez de textura está sobre 0,08; 0,07 se queda con margen deliberado por
debajo de ese límite.

**Dónde vive en el HTML**: el `<div class="grain">` va como **último hijo de `<body>`** en las seis
páginas. Al ser `position:fixed` sin `z-index` explícito, pinta por encima del contenido que tampoco
tiene `z-index` propio, por orden de documento — no hace falta tocar el de ninguna sección normal.
Lo que sigue por delante a propósito, porque ya llevaba su propio `z-index` más alto: el punto de
cursor (9999), el panel de transición entre páginas (9998/10000) y la burbuja del chat (60/61). Si
se reordena el HTML de una página, el div hay que devolverlo al final.

### Los tonos del hero (una decisión no pedida por el ticket)

El `hero-grid` de la home ya tenía un tono pastel por proyecto (`data-tone`) que teñía todo el hero
al pasar el ratón — pensado para una página clara con texto oscuro encima. Con el fondo oscuro, ese
mismo pastel dejaba el titular hueso ilegible sobre sí mismo (texto claro sobre fondo claro).

Se oscureció cada tono a los mismos hue en OKLCH pero L≈28%, manteniendo la identidad cromática por
proyecto y devolviendo el contraste (~11,4:1 con `--ink` en los seis). No estaba en el alcance
escrito del ticket, pero dejarlo tal cual habría roto una interacción existente — está documentado
aquí, no en el issue, porque es una consecuencia directa de los dos tokens de arriba.

## Tipografía

Las fuentes las eligió el ticket
[Fuentes: una familia de muchos anchos y las displays de la entrada](https://github.com/i-casaca/portfolio-test-migration/issues/37)
(informe completo y mediciones en
[`research/fuentes-sistema-tipografico.md`](research/fuentes-sistema-tipografico.md)). La escala la
fijó el ticket
[El sistema visual oscuro](https://github.com/i-casaca/portfolio-test-migration/issues/38), que
también sustituyó los `<link>` de las seis páginas.

### La familia del sitio: Roboto Flex

Una sola familia para todo, recorrida a lo ancho. La variedad tipográfica sale de cruzar el eje de
ancho con el de peso, no de mezclar familias — es una elección deliberada, y está protegida en
[Excepciones deliberadas](#excepciones-deliberadas).

Licencia OFL 1.1, servida por Google Fonts, **59,7 kB** en el subset `latin` (que basta: `¡`, `¿` y
las vocales acentuadas viven en U+0000–00FF, así que el castellano no necesita `latin-ext`). Ejes
`wdth 25–151` y `wght 100–1000` — el recorrido de ancho más amplio de cualquier libre pensada para
texto, y menos peso que alternativas con la mitad de recorrido.

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wdth,wght@25..151,100..1000&display=swap" rel="stylesheet">
```

Los escalones se declaran con las propiedades altas de CSS (`font-stretch` y `font-weight`), no con
`font-variation-settings`, para que hereden y cascadeen con normalidad:

```css
:root { --f: "Roboto Flex", "Helvetica Neue", Arial, sans-serif; }

.t-fino       { font-weight: 200; font-stretch: 100%; }
.t-normal     { font-weight: 400; font-stretch: 100%; }
.t-medio      { font-weight: 500; font-stretch: 100%; }
.t-ancho      { font-weight: 500; font-stretch: 125%; }
.t-fino-ancho { font-weight: 200; font-stretch: 140%; }
.t-muy-ancho  { font-weight: 700; font-stretch: 151%; }
.t-condensada { font-weight: 800; font-stretch:  40%; }
```

**La objeción, dicha en voz alta**: en su ajuste por defecto (`400 / 100%`) Roboto Flex se lee como
Roboto. Se aceptó a sabiendas, porque en este sistema casi nunca está en ese ajuste y porque la
personalidad la ponen las displays de la entrada. Si algún día sabe a poco, las suplentes son
**Anybody** (más carácter, casi el mismo peso, pero dibujada para tamaños grandes) y **Archivo**
(sólida en cuerpo, 90 kB, y solo llega a 125% de ancho). El cambio es una línea, porque los
escalones se definen una sola vez.

### Las cuatro displays de la entrada

Se usan **solo** en la secuencia de entrada, un saludo cada una, y en ningún otro sitio del sitio.
Están elegidas por disparidad —cada una destaca en un eje distinto— para que ninguna se parezca a la
de al lado:

| Aporta | Familia | Licencia | Peso |
|---|---|---|---|
| Masa | Rubik Mono One | OFL 1.1 | 916 B |
| Gesto | Rock Salt | **Apache 2.0** | 1.576 B |
| Proporción | Bebas Neue | OFL 1.1 | 1.072 B |
| Estructura | Monoton | OFL 1.1 | 696 B |

**4,2 kB las cuatro juntas**, porque se piden con `?text=` y solo llegan los glifos de su propia
palabra — el mismo truco que ya usan los heroes de proyecto. Rock Salt es Apache 2.0 y no OFL: no
cambia nada en la práctica, pero no se debe escribir "todas OFL" en ningún sitio.

Dos cosas que hay que respetar al tocar los `<link>`:

1. El `¡` va URL-encoded como `%C2%A1`. Sin encodear, el `<link>` es frágil.
2. **Si cambian las palabras de los saludos, hay que cambiar el `?text=`.** Es el precio del truco:
   una letra nueva se renderiza con la fuente de fallback y nadie se entera hasta verlo. Las
   palabras las fija el [#40](https://github.com/i-casaca/portfolio-test-migration/issues/40), así
   que ese ticket tiene que volver aquí.

Rubik Mono One **no tiene minúsculas reales**: lo que vaya en ella se verá en caja alta pase lo que
pase. Bebas Neue y Monoton sí las tienen, en contra de lo que suele decirse de Bebas.

### La escala

Un solo `clamp()` en la raíz — no uno por token — con los pasos declarados en `rem` para que
respiren de golpe con el viewport:

```css
:root{
  --root-fs: clamp(16px, 1rem + 0.22vw, 18px);

  --fs-micro:   0.7rem;    --lh-micro:   1.4;
  --fs-small:   0.875rem;  --lh-small:   1.5;
  --fs-body:    1rem;      --lh-body:    1.68;
  --fs-lead:    1.333rem;  --lh-lead:    1.45;
  --fs-h3:      1.777rem;  --lh-h3:      1.25;
  --fs-h2:      2.369rem;  --lh-h2:      1.15;
  --fs-h1:      3.16rem;   --lh-h1:      1.08;
  --fs-display: 4.6rem;    --lh-display: 0.95;
}
html{ font-size: var(--root-fs); }
```

**El suelo (16px) protege la accesibilidad, no solo la legibilidad**: por debajo de eso el cuerpo
falla el mínimo de 16px que pide WCAG en móvil. El techo (18px) es deliberadamente estrecho — el
cuerpo apenas respira entre extremos — porque el peso de la fluidez lo llevan los pasos grandes: al
ser múltiplos del mismo root, un `--fs-display` de 4,6rem se mueve ~9px entre suelo y techo mientras
el cuerpo se mueve ~2px. Es la corrección directa a la trampa que traía la referencia original: sin
suelo ni techo, una escala así se dispara en monitores grandes y se vuelve ilegible en móvil.

**El paso `--fs-display` tiene techo propio.** El límite general de impeccable para titulares es
6rem/96px. El hero-title de la home multiplica `--fs-display` por un `--sz` de hasta 1,15 según el
proyecto — `4.6 × 1.15 × 18px ≈ 95px`, justo bajo el límite incluso en el caso más ancho a viewport
máximo. Antes de este ticket, ese mismo elemento llegaba a 8rem/128px sin techo real.

Line-height emparejado a cada paso: apretado en display (0,95, cerca del ~90% de referencia), suelto
en cuerpo (1,68). Ese 1,68 se sale incluso de lo que esta misma sección llama "lo típico" (1,5-1,6):
se aceptó el exceso porque los tres ejes de compensación —peso, tracking e interlineado— se subieron
juntos y a ojo contra las capturas del prototipo, no se derivaron de una fórmula. Si en una pasada
futura el cuerpo se lee suelto en vez de solo aireado, este es el primer valor a bajar, hacia 1,55-1,6.

### Fundiciones descartadas

**Fontshare queda fuera**, y por dos motivos independientes: ninguna de sus 100 familias tiene eje
`wdth`, y su licencia prohíbe modificar la fuente sin permiso escrito — o sea, prohíbe subsetear,
que es la técnica sobre la que se apoya todo lo de arriba. Por eso el sistema es OFL y Apache de
principio a fin.

## Layout

Decidido en el ticket
[El índice de proyectos y su preview a sangre](https://github.com/i-casaca/portfolio-test-migration/issues/41),
sobre un prototipo real ([`.scratch/prototype-41-indice.html`](.scratch/prototype-41-indice.html))
con las fotos de proyecto ya en `assets/images/`.

Contenedor general: `min(88vw, 1440px)` centrado, alineado con el gutter del nav (6vw), medida de
texto controlada por párrafo, no por contenedor.

### El índice de proyectos

Sustituye a la rejilla interactiva de 6 celdas que ocupaba el hero de la home. Es una lista
numerada (`01`–`05`), un ítem por proyecto: número, nombre a gran tamaño, y categoría/año alineados
a la derecha. Al pasar el cursor o dar foco a un ítem, la foto de ese proyecto (`hero.jpg`) aparece
**a sangre, ocupando todo el hero, detrás de la lista**, a un 50% de opacidad con un velo en
gradiente (más fuerte a la izquierda, donde vive el texto) para que el índice y la meta se sigan
leyendo encima. El ítem apuntado pasa a cursiva; el resto baja a 0,32 de opacidad — todo con
`:has()`, sin JavaScript de por medio salvo para decidir qué foto encender.

**Sin hover**: superficie oscura lisa, sin foto — no hay un proyecto "por defecto" que insinuar.

**Solo 5 proyectos, no 6.** "Sobre mí" ya no vive en este índice — el nav ya enlaza a esa sección, y
el ticket lo pedía enfocado solo en los proyectos.

**El `works-section` (filas alternadas con foto) se retiró.** Vivió una primera vuelta como listado
secundario debajo del índice, pero al verlo en vivo repetía los mismos 5 proyectos dos veces en la
misma página — decisión revertida en cuanto se vio construida, que es exactamente para lo que sirve
un prototipo real. El índice de arriba es ahora el único listado de proyectos de la home, y
`#trabajo` (el ancla del nav) apunta directamente al hero.

Sin el works-section como respaldo, el requisito de "que no puede ser 'no se ven las imágenes' en
móvil" recae en el propio índice: cada `.index-item` lleva una miniatura fija (`.index-thumb`,
56×56px) junto al número, oculta en escritorio (ahí la foto es la de sangre) y visible solo bajo
`(hover:none), (max-width:760px)`. Los 3 proyectos con NDA la llevan difuminada (`blur(5px)`), el
mismo lenguaje visual que ya usaba el `work-media.is-locked` retirado.

**Los 3 proyectos con NDA** llevan su candado (`🔒 NDA`) como una etiqueta más dentro de la línea de
meta, no como una marca aparte que rompa el ritmo de la lista.

**Se retiró con la rejilla**: la distorsión líquida del titular (ticket #6) no tenía un sitio claro
con una fotografía real detrás — el cursor a medida (el punto de 24px) es independiente y se queda.

## Motion

Decidido en el ticket
[Cimientos de motion: GSAP y Lenis por CDN, y la tabla de eases](https://github.com/i-casaca/portfolio-test-migration/issues/39).
Este ticket no diseña ningún movimiento nuevo — pone la base sobre la que se construyen la entrada
([#40](https://github.com/i-casaca/portfolio-test-migration/issues/40)) y las transiciones de página
([#42](https://github.com/i-casaca/portfolio-test-migration/issues/42)).

### La carga

GSAP 3.13 (núcleo + ScrollTrigger + SplitText + TextPlugin — GSAP 3.13 liberó los plugins que antes
eran de pago del Club GreenSock) y Lenis, servidos por CDN (`jsdelivr`), sin build ni bundler. Las
seis páginas cargan el mismo bloque de `<script defer>`, en este orden: GSAP → ScrollTrigger →
SplitText → TextPlugin → Lenis → `assets/js/motion.js` → `page-transition.js` → `reveal.js`. Todo
`defer`, no bloqueante: los navegadores ejecutan los scripts `defer` en orden de documento tras el
parseo, así que no hace falta bloquear el primer pintado para garantizar el orden.

`assets/js/motion.js` es el único sitio que registra los plugins de GSAP, engancha Lenis al ticker
de GSAP (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add(...)`, con `lagSmoothing(0)`)
y publica `window.Motion`. Si el CDN no responde, `Motion.ready` queda en `false` y cualquier script
que lo consulte cae a su alternativa sin animación — el sitio nunca depende de que esto cargue.
`Motion.lenis` queda expuesto para quien necesite parar el scroll (la entrada) o saltar a un punto
(las transiciones), en vez de que cada ticket cree su propia instancia.

### La tabla de eases y duraciones

```js
Motion.ease = { enter: 'power3.out', exit: 'power3.in', move: 'power2.inOut' };
Motion.dur  = { enter: 0.8,          exit: 0.5,          move: 0.6 };
```

`move` es para transiciones de página y cambios de tamaño, no para entradas/salidas de contenido.
`back.out`/`elastic.out` no tienen token propio a propósito — son toques de personalidad puntuales
que cada ticket que los use debe escribir explícitos, nunca un default que se herede sin pensarlo.

### La gramática de texto

Los caracteres entran desde abajo y salen por arriba, con stagger. El movimiento **siempre**
continúa en la misma dirección — nunca se deshace hacia atrás. Es la regla que más define el
carácter del sitio: nada de texto que "rebota" o vuelve sobre su propio recorrido.

Para partirlo, SplitText con `mask:"words"` (envuelve cada palabra en un elemento con
`visibility:clip` — no hace falta declarar ese enmascarado a mano). Lo que SplitText no cubre, y
vive en `[data-split]`/`.char` en `site.css`:

- `font-kerning:none; font-variant-ligatures:none;` en el contenedor que se parte — si no, el texto
  cambia de anchura entre su estado entero y su partido.
- `line-height:1.2; padding-bottom:.2em;` en cada carácter — sin ese margen, la máscara de la
  palabra recorta los descendentes (g, j, p, q, y) por abajo.

Sin uso todavía en ninguna página: lo consumen la entrada y las transiciones.

### La aparición de imágenes: reveal.js sobre ScrollTrigger

`assets/js/reveal.js` sustituye el `IntersectionObserver` original por un `gsap.to()` con
`scrollTrigger:{start:'top 88%', once:true}` por cada `.media`. La ventaja sobre el observer no es
solo estética: si la página se carga ya desplazada más allá del punto de disparo (vuelta con el
historial, ancla directa), ScrollTrigger dispara la animación en su primer refresh en vez de esperar
a un cruce que ya no va a llegar — el observer necesitaba una redada manual (`sweepAbove`) para ese
caso, que ya no hace falta.

Los triggers no se crean hasta que la página termina de cargar y las fuentes están listas
(`window.load` + `document.fonts.ready`, en paralelo). Es la corrección a un fallo real encontrado
construyendo este ticket: si un trigger `once:true` se crea contra un documento que aún no ha
asentado su alto (fuentes con `display=swap` sin aplicar todavía), ScrollTrigger puede calcular una
posición corta, darla por "ya cruzada", disparar la animación entera de golpe y autodestruirse —
y un refresh posterior no revive un trigger `once` que ya se mató. Esperar a que asiente antes de
crear ninguno evita la clase entera de fallo, en vez de corregirlo después.

`site.css` ya no lleva una `transition` CSS sobre `.media`: la anima GSAP directamente, y una
transición CSS sobre las mismas propiedades competiría con ella en vez de sustituirla. `.is-visible`
sigue existiendo solo para las alternativas sin animación (sin GSAP, o con menos movimiento), que
revelan de golpe con un cambio de clase.

### `prefers-reduced-motion`

El compromiso de accesibilidad vive en
[PRODUCT.md](PRODUCT.md#accessibility--inclusion); aquí se traduce a movimiento concreto. Con
`Motion.reduced`, Lenis no se inicializa (scroll nativo) y `reveal.js` muestra todas las `.media` de
golpe por clase, sin crear ningún trigger ni tween. No es la ausencia de animación con el contenido
a medias: es la versión quieta del estado final.

## Entrada del sitio

**Pendiente** — la fija el ticket
[#40](https://github.com/i-casaca/portfolio-test-migration/issues/40).

Dirección ya decidida: la entrada **no es un overlay**, es la primera sección de la página. Por eso
su salida y la llegada al hero son el mismo movimiento y no hay corte.

## Transiciones de página

Decidido en el ticket
[La transición del índice a la página de proyecto](https://github.com/i-casaca/portfolio-test-migration/issues/42),
en conversación antes de construir. Sustituye por completo a `assets/js/page-transition.js` (el
panel oscuro con spinner que subía y bajaba): las dos filosofías no pueden convivir — un panel que
tapa la pantalla es justo lo que este ticket pedía no hacer.

### El mecanismo: View Transitions nativas, no JS

Dos caminos posibles para un sitio estático multipágina: **View Transitions nativas**
(`@view-transition{navigation:auto}` + `view-transition-name`, cero JavaScript, el navegador hace
el morfismo) o **reconstruir la navegación por AJAX** (control total, pero historial, foco, scroll y
ejecución de scripts de la página entrante hay que gestionarlos a mano).

Se eligió lo primero, con este razonamiento:

- El morphing de la imagen compartida —lo que pide el ticket— es exactamente lo que
  `view-transition-name` hace por defecto: el navegador interpola tamaño y posición entre las dos
  capturas solo. No hace falta programar "empieza a sangre y se asienta en su hueco de layout"; es
  la animación por defecto de un elemento con nombre.
- Comprobado en `caniuse`/MDN al decidir: Chrome, Edge y Safari (desde 18.2) ya lo soportan —
  ~85% de cobertura global, todo Chromium y WebKit. Solo falta Firefox.
- **Degrada sin escribir nada de más.** Si el navegador no soporta `@view-transition`, la regla se
  ignora y la navegación es la de siempre: normal, sin JS, sin error. Firefox ve el sitio de hoy,
  no una versión rota — al contrario que la alternativa AJAX, que habría exigido mantener dos
  caminos de navegación en paralelo para llegar al mismo sitio.
- Cero JavaScript encaja mejor con "sin build, sin bundler" que ya rige el sitio que programar a
  mano lo que el navegador ya resuelve solo.

### La coreografía

```css
@view-transition{ navigation:auto; }
```

en `site.css`, con tres grupos de elementos nombrados:

- **`.nav` → `nav`.** Idéntica en las seis páginas: con el mismo nombre a los dos lados, el
  navegador la trata como una sola pieza que persiste, en vez de cruzar-desvanecer dos capturas
  casi iguales (que se leería como un parpadeo).
- **La imagen compartida → `project-cover`.** En el índice, solo la foto que está `.is-on` la
  lleva (nunca varias a la vez: dos elementos con el mismo nombre en un documento invalida la
  transición entera, y `.is-on` ya es un estado exclusivo por el JS existente). En las cinco
  páginas de proyecto, la primera `.media` dentro de `.project-body` — una sola regla en
  `site.css`, porque esas dos clases son comunes a las cinco. Sin foto activa (llegada directa,
  sin pasar por el índice), la imagen de la página nueva simplemente entra sola, sin réplica que
  morfear — degradación aceptable, no error.
- **Los ítems del índice → `index-item-1`…`index-item-5`, y `hero-eyebrow`.** Solo existen en
  `index.html`, así que su CSS vive en el `<style>` de esa página, no en `site.css`. Salen hacia
  arriba en cascada corta (`::view-transition-old`, 0,32s, 40ms de diferencia entre ítems) mientras
  la foto se queda quieta. Las páginas de proyecto no tienen índice con el que emparejar una
  entrada, así que al volver estos nombres reaparecen solos (`::view-transition-new`) sin salida
  previa que deshacer — la propia asimetría del par old/new da "la vuelta es el espejo exacto" que
  pedía el ticket sin escribirlo dos veces. La entrada rebobina el gesto: el último ítem en salir
  (`index-item-5`) es el primero en volver.

`--ease-move`/`--dur-move` en `site.css` traducen `Motion.ease.move`/`Motion.dur.move` (GSAP,
`assets/js/motion.js`) a un `cubic-bezier` — las View Transitions son CSS puro y no pueden llamar a
un ease de GSAP por nombre.

### `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce){
  @view-transition{ navigation:none; }
}
```

Apaga el morfismo entero, no solo sus curvas: con menos movimiento, el salto de página tiene que
ser eso, un salto — no una versión más lenta del mismo gesto.

## Interacción

**Pendiente** — todavía en la niebla del mapa
[#35](https://github.com/i-casaca/portfolio-test-migration/issues/35): cursor, rollovers,
subrayados animados y estados de foco.

Lo único cerrado: el foco de teclado tiene que ser visible en todo lo navegable. Un `outline: none`
sin sustituto es un fallo, no una decisión de estilo.

## Excepciones deliberadas

Decisiones de este sitio que contradicen los defaults de `/impeccable`. **No son descuidos y no se
deben "corregir".** Si una pasada del skill propone quitar algo de esta lista, la respuesta es no.

### 1. El índice numerado de proyectos y la navegación numerada

`impeccable` trata los marcadores `01 / 02 / 03` como andamiaje automático y los elimina, porque en
la mayoría de las páginas numeran secciones que no son una secuencia.

Aquí sí lo son. El índice de proyectos es una lista ordenada de verdad —un trabajo detrás de otro,
en un orden que el visitante recorre— y la numeración es voz de marca, no relleno. Lo mismo vale
para la navegación numerada que acompaña al índice: numera los mismos elementos, en el mismo orden,
y sirve para saber por dónde vas. **Las dos se quedan.**

Construidas en el ticket
[El índice de proyectos y su preview a sangre](https://github.com/i-casaca/portfolio-test-migration/issues/41)
(ver [Layout](#layout)), sustituyendo a la rejilla de seis celdas que llevaba la home antes. Esta
excepción quedó escrita antes de construirlas a propósito — si no estuviera puesta, la primera
pasada del skill que las vea las trataría como andamiaje y las quitaría.

### 2. El hueso como tinta, no como superficie

`impeccable` prohíbe la banda crema/arena/hueso como fondo de página, y marca como sospechosos los
nombres de token del tipo `--bone` o `--cream`. Es una prohibición correcta: ese fondo es el default
saturado de la IA actual.

Aquí el hueso es **tinta sobre una superficie oscura**, que es exactamente el caso contrario. La
prohibición no aplica, y el token no se debe reemplazar por un blanco neutro "por seguridad".

### 3. Una sola familia tipográfica

`impeccable` desconfía de las páginas monofamiliares porque casi siempre lo son por reflejo, no por
criterio. Aquí la decisión es deliberada y es el motor del sistema: el contraste tipográfico sale de
recorrer los anchos de una familia, y la personalidad se concentra en las displays de la entrada.
**No se debe emparejar con una segunda familia de cuerpo.**

### 4. Ausencia de color de acento

Un sistema sin accent color parece incompleto vista la lista de comprobación habitual. Aquí es el
argumento entero: la fotografía de proyecto es el único color saturado del sitio, y meter un acento
propio le quitaría ese trabajo. **No añadir un accent token.**

### Lo que NO es una excepción

El `eyebrow` en mayúsculas y espaciado que hoy encabeza cada sección de `index.html` (`↳ Trabajo`,
`↳ Sobre mí`, `↳ Cómo trabajo`, `Contacto`) **no** está en esta lista. Es el patrón que `impeccable`
identifica como andamiaje repetido, y aquí se está usando exactamente así: encima de todas las
secciones, sin que ninguna lo necesite. Queda pendiente de revisión; no lo defiendas como voz de
marca.
