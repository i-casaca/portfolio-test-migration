<div align="center">

<img src="assets/images/logo-mark.svg" alt="Logotipo de Ismael Casado" width="72">

# Portfolio reconstruido a mano

**De Framer a HTML escrito a mano: un portfolio sin framework ni paso de build, con un sistema
visual que se invierte al hacer scroll y un chatbot que responde sobre mi trabajo sin usar ningún
modelo de IA.**

[![Sitio en vivo](https://img.shields.io/badge/ver_el_sitio-en_vivo-EBE3D8?style=for-the-badge&labelColor=201915)](https://i-casaca.github.io/portfolio-test-migration/)

[![Versión](https://img.shields.io/badge/versión-0.3.0-blue)](https://github.com/i-casaca/portfolio-test-migration/releases)
[![Estado](https://img.shields.io/badge/estado-experimento_activo-2ea44f)](https://github.com/i-casaca/portfolio-test-migration/issues)
[![Sin build](https://img.shields.io/badge/build-ninguno-lightgrey)](#por-qué-sin-framework)
[![Contraste](https://img.shields.io/badge/contraste_AA-0_fallos-success)](#referencia-de-color)
[![Despliegue](https://img.shields.io/badge/deploy-GitHub_Pages-222222?logo=githubpages&logoColor=white)](https://i-casaca.github.io/portfolio-test-migration/)

</div>

---

## Demo

🔗 **[i-casaca.github.io/portfolio-test-migration →](https://i-casaca.github.io/portfolio-test-migration/)**

No hay capturas en este README a propósito: el sitio **es** la demo, y la mitad de lo que se decidió
aquí solo existe en movimiento — la entrada tipográfica, la inversión de tema conducida por el
scroll, la imagen que persigue al cursor en el índice. Una captura las cuenta mal.

---

## Índice

- [Qué es esto](#qué-es-esto)
- [Lo que hace el sitio](#lo-que-hace-el-sitio)
- [Stack](#stack)
- [Referencia de color](#referencia-de-color)
- [Verlo en tu ordenador](#verlo-en-tu-ordenador)
- [Despliegue](#despliegue)
- [Documentación](#documentación)
- [Estructura del repositorio](#estructura-del-repositorio)
- [El chatbot: por qué no usa IA](#el-chatbot-por-qué-no-usa-ia)
- [El muro de contraseña](#el-muro-de-contraseña)
- [Cómo se decide lo que se construye](#cómo-se-decide-lo-que-se-construye)
- [Lecciones](#lecciones)
- [Optimizaciones y peso](#optimizaciones-y-peso)
- [Qué falta](#qué-falta)
- [Relacionado](#relacionado)
- [Agradecimientos](#agradecimientos)
- [Autor y contacto](#autor-y-contacto)
- [Uso del contenido](#uso-del-contenido)

---

## Qué es esto

Soy [Ismael Casado](https://www.linkedin.com/in/ismaelcasadoc/), Product Designer. **Mi portfolio
está en [isma-casaca.framer.website](https://isma-casaca.framer.website/)** — ese es el bueno.

Este repositorio es otra cosa: el experimento de reconstruirlo **a mano**, en HTML, CSS y
JavaScript planos, para ver qué se aprende por el camino. No lo sustituye.

No lo hice porque Framer fuera malo. Lo hice porque **quería entender qué pasa por debajo**: cómo se
publica una web de verdad, qué es una rama, para qué sirve un Pull Request, y hasta dónde llego yo
solo antes de necesitar a alguien de desarrollo.

Empezó como una migración y acabó siendo tres cosas encadenadas: la migración, **un chatbot que
declara que no lleva un modelo detrás**, y **un sistema visual propio** —oscuro, con motion real y
un eje de tema que invierte la página entera— documentado decisión a decisión.

> [!NOTE]
> Es un experimento de aprendizaje, no una arquitectura ejemplar ni mi portfolio en uso. Si has
> llegado buscando cómo montar un portfolio, hay caminos más rápidos. Si has llegado buscando
> **cómo piensa un diseñador cuando se mete en el código**, quédate.

---

## Lo que hace el sitio

- **Entrada tipográfica.** Cuatro saludos que trocean *"Jack of all trades, master of some"*, cada
  palabra dimensionada por JS para llenar la pantalla, y el logotipo volando a su sitio en la
  cabecera. No es un overlay: es la primera sección de la página, así que su salida y la llegada al
  sitio son el mismo movimiento.
- **Un eje de tema, no dos temas.** La página entera se invierte conforme el índice de proyectos
  toma la pantalla, y se deshace por los dos lados. Un solo número mueve el fondo y otro la tinta;
  todos los demás colores se derivan de ellos.
- **Índice de proyectos con la imagen al cursor.** Al apuntar un proyecto su foto persigue al ratón
  y el nombre barre el alfabeto como un panel de aeropuerto.
- **Transición al proyecto con View Transitions nativas.** La foto del índice se convierte en la
  portada del proyecto. Degrada a navegación normal, sin error, donde no hay soporte.
- **Fondo vivo.** Estática animada a doce saltos por ciclo y una silueta orgánica pegada al cursor
  que invierte lo que cubre — y que se aparta cuando hay foto de proyecto en pantalla.
- **Chatbot sin modelo de IA**, que lee el propio sitio y cita de dónde saca cada respuesta.
- **Muro de contraseña** en los tres proyectos bajo NDA, que dice en voz alta que no es seguridad
  real.
- **Legible sin JavaScript**, con `prefers-reduced-motion` respetado y contraste medido.

---

## Stack

| | |
|---|---|
| **HTML, CSS y JavaScript planos** | Sin React, sin Tailwind, sin `npm install` |
| **Sin paso de build** | Lo que hay en el repositorio es exactamente lo que se sirve |
| **[GSAP 3.13](https://gsap.com/)** | Núcleo + ScrollTrigger + SplitText + TextPlugin, por CDN |
| **[Lenis 1.1](https://lenis.darkroom.engineering/)** | Scroll suave, por CDN |
| **View Transitions API** | Transición índice → proyecto, nativa del navegador |
| **[Roboto Flex](https://fonts.google.com/specimen/Roboto+Flex)** | Familia única del sitio: `wdth 25–151` × `wght 100–1000` |
| **[GitHub Pages](https://pages.github.com/)** | Despliegue automático al fusionar en `main` |

### Por qué sin framework

Porque el objetivo era **entender**, no entregar rápido. Un framework me habría dado el resultado
antes y me habría enseñado menos. El sitio entero son unas 5.800 líneas entre HTML, CSS y JS: puedo
leerlas de principio a fin, así que no hay magia que no pueda explicar.

Efecto secundario: se abre rápido y no depende de nada que pueda romperse en una actualización.

---

## Referencia de color

Dos colores. No hay un tercero, y **no hay color de acento**: la fotografía de proyecto es la única
fuente de color saturado del sitio.

| token | valor | papel |
|---|---|---|
| `--c-negro` | `#201915` | Negro cálido |
| `--c-hueso` | `#EBE3D8` | Hueso |
| `--t` | `0 → 1` | Continuo. Mueve el **fondo** |
| `--tk` | `0` ó `1` | Salta en `t = 0,48`. Mueve la **tinta** |

Los dos colores **intercambian su papel** en los extremos del eje, así que el contraste del par base
es idéntico en oscuro y en claro —**13,63:1**— sin calibrar una paleta nueva.

**Medido, no estimado.** El barrido de contraste de la `v0.3.0` recorrió con `getComputedStyle` los
~130 elementos de texto de la home en cada extremo del eje, más las páginas de proyecto y el muro:

| | oscuro (`--t:0`) | claro (`--t:1`) |
|---|---|---|
| Fallos AA | **0** | **0** |
| Peor caso | 4,97:1 | 4,59:1 |

El porqué, las rampas y el cálculo del punto de salto están en [`DESIGN.md`](DESIGN.md#color).

---

## Verlo en tu ordenador

No hace falta instalar nada más que Python, que macOS y Linux ya traen.

```bash
git clone https://github.com/i-casaca/portfolio-test-migration.git
```

```bash
cd portfolio-test-migration && python3 -m http.server 8000
```

Abre <http://localhost:8000>.

> [!IMPORTANT]
> Ábrelo con un servidor, no con doble clic en `index.html`. El chatbot lee las otras páginas con
> `fetch`, y el navegador bloquea eso desde `file://` por seguridad. Sin servidor, el sitio se ve
> pero el chat no encuentra nada.

---

## Despliegue

No hay pipeline y no hace falta: **GitHub Pages sirve `main` tal cual**. Fusionar un Pull Request es
el despliegue.

```
rama ticket-N-slug  →  Pull Request  →  merge en main  →  publicado
```

La única dependencia externa en tiempo de ejecución son los CDN de GSAP, Lenis y Google Fonts. Si
alguno cayera, el sitio **sigue siendo legible**: el contenido nunca depende de que una animación
llegue a ejecutarse.

---

## Documentación

Dos archivos gobiernan lo que se le puede hacer al sitio. No los usa el código: son el **contrato de
diseño**, y ninguna decisión se considera tomada hasta que está escrita en ellos.

| documento | qué gobierna |
|---|---|
| [`PRODUCT.md`](PRODUCT.md) | A quién le habla el sitio, qué afirma, qué no debe parecer, y el compromiso de accesibilidad |
| [`DESIGN.md`](DESIGN.md) | El sistema visual completo: color, tipografía, layout, motion, transiciones y las **excepciones deliberadas** |

Las **excepciones deliberadas** son la parte que más dice de este proyecto: decisiones que
contradicen a propósito lo que recomendaría una herramienta de diseño automática, escritas con su
motivo para que ninguna pasada posterior las "corrija" por descuido. Están en
[`DESIGN.md`](DESIGN.md#excepciones-deliberadas).

---

## Estructura del repositorio

```
PRODUCT.md                 A quién le habla el sitio, qué afirma y qué no debe parecer
DESIGN.md                  El sistema visual: color, tipografía, layout, motion y sus excepciones

index.html                 Portada: entrada, hero, índice de proyectos, sobre mí y metodología
adrenaline.html            ─┐
arabvision.html             │  Proyectos de cliente — bajo muro de contraseña
nexahub.html               ─┘
manu-cardiel.html          ─┐  Proyectos abiertos
el-paraguas.html           ─┘

assets/css/site.css            El sistema visual entero
assets/css/chat-bubble.css     La burbuja del chat, con sus propios tokens

assets/js/motion.js            Cimientos: GSAP, Lenis, eases y prefers-reduced-motion
assets/js/tema.js              El eje de tema — lo único que escribe --t y --tk
assets/js/entry.js             La entrada tipográfica
assets/js/indice.js            El índice de proyectos
assets/js/flotante.js          La imagen que persigue al cursor
assets/js/flap.js              Las letras de aeropuerto
assets/js/backdrop.js          Estática y la mancha que sigue al ratón
assets/js/reveal.js            Aparición al hacer scroll
assets/js/entrada-proyecto.js  La llegada a la página de proyecto
assets/js/nav-proyecto.js      Navegación y salidas del proyecto
assets/js/chat-corpus.js       El motor del chat: lee el sitio y busca en él
assets/js/chat-corpus-tags.js  Lo único del corpus escrito a mano: de qué habla cada fragmento
assets/js/chat-bubble.js       La interfaz del chat

entrevista/                Las 20 preguntas que me hice y mis respuestas en bruto
spec/                      Cómo sería el chatbot con un modelo de verdad (escrito, no ejecutado)
research/                  Investigación con fuentes: plataformas, precios, tipografía, arquitectura
```

Las carpetas `entrevista/`, `spec/` y `research/` **no las usa el sitio**. Están porque el
razonamiento detrás de cada decisión me parece tan parte del proyecto como el código.

---

## El chatbot: por qué no usa IA

Abre el sitio y verás un círculo abajo a la derecha. Pregúntale por cualquiera de mis proyectos.

**No hay ningún modelo de lenguaje detrás.** La cabecera del chat lo dice antes de que escribas
nada: *"Simulación local sobre lo que he escrito en este sitio. No es un modelo de IA en vivo."*

### El motivo

Quería que consumiera los créditos de mi suscripción de Claude. No se puede: la suscripción y la API
se facturan por separado. El coste real habría sido de **~0,03 $ por conversación** — asumible, pero
significaba montar un servidor con una clave, y no era eso lo que quería aprender todavía.

Así que se construyó **la experiencia sin el modelo**, y se documentó aparte cómo sería con él.

### Cómo funciona en realidad

```
alguien pregunta → se lee el HTML del propio sitio → se busca el fragmento
                   que mejor responde → se cita de dónde sale
```

1. **El corpus no es un archivo: es el sitio.** Al abrir la burbuja, el navegador lee las 6 páginas
   con `fetch` y `DOMParser` y las trocea en 64 fragmentos. **No hay copia que mantener** — si edito
   un párrafo del sitio, el chatbot ya sabe la versión nueva. El problema de desincronización
   desaparece por construcción.
2. **Busca con recuperación léxica**, no con embeddings: peso por frecuencia inversa, y más peso a
   lo deliberado (el nombre del proyecto, el título de sección) que a lo incidental.
3. **Cita siempre de dónde sale la respuesta**, con un enlace que salta a esa sección exacta.

### La regla que lo gobierna todo: declarar el límite

Sin un modelo detrás, no puede improvisar. La decisión de diseño fue **no disimularlo nunca**:

| situación | qué hace |
|---|---|
| Encuentra la respuesta | La cita enmarcada — *"esto es lo que documenté sobre X"* |
| No la encuentra | Lo admite y ofrece los temas que sí cubre, o mi LinkedIn |
| El proyecto está bajo NDA | Dice que existe y está bajo NDA, da el resumen público, y para ahí |
| Le escribes en otro idioma | Te dice que solo puede en español, y por qué |

La limitación acabó siendo el carácter de la pieza. Un buscador honesto es más útil —y más
defendible— que un imitador que rellena huecos.

---

## El muro de contraseña

Adrenaline, Arabvision y Nexahub son proyectos de cliente y llevan un muro delante.

> [!WARNING]
> **No es seguridad real y no pretende serlo.** La comparación se hace en tu propio navegador y el
> hash está en el código fuente: alguien con conocimientos técnicos se lo salta. Sirve para que
> quien pase por curiosidad no vea contenido de cliente, no para protegerlo de alguien decidido.
>
> Un muro de verdad necesita servidor, y eso es otro proyecto. Está documentado en
> [`spec/`](spec/chatbot-api-produccion.md) como requisito pendiente.

La contraseña la comparto por LinkedIn o email; no hay formulario de solicitud.

---

## Cómo se decide lo que se construye

Todo el trabajo se planifica **en los propios Issues de este repositorio**, con una metodología de
mapa: un issue es el mapa (destino, decisiones tomadas, niebla y lo que queda fuera) y cada issue
hijo es una pregunta que hay que resolver antes de poder construir.

| mapa | de qué va |
|---|---|
| [#1](https://github.com/i-casaca/portfolio-test-migration/issues/1) | La migración de Framer al sitio estático |
| [#15](https://github.com/i-casaca/portfolio-test-migration/issues/15) | El chatbot y la especificación de su versión con API |
| [#35](https://github.com/i-casaca/portfolio-test-migration/issues/35) | El sistema visual oscuro, la entrada y el motion |

**Cada issue cerrado tiene escrita la decisión y el porqué**, incluidos los caminos que se
descartaron y los fallos que se encontraron construyendo. Si quieres ver cómo se llegó a algo, ese
es el sitio — no este README.

Convención de ramas: `main` es lo publicado, una rama por issue, fusionada por Pull Request.

---

## Lecciones

Lo que costó tiempo, por si le sirve a alguien:

- **Una medida de seguridad que solo cubre una puerta no es una medida de seguridad.** El chat
  contaba entero un proyecto bajo NDA con la página todavía bloqueada: el corpus marcaba los
  fragmentos confidenciales, pero la búsqueda nunca miraba esa marca.
- **Y la misma lección otra vez, dos versiones después.** El índice precargaba las cinco fotos con
  `new Image()` *antes* de mirar el candado, deshaciendo por detrás la garantía que el propio
  archivo defiende treinta líneas más abajo. Sin contraseña, las tres fotos con NDA salían del
  servidor igualmente. Una garantía escrita en un sitio no protege lo que otro sitio pide primero.
- **Para invertir la página entera, anima UN valor y deriva el resto.** Animar cientos de elementos
  con `transition` da un parpadeo escalonado, porque cada uno arranca su reloj cuando le toca.
- **Dos colores cruzándose hacen desaparecer el texto a medio camino** (1,00:1). Por eso la tinta
  salta sola en vez de acompañar al fondo.
- **Interpolar entre dos extremos no garantiza que las dos puntas cumplan.** Una opacidad calibrada
  mirando solo el extremo claro pasaba allí y fallaba AA en el oscuro, sin que nadie lo volviera a
  medir.
- **Una opacidad de contenedor no sustituye a la de dentro: se multiplica con ella.** Así es como el
  distintivo `NDA` acabó siendo el único texto del sitio que fallaba en los dos extremos a la vez.
- **Esconder el puntero del sistema solo es legítimo si algo lo sustituye** — y ese algo era un
  script. Sin JS, el visitante se quedaba sin cursor visible sobre medio sitio.
- **`steps(4)` no congela una animación**: interpola *dentro* de cada intervalo, y por eso el grano
  se deslizaba en vez de leerse como estática.
- **Un `once:true` calculado contra un documento aún corto se dispara antes de tiempo y sin
  remedio.** Los triggers tienen que esperar a que carguen fuentes e imágenes.
- **Escribir la excepción antes de construirla.** Si no está documentada con su motivo, la siguiente
  pasada de diseño la trata como un descuido y la "corrige".
- **Un documento de diseño también se desincroniza.** Catorce afirmaciones de `DESIGN.md` describían
  un sitio que ya no era, casi todas por arrastre de un ticket posterior. Se corrigen en el
  documento, no se disimulan.

---

## Optimizaciones y peso

- **Una sola familia para todo el sitio**: 59.696 B de Roboto Flex cubren siete escalones de ancho y
  peso desde un único `<link>`.
- **Las cuatro display de la entrada se piden con `?text=`** y solo traen los caracteres de su
  propia palabra: 6,9 kB entre las cuatro.
- **El contraste no se recalibra al invertir**: los dos colores intercambian su papel, así que es
  literalmente el mismo par en los dos extremos.
- **La transición entre páginas no lleva JavaScript** donde el navegador la soporta, y donde no,
  degrada a navegación normal sin error.
- **El corpus del chat no se mantiene**: se deriva del propio HTML del sitio en tiempo de ejecución.
- **Las fotos con NDA no salen del servidor sin contraseña** — 574 kB que antes sí salían.

Peso de la home en una primera visita, **medido en gzip real**:

| | |
|---|---|
| `index.html` | 23,8 kB |
| CSS (los dos) | 19,5 kB |
| JS propio (9 archivos) | 24,6 kB |
| JS del chatbot (3 archivos) | 15,2 kB |
| GSAP 3.13 + 3 plugins + Lenis | 56,8 kB |
| Tipografía | 69,0 kB |
| Fotografía | ~440 kB |
| **Total** | **~650 kB** |

---

## Qué falta

**Accesibilidad**

- [ ] El **lanzador del chat no tiene nombre accesible**, y el campo del chat no tiene etiqueta
- [ ] El **muro no tiene `aria-modal` ni trampa de foco**: 16 elementos siguen tabulables por detrás
- [ ] El **círculo de la burbuja contra el fondo oscuro mide 1,01:1** — hoy lo sostiene solo su borde
- [ ] Los enlaces del nav miden **14 px de alto en móvil**: pasan el criterio de espaciado, pero
      cómodos no son
- [ ] Las tres secciones de abajo de la home son **invisibles a la navegación por encabezados**: el
      `eyebrow` que las titula es un `<span>`, así que el esquema salta de `<h1>` a `<h3>`

**Diseño pendiente de decidir**

- [ ] **Con `prefers-reduced-motion` y ratón, apuntar una fila del índice no enseña nada.** Es la
      ausencia del estado, no su versión quieta — justo lo que `PRODUCT.md` pide no hacer
- [ ] **La vuelta del proyecto al índice ya no transforma la foto.** Se cayó por arrastre, nadie lo
      decidió, y quedan diez reglas de transición que no llegan a correr nunca
- [ ] Las fotos con NDA **siguen siendo la imagen real** en la miniatura de móvil y en la propia
      página de proyecto: solo la flotante cumple la promesa
- [ ] **El acabado de la estática** de los proyectos bajo NDA
- [ ] **El cursor personalizado** y los rollovers heredados del MVP
- [ ] **El muro de contraseña y la burbuja del chat** con la paleta nueva: funcionan y están
      medidos, pero no rediseñados
- [ ] **La mirada de conjunto al móvil**, donde no hay hover y el índice depende de dos
      comportamientos de cursor
- [ ] **Retirar Fraunces**, que se sigue pidiendo en el `<head>` y no la pinta ninguna regla

**Lo demás**

- [ ] **Un criterio de evaluación** del chatbot que no sea probarlo a mano
- [ ] **CV en inglés** — hoy solo está en español
- [ ] **Muro de contraseña de verdad**, con servidor — requisito para cualquier despliegue serio
- [ ] Deuda de código anotada y no tocada: el hover está duplicado entre `indice.js` y
      `nav-proyecto.js`, y el hash del NDA vive en cuatro archivos con `sha256Hex` escrito dos veces

Lo que **no** está previsto: conectar el chatbot a un modelo de lenguaje. Está especificado en
[`spec/`](spec/chatbot-api-produccion.md) y ahí se queda hasta que haya una razón para pagarlo.

---

## Relacionado

- [`spec/chatbot-api-produccion.md`](spec/chatbot-api-produccion.md) — cómo sería el chatbot con un
  modelo de verdad: arquitectura, costes y requisitos. Escrito, no ejecutado.
- [`research/`](research/) — la investigación con fuentes que sostiene dos decisiones: la
  arquitectura de la versión con API y la elección del sistema tipográfico.
- [`entrevista/`](entrevista/) — las 20 preguntas que me hice y las respuestas en bruto de las que
  salió el contenido del sitio.

---

## Agradecimientos

Herramientas y recursos libres sin los que esto no existiría, con su licencia:

- **[GSAP 3.13](https://gsap.com/)** — motion, ScrollTrigger, SplitText y TextPlugin.
- **[Lenis](https://lenis.darkroom.engineering/)** (MIT) — scroll suave.
- **[Roboto Flex](https://fonts.google.com/specimen/Roboto+Flex)** (OFL 1.1) — la familia del sitio.
- **[Rubik Mono One](https://fonts.google.com/specimen/Rubik+Mono+One)**,
  **[Rock Salt](https://fonts.google.com/specimen/Rock+Salt)**,
  **[Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue)** y
  **[Monoton](https://fonts.google.com/specimen/Monoton)** (OFL 1.1) — los cuatro saludos de la
  entrada.
- **[GitHub Pages](https://pages.github.com/)** — hosting y despliegue.
- **[Shields.io](https://shields.io/)** — las insignias de este README.
- **[readme.so](https://readme.so/)** — la estructura de secciones sobre la que está montado este
  archivo.

El sitio se construyó con **[Claude Code](https://claude.com/claude-code)** como copiloto, issue a
issue. Las decisiones y los descartes son míos; están escritos en los issues cerrados con el porqué
de cada uno.

---

## Autor y contacto

**Ismael Casado** — Product Designer · Madrid

[![Portfolio](https://img.shields.io/badge/portfolio-isma--casaca.framer.website-ff6b35)](https://isma-casaca.framer.website/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ismaelcasadoc-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ismaelcasadoc/)
[![Medium](https://img.shields.io/badge/Medium-@ismael.casadoc-000000?logo=medium&logoColor=white)](https://medium.com/@ismael.casadoc)

📄 [Descargar mi CV](assets/cv/isma-casado-cv-es.pdf)

¿Has visto algo que se podría hacer mejor?
[Abre un issue](https://github.com/i-casaca/portfolio-test-migration/issues/new) — es exactamente el
tipo de conversación que este repositorio existe para tener.

---

## Uso del contenido

El contenido de los proyectos y las imágenes son míos, o de los clientes en los casos bajo NDA:
**no son reutilizables**. El código puedes mirarlo, aprender de él y copiar lo que te sirva.
