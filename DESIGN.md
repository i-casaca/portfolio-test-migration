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
cero assets nuevos que commitear. `baseFrequency: 1.2` con **dos** octavas: las octavas de más
añaden frecuencias bajas, que es lo que agrupa el ruido en manchas y lo hace leer como suciedad en
vez de como grano fino.

**Cadencia: doce saltos en 0,6 s (20 fps) con `steps(1,end)`.** No es un ajuste cosmético del bucle
original de cuatro posiciones en un segundo: `steps(4)` interpola en cuatro subpasos *dentro* de
cada intervalo, así que el ruido se deslizaba entre posiciones, y ese deslizamiento es exactamente
lo que delataba el bucle. Con `steps(1,end)` cada fotograma se mantiene quieto y salta. Veinte fps
es donde deja de leerse como "textura que se mueve" y empieza a leerse como **estática de
televisión**. Respeta `prefers-reduced-motion`: sin animación, la textura se queda fija.

**Lo que NO se hace, y por qué**: reanimar la semilla del `feTurbulence` daría estática real, pero
obliga al navegador a volver a filtrar el SVG en cada fotograma. Aquí el data-URI se rasteriza una
sola vez y lo único que se anima es un `transform` compuesto en GPU. Los desplazamientos no pasan de
±8%: la capa mide 150% con `inset:-25%`, así que hay 25% de margen por lado y nunca asoma un borde.

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

> **Revisado en el [#55](https://github.com/i-casaca/portfolio-test-migration/issues/55): la ida ya
> no la hacen las View Transitions.** Lo que sigue describe el mecanismo tal como se decidió, y
> sigue siendo cierto para **la vuelta** (proyecto → índice) y para el resto de la página. Pero el
> morfismo de la foto **hacia** el proyecto se hace ahora en dos fases de JS, y el porqué está en
> [La ida, en dos fases](#la-ida-en-dos-fases). No es un cambio de gusto: es que el navegador no
> captura la imagen flotante en el documento que sale.

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

### El relevo de tema no cruza porque no hay nada que cruzar

Decidido con [Las páginas de proyecto en el tema claro](https://github.com/i-casaca/portfolio-test-migration/issues/56).
El riesgo real de esta transición era interpolar dos temas dentro de `::view-transition-old/new` — un
destello si el fondo de una página cambia de color a mitad del morfismo. No hizo falta resolverlo con
CSS: se resolvió con el mismo tema en los dos lados. Las páginas de proyecto son claras de un tirón
(ver [Páginas de proyecto](#páginas-de-proyecto)), y una fila del índice solo es pulsable con
`#trabajo` sustancialmente en pantalla — momento en el que `--t` ya está cerca de 1. La vuelta, igual:
si el navegador restaura el scroll donde se dejó el índice, sigue claro. Comprobado navegando la
secuencia completa en Chrome: `--t` es 1 a los dos lados de cada salto, sin fotograma intermedio que
delate el cruce.

### `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce){
  @view-transition{ navigation:none; }
}
```

Apaga el morfismo entero, no solo sus curvas: con menos movimiento, el salto de página tiene que
ser eso, un salto — no una versión más lenta del mismo gesto.

## La ida, en dos fases

Decidido en el ticket
[El hover del índice](https://github.com/i-casaca/portfolio-test-migration/issues/55), después de
cuatro rondas de diagnóstico.

**El problema.** Con `view-transition-name` en la imagen flotante y en la portada del proyecto, la
navegación de ida creaba `::view-transition-new(project-cover)` **pero nunca el `old` ni el grupo**.
Sin `old` no hay grupo, y sin grupo lo que se ve es la imagen nueva apareciendo sola: un fundido.
La vuelta, en cambio, creaba los tres. Se probó con la imagen `fixed` y con la imagen `absolute`, y
el resultado no cambió: **el navegador no captura ese elemento en el documento que sale.**

**La solución: partirlo en dos animaciones, una dentro de cada página.**

| | |
|---|---|
| **Fase 1** (`assets/js/indice.js`) | La imagen flotante crece hasta llenar la pantalla, **se queda 0,34 s** y entonces navega |
| **Fase 2** (`assets/js/entrada-proyecto.js`) | La página de proyecto recoge el testigo con la portada a pantalla completa y la baja a su hueco, mientras la cabecera se enciende por partes |

Ninguna de las dos necesita que la otra capture nada, así que no depende del emparejamiento de
snapshots y funciona igual en cualquier navegador.

**La pausa no es relleno.** Es lo que convierte dos animaciones sueltas en una que continúa al otro
lado: sin ella la imagen llegaba a pantalla completa y la página cambiaba en el mismo instante, y el
corte se notaba.

El testigo viaja por `sessionStorage` y **lleva el href**, que se comprueba contra la página para que
uno viejo no dispare la entrada en otro proyecto. Entrando por URL directa, recargando o volviendo
atrás, no corre nada.

**Y una lección que costó una ronda entera: no dejar estado inline que sobreviva a una navegación.**
Un intento anterior congelaba la imagen con `left`/`top` inline antes de navegar; el bfcache devuelve
el documento tal cual se dejó, así que al volver la imagen conservaba esos valores y GSAP le sumaba
su transform encima — doble desplazamiento, fuera de pantalla. El estado de la fase 1 se limpia
explícitamente en `pageshow` persistido.

**La portada del proyecto queda fuera del reveal** (`html.js .media{opacity:0}` del #39). Es el
destino de la fase 2 y vive por encima del pliegue: revelarla por scroll la dejaba invisible justo
cuando tenía que estar ahí. Fue el primer fallo encontrado de esta cadena, y era real aunque no fuera
el único.

## El hover del índice

Decidido en el ticket
[El hover del índice](https://github.com/i-casaca/portfolio-test-migration/issues/55).

### La imagen flotante

Al apuntar una fila, la foto de ese proyecto aparece como un objeto que persigue al cursor con
retardo (0,55 s, `power3`). **Sustituye a la foto a sangre del #41**, y con ella desaparece su velo
en gradiente: con la imagen pequeña y separada del texto ya no hay una foto compitiendo con el
índice, así que el velo corregía un problema que esta solución no tiene.

**Nunca se sale de la pantalla.** El efecto secundario es el que se buscaba: cuando el cursor sigue
bajando y la imagen ya no puede, se queda pegada al borde y el cursor se separa de ella. Esa
distancia creciente se lee como peso.

**El reparto entre el `<figure>` y el `<img>` no es cosmético.** GSAP toma el figure para el
seguimiento y **absorbe cualquier `scale` declarado en CSS dentro de su propia matriz de
transform** — se probó ponerlo ahí y quedaba congelado, sin animar nunca. Así que el figure es solo
posición (GSAP) y el img solo aspecto (CSS).

Y **el retardo se anima sobre un objeto, no sobre el elemento**: el `transform` lo escribe el ticker
sumando el scroll, porque la imagen es `absolute` respecto al documento y sin esa suma se quedaría
quieta mientras la página se mueve.

### Las letras de aeropuerto

El nombre del proyecto se descompone en caracteres que barren el alfabeto y se asientan de izquierda
a derecha (520 ms, 34 ms de escalón). Un **solo `requestAnimationFrame` para toda la fila**, no un
temporizador por letra: N relojes independientes se desincronizan y el efecto se deshilacha. Es la
misma razón por la que la inversión del #54 se mueve con un solo número.

**Cada carácter vive en una caja de ancho congelado**, y eso sostiene dos cosas a la vez: que el
barrido no mueva la palabra —Roboto Flex no es monoespaciada— y que el nombre pueda **engordar a
`wght 850`** al apuntarlo sin ensanchar la fila. Sustituye a la cursiva del #41: con el barrido
encima se leían como dos efectos compitiendo.

**Cuándo se mide fue un fallo real.** Midiendo al arrancar, Roboto Flex todavía no había cargado
(va con `display=swap`), así que cada celda se quedaba con el ancho de la fuente de reserva y los
glifos bailaban dentro de cajas grandes — en móvil se veía «M a n u   C a r d i e l». Se mide con
`document.fonts.ready`, igual que motion.js hace con ScrollTrigger, y se vuelve a medir al cambiar
el tamaño porque el cuerpo del nombre es fluido. Y **solo se trocea el nombre donde el barrido puede
ocurrir**: en táctil no hay hover que lo dispare y partirlo allí no aporta nada.

Importa mantenerlo: el alto del hero está calculado para que asome media fila del primer proyecto
(ver [Hero](#hero)), así que un temblor aquí se propaga hasta arriba del todo.

### La fila

Rejilla en el `<nav>` y filas que la heredan con `subgrid`. Con la rejilla en cada fila, cada una
era independiente y `max-content` se resolvía por separado: la descripción arrancaba en una x
distinta en cada fila (medido: 515, 574, 581, 619, 673). `subgrid` y no `display:contents` porque la
fila es un `<a>` y `contents` le borraría la caja.

La descripción va **debajo** del nombre, hasta tres líneas, y el número y el meta se alinean con la
línea del título, no con el bloque entero.

**El nombre va a `max-content` sin nada que compita.** Con un `1fr` al final y 42ch de descripción,
esas dos se repartían el ancho antes de que el título cogiera el suyo: la columna quedaba en 176 px
cuando «Manu Cardiel» necesita 197 y el nombre se desbordaba. Peor, el JS remide las celdas del
barrido dentro de esa columna, así que el error se realimentaba.

## Páginas de proyecto

Decidido en el ticket
[Las páginas de proyecto en el tema claro](https://github.com/i-casaca/portfolio-test-migration/issues/56).
El sitio es oscuro hasta el hero y **claro de los proyectos en adelante** (decidido el 2026-08-10, al
construir [El índice en claro](https://github.com/i-casaca/portfolio-test-migration/issues/54)): las
cinco páginas de proyecto son la parte "de adelante", así que son claras de un tirón.

### Claras de un tirón, sin eje que mover

En `index.html` el claro es un **tramo del scroll**: `#trabajo` lo trae y "Sobre mí" lo deshace (ver
[Color > La inversión](#la-inversión)). Una página de proyecto no tiene ese tramo — es, de arriba
abajo, contenido de proyecto —, así que no hace falta un eje que se mueva dentro de ella:

```css
html.proyecto{ --t: 1; --tk: 1; }
```

Las cinco páginas llevan `class="proyecto"` en el `<html>`. `tema.js` ni se carga ahí —comprueba
`#trabajo` y no lo encuentra, y no hace nada— así que no hay dos mecanismos escribiendo las mismas
custom properties.

**Efecto colateral buscado, no solo tolerado.** Una fila del índice solo es pulsable con `#trabajo`
sustancialmente en pantalla, momento en el que `--t` ya está cerca de 1. La ida entra en una página
que **ya es del mismo color** — no hay tema que virar dentro de la transición. Y la vuelta llega a un
índice que, si el navegador restaura el scroll donde se dejó, también sigue claro. El riesgo de
destello que preguntaba el ticket —interpolar dos temas dentro de
`::view-transition-old/new`— sale sobrando: no cruza tema quien ya vive en el mismo. Comprobado
navegando la secuencia completa (índice → proyecto → volver → otro proyecto) en Chrome: `--t` llega
a 1 antes de pulsar y se queda en 1 al volver, sin fotograma intermedio.

### El `<style>` inline no sobrevivió

Las cinco páginas ya compartían casi todo su CSS vía `site.css` desde antes de este ticket —dos de
ellas (`manu-cardiel.html`, `el-paraguas.html`) no llevaban ni una línea de `<style>` propio—, pero
las tres páginas con NDA seguían cargando un `<style>` inline idéntico, después del `<link>` a
`site.css` y ganando la cascada por orden de aparición. Era la última razón real por la que
`.gate-wrap`/`.gated-content`/`.gate-contact a` no estaban ya en `site.css`: nadie los había movido
todavía. Se movieron y el `<style>` se borró de las tres páginas; el único fondo del muro que queda
es el de `site.css`, que además es el correcto —`color-mix` sobre `--c-negro` en vez del `rgba()`
literal que llevaba el inline, ya desincronizado del sistema de dos tokens.

### La cabecera, reconocible como la fila que acaba de crecer

El índice ya numera cada fila (`.index-num`, 01–05). La cabecera de la página de proyecto no llevaba
ese número, así que el salto se leía como "otro sitio", no como la misma pieza a tamaño completo.
Ahora lo repite con el mismo tratamiento —tamaño, opacidad `var(--dim-faint)`, tabular-nums— delante
del `.eyebrow`, en un `.project-kicker`. No se animó el propio número: la continuidad la da la
tipografía, no un morfismo nuevo que mantener.

### La foto sobre hueso

Las fotos de proyecto no cambiaron de tratamiento: siguen siendo la única fuente de color saturado
del sitio, ahora sobre `--bg` claro en vez de oscuro. Miradas las cinco, ninguna pedía ajuste — son
fotografía de producto/mockup con su propio fondo, no imágenes editadas para fundirse con un lienzo
oscuro. La mancha del fondo (ver [Interacción](#interacción)) es la única pieza que sí necesitó
tocarse para que la foto siguiera leyéndose como la fuente de color.

### El contraste no se heredó, se midió

**Restricción no negociable del ticket.** Medido con el propio par `--bg`/`--ink` del sistema
(oklab → sRGB → luminancia relativa WCAG) contra el fondo claro real, no supuesto: seis reglas de
`site.css` llevaban una opacidad de texto **fija**, calibrada mirando solo el extremo oscuro y nunca
medida en claro porque hasta este ticket ningún elemento con esa clase vivía ahí —
`.eyebrow`(.62→4,45:1), `.disclaimer`(.6→4,19:1), `.meta-row div span`(.58→3,95:1), `.next-project
span`(.58→3,95:1), `.site-footer .eyebrow`(.58→3,95:1) y `.footer-base`(.6→4,19:1) — las seis por
debajo del mínimo de 4.5:1 para texto que no es grande. Pasan todas a `opacity:var(--dim)`, el mismo
escalón que ya interpola con `--tk` para `--dim-faint`/`--dim` desde el #54 (ver
[Color > El suelo de opacidad no se hereda](#el-suelo-de-opacidad-no-se-hereda)): 5,35:1 en claro,
sin tocar el extremo oscuro (ya pasaba, y .6 es casi exactamente el valor dark de `--dim`).

El placeholder del campo de contraseña y `.gate-contact` del muro de NDA tenían el mismo defecto
(.6/.62 fijos, 3,96:1/4,19:1 medidos contra `--surface1` claro) y se corrigieron igual.

**Un séptimo caso no era de opacidad.** `.gate-error` («Contraseña incorrecta») llevaba un rojo
literal (`#E8776A`) elegido mirando solo el extremo oscuro: 5,08:1 ahí, pero **1,95:1** sobre
`--surface1` claro — casi invisible. Un rojo no puede resolverse con el mecanismo de `--bg`/`--ink`
(intercambiar dos tokens): hace falta un tono más oscuro para leerse sobre claro, no una opacidad
distinta. Se añadió una tercera pareja de tokens, misma idea que `--bg`/`--ink` pero para esta única
excepción funcional de color:

```css
--c-error-oscuro: #E8776A;             /* validado: 5,08:1 sobre superficie oscura */
--c-error-claro:  oklch(45% 0.18 25);  /* mismo tono, L más baja: 5,51:1 sobre superficie clara */
--error: color-mix(in oklab, var(--c-error-oscuro), var(--c-error-claro) calc(var(--t) * 100%));
```

### Lo que no hizo falta tocar

- **El muro de NDA.** Su velo (`background: color-mix(in oklab, var(--c-negro) 93%, transparent)`)
  se queda fijo en oscuro a propósito: es un scrim de modal, no contenido de la página, y un modal
  que oscurece el fondo se lee igual de bien —mejor, de hecho, más contraste— sobre una página clara
  que sobre una oscura. El `.gate-card` de dentro sí sigue el tema (`var(--surface1)`).
- **La burbuja del chat.** Su lanzador (círculo `--cb-ink`, casi negro) llevaba un borde añadido en
  el #38 solo para no fundirse con el fondo oscuro. Sobre el fondo claro de una página de proyecto
  el contraste es alto sin ese borde —lo confirma con margen incluso dejándolo puesto—, así que no
  se tocó: seguirá esperando su propio ticket (niebla del mapa) para el resto de su rediseño.
- **Los `eyebrow` de las secciones (`↳ Contexto`, `↳ Ejecución`, `↳ Resultado`).** La niebla del mapa
  apuntaba a revisar si las páginas de proyecto arrastraban el mismo andamiaje vacío que
  `index.html` (`↳ Sobre mí`, etc.). No: en las páginas de proyecto ese texto vive directamente en el
  `<h2>` de cada sección, es la voz real del título, no una etiqueta repetida encima de él. Nada que
  vaciar aquí.

## Proyectos bajo NDA

Los tres proyectos con NDA **no enseñan su foto: enseñan estática de televisión** con la sigla NDA y
«requiere contraseña». Antes se enseñaba la foto real desenfocada, y era una promesa falsa — la
imagen estaba ahí, solo tapada. Ahora **ni siquiera se le pone el `src`**, así que no llega al
navegador hasta que hay contraseña.

**El muro salta en la home, al pulsar, no al llegar al proyecto.** Antes se veía entrar la página con
toda su transición y taparse acto seguido. Preguntando primero, la transición solo ocurre cuando ya
hay algo que enseñar. Acertando, se rehace el hover para cambiar la estática por la foto y se vuelve
a pulsar: el mismo manejador hace la transición completa, sin duplicar la coreografía.

Con el muro abierto **no queda nada vivo detrás**: se apagan el cursor propio, la mancha, la imagen
flotante y los hovers del índice, y se bloquea el scroll. Un modal que deja el fondo reaccionando se
lee como que el sitio no te ha oído. Se cierra con Escape y con clic fuera — un muro que solo se
cierra acertando es una trampa, no una puerta.

**Cómo se construye la estática** (tres capas, y ninguna es sutil a propósito):

- **Ruido**: `feTurbulence` con **una sola octava** y `baseFrequency` alta — mota fina de un tamaño,
  que es lo que hace grano de televisión; con más octavas salen manchas y parece humo. El `feFuncA`
  aplasta el alfa a 1, porque el turbulence genera ruido también en ese canal y sin eso sale
  semitransparente y lavado. `contrast(5.5)` parte el gris medio en blanco y negro puros. A 20 fps:
  por debajo se ve el bucle, por encima se emborrona en gris.
- **Desgarros**: bandas que saltan de sitio, en su propio elemento y con su propia línea de tiempo
  —el ruido tiembla continuo, los desgarros van a tirones—. Es lo que separa «ruido» de «señal rota».
- **Trama**: rayado fino fijo. No se anima: es el tubo, no un efecto.

La sigla lleva **aberración cromática** (copias roja y cian desplazadas, con un tic cada pocos
segundos) sobre un bloque negro. El bloque no es decoración: con la estática a este contraste, sin él
las letras se picaban y dejaban de leerse — la misma regla dura que se aplicó al logotipo en el #40.

## Interacción

**Parcialmente pendiente** — siguen en la niebla del mapa
[#35](https://github.com/i-casaca/portfolio-test-migration/issues/35) el cursor personalizado, los
rollovers de enlace y los subrayados animados.

Lo cerrado: el foco de teclado tiene que ser visible en todo lo navegable. Un `outline: none` sin
sustituto es un fallo, no una decisión de estilo. Y la mancha del fondo, que se describe aquí.

### La mancha: una silueta que sigue al ratón e invierte lo que cubre

Una forma orgánica pegada al cursor que **invierte el color de lo que tiene debajo**: sobre el fondo
oscuro se ve hueso azulado, y el texto hueso que queda dentro pasa a azul casi negro.

**La mecánica no es nueva en el sitio.** Es la del `#cursor-dot` que ya existía —blanco puro con
`mix-blend-mode: difference`, que da el negativo exacto del fondo—, crecida. Blanco puro no es un
detalle: cualquier otro color daría un tinte en vez de una inversión. El punto de cursor sigue en
pie y, al quedar dentro de la mancha, se lee como una pupila oscura.

**Cómo se forma la silueta.** Siete círculos blancos que se persiguen en cadena, fundidos por un
filtro SVG (`feGaussianBlur` + `feColorMatrix` que multiplica el canal alfa). Es la técnica de
*metaballs*: el borde ondulado sale de la suma de los círculos, no de una forma dibujada, así que se
deforma sola con la velocidad del ratón — estirada cuando corre, redonda cuando se para.

Dos cosas que se descubrieron construyendo y que conviene no volver a tropezar:

- **El `contrast()` de CSS no umbraliza el canal alfa sobre fondo transparente.** Con `blur()` +
  `contrast()` los siete círculos se quedaban sueltos, como un collar de perlas. Lo que los funde es
  la `feColorMatrix`. Y `color-interpolation-filters="sRGB"` no es opcional: el valor por defecto
  (linearRGB) devuelve un borde lechoso.
- **La cadena se recorre desde la cola.** Si cada círculo persigue la posición *ya actualizada* del
  anterior, el movimiento se propaga entero en un fotograma y los siete viajan pegados: una bola,
  nunca una estela. Recorriendo al revés, cada eslabón lee la posición del fotograma anterior, y ese
  retraso de un fotograma por eslabón **es** la estela.

**Los números (`stdDeviation: 28`, alfa `×8 −4`, círculo de 184 px) salen de una revisión en vivo**
sobre el sitio real con un medidor de fps delante. Un fundido alto con un multiplicador de alfa
**bajo** es lo que da el borde con halo; con multiplicadores altos (se probó ×26) la silueta salía
recortada a cuchillo y sobre el fondo cálido leía como un pegote, no como niebla.

**La mancha se aparta cuando hay una foto de proyecto en pantalla — en la home.** Sobre el fondo
plano la inversión se lee como un gesto; sobre la fotografía la convierte en un negativo azulado que
parece un fallo de pintado, y contradice de frente la excepción deliberada nº 4 (la foto es la única
fuente de color saturado). Es el mismo modo de fallo por el que el
[#41](https://github.com/i-casaca/portfolio-test-migration/issues/41) retiró la distorsión líquida
del titular. El enganche, rehecho en el [#55](https://github.com/i-casaca/portfolio-test-migration/issues/55)
cuando el preview a sangre pasó a ser la imagen flotante al cursor: `body:has(#index-float.is-on)
#backdrop-blob{opacity:0;}`.

**En las páginas de proyecto no cede: se queda siempre detrás.** Restricción de Ismael sobre el
[#56](https://github.com/i-casaca/portfolio-test-migration/issues/56), llegada revisando el hover del
índice: ahí la fotografía es el contenido principal, no una imagen de fondo entre otras, así que la
mancha no puede invertirla "de vez en cuando" — no puede invertirla nunca.

```css
html.proyecto #backdrop-blob{ z-index: -1; }
```

Basta con el z-index, sin tocar `.media` ni el resto del contenido: en el mismo contexto de
apilamiento, un hijo con z-index negativo pinta *antes* que el contenido en flujo normal sin z-index
propio (orden de pintado CSS2.1). El contenido de una página de proyecto —`.media`, párrafos, `.nav`—
no declara z-index en ningún punto de su cadena de ancestros (`.gate-wrap` en las tres páginas con
NDA usa `position:relative` sin z-index, que no abre un contexto de apilamiento nuevo), así que sigue
en el mismo contexto que la mancha y la regla alcanza. No hizo falta el remedio que avisaba el
ticket —darle a `.media` su propio contexto de apilamiento—: eso habría sido necesario solo si algo
en la cadena ya tuviera z-index propio.

**Coste, medido**: 120 fps sostenidos. El filtro no cubre la pantalla — vive en una caja de 760 px
que viaja con la mancha, porque un filtro SVG cuesta en proporción a su región. `contain: strict`
acota esa caja, y por eso el bucle mantiene un diámetro entero de guarda contra el borde: menos, y
un tirón brusco deja el halo cortado en línea recta. El bucle además **se detiene solo** cuando la
mancha alcanza al ratón y este no se mueve, y en pestaña oculta.

**Mejora progresiva de arriba abajo**: sin puntero fino (móvil, tableta) no se monta siquiera, ni
los nodos ni el bucle; con `prefers-reduced-motion` tampoco. Sin JavaScript, la página es
exactamente la de antes. Nada del contenido depende de esto.

**Contraste, medido en los dos lados del borde**: 13,63:1 fuera de la mancha y **13,59:1 dentro**.
La inversión lo conserva, así que el texto cumple AA también donde la mancha lo cubre.

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
