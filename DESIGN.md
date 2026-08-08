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

**Pendiente** — la fija el ticket
[#38](https://github.com/i-casaca/portfolio-test-migration/issues/38).

Dirección ya decidida y no negociable a partir de aquí:

- Fondo: un **negro cálido**, no negro puro y no gris. Una sola superficie en todo el sitio.
- Tinta: un **hueso cálido** para texto, bordes e iconografía.
- Color saturado: **solo la fotografía de proyecto**. El sistema no tiene color de acento propio.
- Textura de grano sobre el fondo, para evitar el banding de las superficies oscuras planas.

Sustituye a la paleta crema/menta del MVP (`--cream`, `--mint`, `--ink` en `assets/css/site.css`),
que desaparece. Contraste de texto ≥ 4.5:1, comprobado, no estimado.

## Tipografía

**Pendiente** — las fuentes las elige el ticket
[#37](https://github.com/i-casaca/portfolio-test-migration/issues/37) y la escala la fija el
[#38](https://github.com/i-casaca/portfolio-test-migration/issues/38).

Dirección ya decidida:

- **Una sola familia para todo el sitio**, recorrida a lo ancho: la variedad tipográfica sale de los
  anchos y los pesos de una única familia, no de mezclar familias. Es una elección deliberada; ver
  [Excepciones deliberadas](#excepciones-deliberadas).
- **Tres o cuatro displays de carácter muy distinto entre sí**, usadas exclusivamente en la entrada
  del sitio. La personalidad tipográfica se concentra en un único momento; el resto es sobrio.
- Escala fluida que escala con el viewport de golpe, **con suelo y techo**. Sin techo se dispara en
  monitores grandes; sin suelo se vuelve ilegible en móvil.
- Line-height emparejado a cada paso de la escala: apretado en display, suelto en cuerpo.

## Layout

**Pendiente** — la fija el ticket
[#41](https://github.com/i-casaca/portfolio-test-migration/issues/41).

Lo que hay hoy y sobrevive hasta entonces: contenedor `min(88vw, 1440px)` centrado, alineado con el
gutter del nav (6vw), y medida de texto controlada por párrafo, no por contenedor.

## Motion

**Pendiente** — la fija el ticket
[#39](https://github.com/i-casaca/portfolio-test-migration/issues/39).

Restricciones que la decisión no puede saltarse:

- GSAP 3.13 y Lenis, cargados por CDN. Sin build, sin bundler.
- `prefers-reduced-motion` necesita un camino real: la versión quieta del estado final, no la
  ausencia de animación con el contenido a medias.
- Ninguna aparición puede condicionar la visibilidad del contenido. Si el JS no llega a ejecutarse,
  la sección se ve igual.

## Entrada del sitio

**Pendiente** — la fija el ticket
[#40](https://github.com/i-casaca/portfolio-test-migration/issues/40).

Dirección ya decidida: la entrada **no es un overlay**, es la primera sección de la página. Por eso
su salida y la llegada al hero son el mismo movimiento y no hay corte.

## Transiciones de página

**Pendiente** — la fija el ticket
[#42](https://github.com/i-casaca/portfolio-test-migration/issues/42).

Sustituye a `assets/js/page-transition.js` (hoy: un panel que sube y baja con un spinner de seis
celdas).

## Interacción

**Pendiente** — todavía en la niebla del mapa
[#35](https://github.com/i-casaca/portfolio-test-migration/issues/35): cursor, rollovers,
subrayados animados y estados de foco.

Lo único cerrado: el foco de teclado tiene que ser visible en todo lo navegable. Un `outline: none`
sin sustituto es un fallo, no una decisión de estilo.

## Excepciones deliberadas

Decisiones de este sitio que contradicen los defaults de `/impeccable`. **No son descuidos y no se
deben "corregir".** Si una pasada del skill propone quitar algo de esta lista, la respuesta es no.

### 1. El índice numerado de proyectos

`impeccable` trata los marcadores `01 / 02 / 03` como andamiaje automático y los elimina, porque en
la mayoría de las páginas numeran secciones que no son una secuencia.

Aquí sí lo son. El índice de proyectos es una lista ordenada de verdad —un trabajo detrás de otro,
en un orden que el visitante recorre— y la numeración es voz de marca, no relleno. **Se queda.**

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
