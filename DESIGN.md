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

### Los dos colores

```css
--c-negro: oklch(22% 0.014 50);   /* #201915 */
--c-hueso: oklch(92% 0.018 78);   /* #EBE3D8 */
```

Son los **únicos literales de color del sitio**. Todo lo demás —fondo, tinta, superficies, líneas—
se deriva de ellos y del eje `--t` (ver [La inversión](#la-inversión)).

**Solo dos, deliberadamente.** No hay un tercer color de acento: la fotografía de proyecto es la
única fuente de color saturado del sitio. Ver [Excepciones deliberadas](#excepciones-deliberadas).
Sustituye por completo a la paleta crema/menta del MVP (`--cream`, `--mint`, `--ink` en
`assets/css/site.css`), que desaparece de `:root`.

### La inversión

Decidido en el ticket
[El índice en claro](https://github.com/i-casaca/portfolio-test-migration/issues/54).

**El sitio no tiene dos temas: tiene un eje.** El claro no es una zona del documento — es el mundo de
los proyectos. La página entera se va invirtiendo conforme la lista de proyectos toma la pantalla, y
se deshace por los dos lados: subiendo al hero, o bajando a "Sobre mí".

```css
--t:   /* 0 = oscuro · 1 = claro. Continuo. Mueve el FONDO. */
--tk:  /* 0 ó 1. Salta en t = 0,48. Mueve la TINTA. */

--bg:  color-mix(in oklab, var(--c-negro), var(--c-hueso) calc(var(--t)  * 100%));
--ink: color-mix(in oklab, var(--c-hueso), var(--c-negro) calc(var(--tk) * 100%));
--surface1: color-mix(in oklab, var(--bg), var(--ink) 7%);
--surface2: color-mix(in oklab, var(--bg), var(--ink) 14%);
--line:     color-mix(in oklab, transparent, var(--ink) 13%);
```

`assets/js/tema.js` escribe `--t` y `--tk`, **y nada más en el sitio los escribe**. El progreso se
mide por **ocupación** —qué fracción de la pantalla cubre la lista, entre 0,18 y 0,62— y no por
posición de scroll: así las rampas de entrada y salida salen simétricas solas, sin escribir dos
cálculos.

**Los dos colores intercambian su papel, no se añade ninguno.** El hueso deja de ser tinta y pasa a
ser superficie. Por eso el contraste sale idéntico en los dos extremos —**13,63:1**— sin calibrar
una paleta nueva: es literalmente el mismo par. Y las superficies, derivadas empujando el fondo
*hacia* la tinta, cambian de sentido solas: en oscuro un paso elevado sale más claro, en claro más
oscuro, sin dos juegos de valores. La elevación sigue construyéndose moviendo luminosidad, nunca con
una sombra.

Se mezcla **en oklab**: el camino recto entre los dos pasa por grises neutros en vez de por un marrón
sucio a mitad de recorrido.

#### Por qué el fondo fluye y la tinta salta

Si fondo y tinta cruzan a la vez, a mitad de camino **son el mismo color y el texto desaparece**.
Medido: 1,00:1 en `t = 0,5`, y por debajo de AA durante el 56% de la rampa. Es inevitable mientras
ambos viajen juntos, porque los dos extremos son el mismo par intercambiado.

Por eso la tinta va en su propio eje y da un **único salto en `t = 0,48`**. Ese número está
calculado, no elegido: es el punto donde el fondo a medio camino contrasta lo mismo con los dos
extremos de tinta (3,72:1 con el hueso, 3,67:1 con el negro), así que saltar ahí **maximiza el peor
instante de todo el recorrido**.

Medido sobre el scroll real completo: peor contraste **3,72:1**, y solo **60 px de 3376** por debajo
de AA — el instante del salto.

#### Nada de esto se anima con `transition`

La primera versión ponía una `transition` sobre `html.tema-volteando *`. Cientos de elementos
arrancando cada uno su propia animación, que el navegador no puede iniciar en el mismo fotograma, y
lo que no es color (imágenes, capas, pseudos) saltaba de golpe mientras el resto interpolaba: **un
parpadeo escalonado**, bien visible, detectado al verlo correr.

**La regla que sale de ahí: para invertir la página entera, anima UN valor y deriva el resto.** Con
un solo número, todos los tokens se recalculan en el mismo paso de estilo y es imposible que se
desincronicen. `--t` y `--tk` se escriben en el mismo turno de JS por la misma razón.

Un parpadeo es que las cosas cambien en momentos distintos. El salto de la tinta es lo contrario:
una propiedad, un elemento, todo el texto del sitio a la vez.

#### El suelo de opacidad no se hereda

**Toda opacidad usada como color de texto se fijó en ≥ 0,55** para el extremo oscuro: por debajo de
eso el hueso sobre el negro cae de 4,97:1 hacia abajo y deja de cumplir AA en texto que no es grande.
Un `.disclaimer` a 0,5 y un `cv-year` a 0,5 se detectaron así durante la implementación y se
subieron a 0,6.

**Ese suelo no vale en el otro extremo, y no por poco.** El mismo alfa 0,55 da 4,97:1 sobre negro
pero **3,62:1 sobre hueso**; el mínimo para AA sube de 0,52 a **0,63**. Cuatro reglas de texto
secundario caían por debajo de AA al invertir. Por eso los escalones interpolan con `--tk` en vez de
quedarse fijos:

```css
--dim-faint: calc(.5 + .13 * var(--tk));   /* numeración del índice */
--dim:       calc(.6 + .08 * var(--tk));   /* metadatos, pies, notas */
```

El atenuado del hover del índice sigue la misma regla por el mismo motivo:
`calc(.32 + .10 * var(--tk))`, que da 2,55:1 en oscuro y 2,53:1 en claro — el mismo grado de
atenuación a los dos extremos. No cambia la decisión del #41, la mantiene.

**Antes de escribir una opacidad de texto, hay que medirla en los dos extremos.** Uno solo no basta.

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

Decidida en el ticket
[La entrada del sitio: la secuencia de saludos y su fusión con el hero](https://github.com/i-casaca/portfolio-test-migration/issues/40),
prototipando en el navegador y corrigiendo en vivo: el ritmo, el tamaño, el indicador de carga y el
glitch se afinaron viéndolos, no describiéndolos.

La entrada **no es un overlay**: es la primera sección de la página (`<section class="entry">`, a
`100dvh`). Por eso su salida y la llegada al hero son el mismo movimiento y no hay corte.

### La secuencia

Cuatro saludos que trocean una frase — **"Jack of all trades, master of some"** — uno por display
(Rubik Mono One, Rock Salt, Bebas Neue, Monoton, las que eligió el
[#37](https://github.com/i-casaca/portfolio-test-migration/issues/37)). Entran por caracteres desde
abajo y salen por arriba, con el siguiente ya entrando mientras el anterior sale: la gramática de
texto de [Motion](#motion), sin huecos entre uno y otro.

**Cada palabra se dimensiona por JS para llenar la pantalla** (`fitWord` en `assets/js/entry.js`):
se mide su caja real a un tamaño de sonda y se escala hasta el 92% del ancho o el 60% del alto, lo
que primero se cumpla. Un tamaño fijo no sirve porque las cuatro displays tienen proporciones muy
distintas — Monoton es alto y fino, Rubik Mono One corto y macizo. Es una **excepción deliberada** al
techo de 6rem/96px para titulares, pedida en vivo viendo el prototipo: aplica solo a este momento.

Toda la secuencia dura poco más de un segundo. La primera versión rondaba los tres y se sentía como
un peaje.

### El naming y su glitch

La frase desemboca en el logotipo, que **no entra por caracteres**: es la firma del sitio, no una
palabra más del chiste. Aparece con un glitch, aguanta **1,3 s quieto** —una permanencia de verdad,
no de pasada— y solo entonces vuela.

El glitch tiene una regla por encima de las demás: **el logo nunca deja de leerse**. Se corta en 12
bandas horizontales que entre todas lo recomponen exacto (con desplazamiento 0 son indistinguibles
del logo entero), y en cada paso solo se desliza ~30% de ellas. Se suman dos copias en rojo y verde
unos pocos px por detrás, que asoman por los cantos. Tres ráfagas, con un amago de recomponerse
entre una y otra que no llega a cuajar.

**Lo que se probó y se descartó**: deformar el trazo con turbulencia y `feDisplacementMap`. Rompía
el logo de verdad, pero lo dejaba ilegible —se leía como confeti— que es lo contrario de lo que se
busca. Los cantos limpios y el logo reconocible son la decisión, no una limitación. Si una pasada
futura propone "mejorar" el glitch añadiendo distorsión, ya se probó.

### El indicador de carga

Una rejilla de seis celdas cuyos puntos se encienden por turnos. Venía del panel de transición entre
páginas (`.pt-spinner`); el [#42](https://github.com/i-casaca/portfolio-test-migration/issues/42) sustituyó ese
panel por View Transitions nativas y se llevó su CSS, así que el spinner vive ahora en el `<style>`
de `index.html` como `.entry-spinner` — la entrada es el único sitio que lo usa.

### La entrega al hero

El logotipo vuela desde el centro hasta su sitio en la cabecera mientras la entrada se recoge y el
hero aparece debajo — un solo movimiento, no dos pasos. Desde el ticket
[#51](https://github.com/i-casaca/portfolio-test-migration/issues/51) (ver [Hero](#hero)), "el hero"
que aparece aquí es la sección `.hero-statement` (titular + polaroid), no solo el `hero-eyebrow` que
había antes — la línea de la timeline de `entry.js` que lo revela cambió de selector, no de
comportamiento.

**El relevo entre el logo volador y el wordmark real es instantáneo y simultáneo**, nunca un
fundido: mientras el volador está en pantalla, `html.naming-flying` mantiene oculto el wordmark del
nav, y ambos cambian en el mismo fotograma. Un fundido es exactamente lo que delataba el artificio,
porque durante la mezcla se leían como dos logos cruzándose. El relevo ocurre **0,5 s después de que
el vuelo termine**, para que no se pisen las dos animaciones.

### La visita repetida

La secuencia completa solo la primera vez (bandera `entry-seen` en `localStorage`); después se entra
directo al hero. Quien vuelve no paga la entrada cada vez.

Para probarla sin borrar el `localStorage` a mano, `?entrada` al final de la URL la fuerza. Es una
puerta de desarrollo: no cambia el comportamiento real.

### Mejora progresiva

`.entry` está `display:none` de partida y **solo** la enciende el JS cuando GSAP está listo, no se
pide menos movimiento y es la primera visita. Sin JS, sin GSAP o con `prefers-reduced-motion`, esta
sección no existe y el sitio entra directo por el hero. La entrada nunca es una puerta.

### El logotipo

Ismael aportó su logotipo como SVG. Se usa el horizontal (`assets/images/logo-full.svg`), declarado
una vez como `<symbol id="logo-full">` por página y referenciado con `<use>` desde el wordmark del
nav y desde el naming de la entrada — así volar de uno a otro es un cambio de tamaño del mismo
símbolo, no una sustitución. Va en `currentColor`, de modo que hereda el hueso de la paleta.
**Sustituye al wordmark de texto** en las seis páginas.

`assets/images/logo-mark.svg` (la versión cuadrada) queda en el repo sin usar todavía.

## Hero

Decidido en el ticket
[El hero: qué recibe al visitante entre la entrada y el índice de proyectos](https://github.com/i-casaca/portfolio-test-migration/issues/51).
Hasta este ticket, lo único entre la entrada y el índice era el `hero-eyebrow` ("Product Design &
UX") — andamiaje heredado del MVP, no una afirmación. PRODUCT.md nombra la línea que se recuerda a
los 10 segundos (*"Diseño sistemas, y sé cómo se construyen"*) y decía dónde tenía que vivir; en
ningún sitio del sitio se decía todavía.

### Qué dice, y cómo

La línea de PRODUCT.md, literal, sin variante — es la que el propio documento nombra como la que se
recuerda, así que parafrasearla habría sido reescribir una decisión ya tomada en otro documento.

**Una sola frase, no varias.** Se llegó a construir una versión con cinco frases rotatorias y un
control para cambiarlas; se descartó al verla en marcha. La razón está en el propio PRODUCT.md: la
línea que se recuerda a los diez segundos es **una**, y repartir el sitio del titular entre cinco la
diluía en vez de reforzarla. Con ella se fueron el control, su contador y todo el JS de relevo.

**La frase no se lee quieta: pasa.** Va en una **marquesina** que cruza la pantalla de lado a lado
sin parar, en bucle, a velocidad lenta para que dé tiempo a leerla entera. Ver
[La marquesina](#la-marquesina).

### Cuánto ocupa: media fila asomando

El alto del hero no es una cifra redonda ni un porcentaje elegido a ojo: está calculado para que por
debajo asome **media fila del primer proyecto**. Ese trozo de lista cortado por el borde de la
pantalla es lo que dice "sigue bajando" sin necesidad de una flecha, un "scroll" ni un indicador.

```css
min-height: calc(100svh - 6rem);   /* 5rem ≤1024 · 7rem ≤600 */
```

Lo que se resta es lo que va por debajo del hero hasta la mitad de esa primera fila: el padding
superior del bloque del índice (2,5rem) más media fila. **Cambia por breakpoint porque la fila cambia
de alto**: `.index-name` va por su tramo fluido en tablet (fila más baja, hay que restar menos) y en
móvil la fila crece porque lleva miniatura (hay que restar más). Medido: **51% asomando en
escritorio, 48% en tablet, 52% en móvil**. Si se toca el cuerpo de `.index-name` o el padding de
`.index-item`, estas tres cifras hay que recalcularlas.

`svh` y no `vh`: en móvil, con la barra del navegador desplegada, `vh` mide de más y la fila se iría
justo por debajo del corte — que es exactamente el efecto que este cálculo existe para producir.

**El bloque del índice perdió a la vez su `min-height:100vh` y su centrado vertical**, y su padding
superior de 7rem en móvil. Eran de cuando esa sección *era* el hero de la página y tenía que llenarla
ella sola; con una banda de titular delante, solo servían para dejar un hueco muerto entre las dos y
empujar la fila por debajo del corte. Efecto lateral buscado: la foto a sangre del índice
(`.hero-preview`, `inset:0`) pasa a cubrir exactamente la lista en vez de una pantalla entera, que es
a lo que apunta de verdad.

### La polaroid

El hero lleva una fotografía personal de Ismael, enmarcada como una polaroid: marco en `--ink`,
ligera rotación y sombra, anclada al **margen izquierdo** y con el titular superpuesto encima. Es una
excepción consciente y pedida en vivo, no la dirección por defecto: el sistema reserva la fotografía
de *proyecto* como única fuente de color saturado (ver [Color](#color)), y esa regla sigue en pie —
esta es una fotografía personal, en un momento del sitio que no compite con el índice de abajo.

**A la izquierda, no centrada bajo la frase.** Centrada se leía como un sello estampado detrás del
texto, no como una composición. Anclada al margen, es el **objeto quieto contra el que pasa la
marquesina** — y esa relación (una cosa fija, una cosa que se mueve) es la que hace que el cruce
tenga sentido en vez de parecer un accidente.

**Y bajada respecto al centro, que es de donde sale el interés.** La marquesina va centrada en la
banda; con la foto también centrada, la frase la partía exactamente por la mitad — dos ejes
simétricos que se anulan y se leen como una plantilla. Empujada hacia abajo, el texto le cruza por el
**22%** de su alto en escritorio y por el **11%** en móvil, dejando la cara despejada por debajo: el
mismo solape, pero descentrado.

El desplazamiento va en `top` (posición relativa) y **no** en `transform`: el parallax del ratón
reescribe `transform` entero en cada fotograma y se llevaría por delante cualquier desplazamiento
declarado ahí. Al ser relativo tampoco altera el alto de la sección, así que el cálculo de "media
fila asomando" se mantiene intacto. Y se mide sobre `--pw`, no sobre `vh`: atado al viewport, en
móvil la foto encogía pero el empujón no, y la frase acababa rozando el marco por fuera en vez de
cruzar la imagen.

La inclinación subió de -4° a **-5,5°** por el mismo motivo: con la foto ya descentrada, un ángulo
algo más marcado acaba de romper la retícula y la hace leer como una foto dejada ahí, no como una
imagen colocada en su hueco. **Ese ángulo está repetido en el JS del parallax**, que reescribe el
`transform` completo: si se cambia en el CSS y no allí, la foto se endereza en cuanto el ratón entra
en la banda.

**Las proporciones son las de una Polaroid real**: foto cuadrada (`aspect-ratio:1`), marco fino y
parejo arriba y a los lados (5% del ancho) y el pie más ancho (20%). Van declaradas en `calc()`
sobre una variable de ancho (`--pw`), no en px fijos, porque un padding fijo descuadra el marco en
cuanto la foto encoge: cambiar el tamaño en un breakpoint es tocar solo `--pw`.

**El marco de la polaroid usa `--ink` como superficie, no como tinta** — en apariencia, el caso
exacto que la [excepción #2](#excepciones-deliberadas) prohíbe. La diferencia es de escala y de
papel: la excepción prohíbe el hueso como *fondo de página*; aquí es el marco de un objeto físico
pequeño —una foto impresa—, que toma prestado el mismo token del sistema en vez de inventar un
blanco nuevo. Ver la nota ampliada en esa excepción.

La polaroid sigue el ratón con un parallax sutil (±28px horizontal, ±20px vertical, con `lerp` a
mano por `requestAnimationFrame`, sin GSAP): el script vive inline al final de `index.html`, antes
de que los `<script defer>` del `<head>` —GSAP incluido— terminen de cargar, así que no puede
depender de `window.gsap` ni de `window.Motion` sin arriesgarse a un `ReferenceError` según el orden
de carga. Comprueba `prefers-reduced-motion` de forma directa por el mismo motivo.

### El titular en negativo: una excepción con los números delante

El titular pasa a negativo donde cruza la foto (`mix-blend-mode:difference`) — la misma técnica que
ya usa `#cursor-dot` contra el resto del sitio (ver [Layout](#layout)), no un recurso nuevo.

**Esto incumple el compromiso de contraste de [PRODUCT.md](PRODUCT.md#accessibility--inclusion), y
se hace a sabiendas.** Está medido, no estimado, y se escribe aquí entero para que nadie lo
"arregle" por sorpresa ni lo repita sin saber lo que ya se probó.

Muestreando los píxeles reales de la franja de foto que la marquesina barre (159px de alto por todo
el ancho de la imagen, medido a 1440):

| Tratamiento de la foto | Peor contraste | % del área bajo 3:1 |
|---|---|---|
| Ninguno (foto a plena fuerza) | 1,00:1 | **8,1%** |
| Velo oscuro `--bg` al 40-60% | 1,00:1 | 59-61% |
| Velo oscuro `--bg` al 85% | 4,72:1 | 0% |
| Velo hueso `--ink` al 70% | 4,01:1 | 0% |

Las dos lecciones, que son contraintuitivas y por eso se dejan por escrito:

1. **Oscurecer la foto empeora el problema, no lo arregla.** El punto de fallo del `difference` está
   a media luminancia —donde el resultado de la resta coincide con el propio fondo— así que un velo
   oscuro hunde los tonos claros justo dentro de esa banda.
2. **Lo único que llega al 0% borra la foto.** Hace falta un velo del 70-85% para sacar toda la
   imagen de la banda peligrosa; a esa fuerza ya no hay fotografía que enseñar.

Tampoco vale limitar el cruce al marco (donde el contraste sí es de 13:1, por ser hueso liso): la
marquesina atraviesa la foto de lado a lado por definición, así que no hay recorrido que la esquive.

**El coste subió al pasar a marquesina, y se anota**: la versión anterior —titular estático,
superpuesto solo por el arranque de cada línea— dejaba un 4,1% del solape bajo 3:1. La marquesina
barre la foto entera, y el número se dobla hasta el 8,1%. Es el precio de que la frase cruce en vez
de posarse, y estaba sobre la mesa al decidirlo.

**La decisión, tomada por Ismael con esta tabla delante**: se queda el negativo. El coste real es que
ese ~8% de la franja barrida —los trazos que caen sobre medios tonos de la foto— baja del mínimo AA;
la media es de 10,4:1 y fuera de la foto el titular es `--ink` sobre `--bg`, **13,63:1 medido**. Va
en contra del principio 4 (*"Legible antes que impactante"*), y por eso aparece aquí como excepción
declarada y no como descuido: es exactamente el tipo de límite que el sitio dice declarar en vez de
esconder. **Atenuante real**: al moverse la frase, ningún trazo se queda parado en su punto malo — el
mismo carácter que ahora es ilegible sobre un medio tono, dos segundos después está sobre el fondo
liso a 13:1. La lectura se recupera sola; en un titular quieto no lo haría.

Si una pasada futura quiere recuperar el cumplimiento sin perder el gesto, la única vía que las
mediciones dejan abierta es **cambiar el fondo del cruce**: un bloque liso en `--ink` en lugar de la
fotografía da el mismo negativo a 13:1 garantizado. Oscurecer, aclarar o velar la foto ya está
probado y no lleva a ningún sitio.

### Coreografía con la entrada

El hero entero se revela en el mismo momento que el índice, dentro de la timeline de `entry.js`:
donde antes decía `.to(['.hero-eyebrow', '.project-index'], ...)`, ahora dice
`.to(['.hero-statement', '.project-index'], ...)` — un cambio de selector, no de tiempos. En visita
repetida (sin entrada) el hero aparece directo, sin la coreografía delante; ver
[La visita repetida](#la-visita-repetida).

### La marquesina

El titular no está quieto: cruza la pantalla **de lado a lado, en bucle y sin parar**, y la polaroid
se queda fija a su izquierda. Es la pieza que da sentido al solape — una cosa que pasa por delante de
una cosa que está.

**Tipografía al doble.** `clamp(4.8rem, 10.4vw, 10.4rem)`: exactamente el doble del titular estático
que había antes (149,8px contra 74,9px medidos a 1440 de ancho). Es una **excepción deliberada** al
techo de 6rem/96px que `/impeccable` pone a los titulares, del mismo tipo que la de los saludos de la
entrada: una frase que atraviesa la pantalla no tiene que caber, tiene que pasar.

**Lento, para que se lea.** ~65 px/s. La duración no es "la velocidad": el carril mide distinto en
cada viewport, así que va en una variable (`--marquee-dur`) que se ajusta por breakpoint (95s en
escritorio, 55s por debajo de 1024, 32s por debajo de 600) para que los píxeles por segundo se
parezcan en todos. Si se cambia el tamaño de letra, hay que revisar esas tres cifras.

**Cómo no se ve la costura.** Cuatro copias idénticas de la frase en el carril, y un recorrido del
50%: al terminar, las copias 3 y 4 están exactamente donde arrancaron la 1 y la 2, así que el salto
de vuelta a cero cae en un fotograma idéntico. El margen de separación va **en cada copia** y no como
`gap` del flex: con `gap` no hay hueco después de la última y el patrón deja de ser periódico. Dos
copias tienen que sumar más que el viewport para que nunca se vea el final del carril — a 1440 cada
copia mide ~3110px, así que sobra.

**Dónde vive el `mix-blend-mode`, y por qué ahí.** En `.hero-marquee`, la caja de fuera, **no** en
las copias de texto. El carril lleva un `transform` animado, y eso crea un contexto de apilamiento:
un blend declarado dentro del carril solo vería el fondo del propio carril —transparente— y no la
fotografía. Puesto en la caja de fuera, lo que se mezcla es el bloque entero contra el fondo de la
sección, foto incluida. Es el mismo tropiezo que ya obligó a no poner `z-index` en el envoltorio del
titular: cualquier cosa que cree un contexto de apilamiento entre la foto y el texto rompe el
negativo.

**Es CSS puro.** Una `@keyframes` y nada más: gira sin JavaScript, no depende de GSAP y no puede
quedarse a medias. El titular real es el primer `<h1>`; las otras tres copias van `aria-hidden` para
que un lector de pantalla no lea la misma frase cuatro veces seguidas.

**Con `prefers-reduced-motion`** no se para la marquesina —eso dejaría media frase fuera de la
pantalla—, sino que se sustituye: las copias se ocultan, el carril deja de ser un flex, y el titular
queda entero, centrado, envuelto a varias líneas y a un tamaño que cabe, con la foto encima y sin
blend. El estado final legible, no la animación congelada.

### El reclamo de scroll

Abajo y al centro de la banda, un reclamo que invita a bajar. Refuerza lo que ya dice la media fila
asomando: una lo insinúa por composición, el otro lo señala.

**No es un adorno: es un enlace real** al índice (`#trabajo`). Se tabula, se pulsa y lleva a donde
señala; el nombre accesible lo pone un texto oculto ("Ir a los proyectos") porque la pista y el
segmento son dibujo y van `aria-hidden`. Objetivo de 44×44px, holgado para el dedo.

**Por qué no es la flecha que rebota.** La gramática de movimiento del sitio (ver [Motion](#motion))
dice que el movimiento nunca deshace el recorrido, y rebotar es exactamente eso. Aquí un segmento
baja por una pista de un píxel, se desvanece al final y reaparece arriba **ya invisible**: no se le
ve subir nunca. La regla del sitio no se dobla para un adorno; se usa para elegir la forma del
adorno. Con `prefers-reduced-motion` el segmento se queda posado a media pista, como una marca —el
estado final, no la animación congelada en un punto cualquiera.

**El salto usa Lenis**, la instancia que publica `motion.js`, expuesta precisamente para "saltar a un
punto". Si Lenis no está —CDN caído, o `prefers-reduced-motion`, donde ni siquiera se inicializa— el
evento no se toca y el ancla del HTML hace su trabajo de siempre: el enlace nunca depende del script.

**Un detalle que costó encontrarlo y por eso se escribe**: a `lenis.scrollTo()` hay que pasarle un
**número**, no el elemento. Con un `HTMLElement` esta versión (1.1.18) no se mueve y tampoco lanza
ningún error — simplemente no pasa nada. La posición se resuelve antes
(`destino.getBoundingClientRect().top + window.scrollY`).

### Qué pasa con el `hero-eyebrow`

Absorbido y retirado. `DESIGN.md` ya lo anotaba como andamiaje heredado del MVP pendiente de
revisión (ver [Lo que NO es una excepción](#lo-que-no-es-una-excepción) — esa nota hablaba de otro
`eyebrow`, el de las secciones de abajo; el `hero-eyebrow` nunca estuvo en esa lista, y ahora ya no
existe). Su `view-transition-name` (`hero-eyebrow`) pasa al `<h1>` nuevo, renombrado a
`hero-statement`, y se declara sobre el id `#hero-titular` y nunca sobre la clase que comparten las
cuatro copias: dos elementos con el mismo nombre invalidan la transición entera. Ver
[Transiciones de página](#transiciones-de-página).

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
- **Los ítems del índice → `index-item-1`…`index-item-5`, y `hero-statement`.** Este último era
  `hero-eyebrow` hasta el ticket [#51](https://github.com/i-casaca/portfolio-test-migration/issues/51)
  (ver [Hero](#hero)); el renombre es mecánico, la coreografía no cambió. Solo existen en
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

### 2. El hueso, que es tinta y también superficie

`impeccable` prohíbe la banda crema/arena/hueso como fondo de página, y marca como sospechosos los
nombres de token del tipo `--bone` o `--cream`. Es una prohibición correcta: ese fondo es el default
saturado de la IA actual.

Hasta el ticket [#54](https://github.com/i-casaca/portfolio-test-migration/issues/54) esta excepción
se justificaba sola: el hueso era **solo tinta sobre una superficie oscura**, el caso contrario al
prohibido. Con la inversión, en el extremo claro **sí es el fondo de la página** — justo lo que la
regla prohíbe.

Sigue sin aplicar, y por un motivo más fuerte que el anterior: el hueso no se eligió como fondo. Es
el mismo token de tinta cumpliendo el otro papel durante el tramo de los proyectos, y el sitio vuelve
a oscuro en cuanto se sale de él. No hay una paleta crema, hay **dos colores que se intercambian**.
El token no se debe reemplazar por un blanco neutro "por seguridad", ni el extremo claro rediseñarse
como si fuera un tema independiente: en cuanto se le da color propio, deja de ser una inversión y el
contraste hay que recalibrarlo de cero.

**Matiz introducido en el ticket [#51](https://github.com/i-casaca/portfolio-test-migration/issues/51)
(ver [Hero](#hero)):** el marco de la polaroid del hero sí usa `--ink` como superficie — un objeto
físico pequeño, no el fondo de la página. La prohibición de esta excepción es sobre el *fondo de
página*, así que no aplica ahí tampoco, pero por una razón distinta a la del cuerpo de texto: no es
que el hueso sea tinta en vez de superficie, es que esa superficie concreta no es la página. Si en
algún momento se generaliza el hueso como superficie fuera de un objeto físico deliberado (una
tarjeta, un panel), eso sí rompería la excepción y habría que revisarlo.

### 3. Una sola familia tipográfica

`impeccable` desconfía de las páginas monofamiliares porque casi siempre lo son por reflejo, no por
criterio. Aquí la decisión es deliberada y es el motor del sistema: el contraste tipográfico sale de
recorrer los anchos de una familia, y la personalidad se concentra en las displays de la entrada.
**No se debe emparejar con una segunda familia de cuerpo.**

### 4. Ausencia de color de acento

Un sistema sin accent color parece incompleto vista la lista de comprobación habitual. Aquí es el
argumento entero: la fotografía de proyecto es el único color saturado del sitio, y meter un acento
propio le quitaría ese trabajo. **No añadir un accent token.**

### 5. El titular del hero en negativo sobre la foto

La única de esta lista que **no** contradice un default de `/impeccable`, sino un compromiso del
propio sitio: el de contraste AA de [PRODUCT.md](PRODUCT.md#accessibility--inclusion).

Sobre la fotografía a plena fuerza, el `mix-blend-mode:difference` del titular deja en torno a un 8%
de la franja que barre por debajo de 3:1 (media: 10,4:1). Está medido sobre los píxeles reales, con
la tabla completa de intentos de rescate en
[Hero](#el-titular-en-negativo-una-excepción-con-los-números-delante), y decidido por Ismael con esos
números delante.

**No se debe "corregir" oscureciendo, aclarando o velando la foto**: las tres vías están probadas y
empeoran o borran la imagen. La única salida que dejan las mediciones, si algún día se quiere
recuperar el cumplimiento, es cambiar el fondo del cruce por un bloque liso en `--ink` (13:1
garantizado).

Se lista aquí, y no escondida en una nota, porque el primer principio de marca es declarar el
límite: el sitio prefiere decir en voz alta lo que le cuesta este gesto antes que dejarlo sin
documentar.

### Lo que NO es una excepción

El `eyebrow` en mayúsculas y espaciado que hoy encabeza cada sección de `index.html` (`↳ Trabajo`,
`↳ Sobre mí`, `↳ Cómo trabajo`, `Contacto`) **no** está en esta lista. Es el patrón que `impeccable`
identifica como andamiaje repetido, y aquí se está usando exactamente así: encima de todas las
secciones, sin que ninguna lo necesite. Queda pendiente de revisión; no lo defiendas como voz de
marca.
