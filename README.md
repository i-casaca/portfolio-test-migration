# Migración de prueba de mi portfolio

**De Framer a HTML escrito a mano, con un chatbot que responde sobre mi trabajo sin usar ningún modelo de IA.**

[![Estado](https://img.shields.io/badge/estado-experimento_activo-2ea44f)](https://github.com/i-casaca/portfolio-test-migration/issues)
[![Versión](https://img.shields.io/badge/versión-0.2.0-blue)](https://github.com/i-casaca/portfolio-test-migration/releases)
[![Sitio](https://img.shields.io/badge/ver_el_sitio-en_vivo-ff6b35)](https://i-casaca.github.io/portfolio-test-migration/)
[![Sin build](https://img.shields.io/badge/build-ninguno-lightgrey)](#por-qué-sin-framework)

🔗 **[Ver el sitio en vivo →](https://i-casaca.github.io/portfolio-test-migration/)**

---

## Qué es esto

Soy [Ismael Casado](https://www.linkedin.com/in/ismaelcasadoc/), Product Designer. **Mi portfolio
está en [isma-casaca.framer.website](https://isma-casaca.framer.website/)** — ese es el bueno.

Este repositorio es otra cosa: el experimento de reconstruirlo **a mano**, en HTML, CSS y
JavaScript planos, para ver qué se aprende por el camino. No lo sustituye.

No lo hice porque Framer fuera malo. Lo hice porque **quería entender qué pasa por debajo**: cómo se
publica una web de verdad, qué es una rama, para qué sirve un Pull Request, y hasta dónde llego yo
solo antes de necesitar a alguien de desarrollo.

La segunda mitad del experimento es la parte que no esperaba: **un chatbot que contesta preguntas
sobre mi trabajo**. Lo interesante no es que exista, sino cómo está hecho — no lleva ningún modelo
de lenguaje detrás, y lo dice.

> [!NOTE]
> Es un experimento de aprendizaje, no una arquitectura ejemplar ni mi portfolio en uso. Si has
> llegado buscando cómo montar un portfolio, hay caminos más rápidos. Si has llegado buscando
> **cómo piensa un diseñador cuando se mete en el código**, quédate.

---

## Índice

- [El chatbot: por qué no usa IA](#el-chatbot-por-qué-no-usa-ia)
- [Cómo está construido](#cómo-está-construido)
- [Verlo en tu ordenador](#verlo-en-tu-ordenador)
- [Estructura del repositorio](#estructura-del-repositorio)
- [El muro de contraseña](#el-muro-de-contraseña)
- [Cómo se decide lo que se construye](#cómo-se-decide-lo-que-se-construye)
- [Qué falta](#qué-falta)
- [Contacto](#contacto)

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

### El fallo que más me enseñó

Probándolo, le pregunté por un proyecto bajo NDA con la página todavía bloqueada. **Me lo contó
entero.** El muro de contraseña de las páginas no servía de nada: bastaba preguntárselo al chat.

El corpus ya marcaba qué fragmentos eran confidenciales — pero la búsqueda nunca miraba esa marca.
Está arreglado, y la lección quedó anotada: *una medida de seguridad que solo cubre una puerta no es
una medida de seguridad.*

---

## Cómo está construido

| | |
|---|---|
| **HTML, CSS y JavaScript planos** | Sin React, sin Tailwind, sin `npm install` |
| **Sin paso de build** | Lo que hay en el repositorio es exactamente lo que se sirve |
| **GitHub Pages** | Despliegue automático al fusionar en `main` |
| **~920 líneas de JS** para el chat | `chat-corpus.js` (motor), `chat-bubble.js` (interfaz), `chat-corpus-tags.js` (etiquetas) |

### Por qué sin framework

Porque el objetivo era **entender**, no entregar rápido. Un framework me habría dado el resultado
antes y me habría enseñado menos. El sitio entero son unas 2.800 líneas entre HTML, CSS y JS: puedo
leerlas de principio a fin, así que no hay magia que no pueda explicar.

Efecto secundario: se abre rápido y no depende de nada que pueda romperse en una actualización.

---

## Verlo en tu ordenador

No hace falta instalar nada más que Python, que macOS y Linux ya traen.

```bash
git clone https://github.com/i-casaca/portfolio-test-migration.git
cd portfolio-test-migration
python3 -m http.server 8000
```

Abre <http://localhost:8000>.

> [!IMPORTANT]
> Ábrelo con un servidor, no con doble clic en `index.html`. El chatbot lee las otras páginas con
> `fetch`, y el navegador bloquea eso desde `file://` por seguridad. Sin servidor, el sitio se ve
> pero el chat no encuentra nada.

---

## Estructura del repositorio

```
index.html                 Portada: hero interactivo, índice de proyectos, sobre mí y metodología
adrenaline.html            ─┐
arabvision.html             │  Proyectos de cliente — bajo muro de contraseña
nexahub.html               ─┘
manu-cardiel.html          ─┐  Proyectos abiertos
el-paraguas.html           ─┘

assets/js/chat-corpus.js       El motor: lee el sitio y busca en él
assets/js/chat-corpus-tags.js  Lo único del corpus escrito a mano: de qué habla cada fragmento
assets/js/chat-bubble.js       La interfaz del chat
assets/js/reveal.js            Aparición al hacer scroll
assets/js/page-transition.js   Transición entre páginas
assets/cv/                     CV descargable

entrevista/                Las 20 preguntas que me hice y mis respuestas en bruto
spec/                      Cómo sería el chatbot con un modelo de verdad (escrito, no ejecutado)
research/                  Investigación con fuentes: plataformas, precios, arquitectura
```

Las carpetas `entrevista/`, `spec/` y `research/` **no las usa el sitio**. Están porque el
razonamiento detrás de cada decisión me parece tan parte del proyecto como el código.

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
mapa: un issue es el mapa (destino, decisiones tomadas, lo que queda fuera) y cada issue hijo es una
pregunta que hay que resolver antes de poder construir.

| mapa | de qué va |
|---|---|
| [#1](https://github.com/i-casaca/portfolio-test-migration/issues/1) | La migración de Framer al sitio estático |
| [#15](https://github.com/i-casaca/portfolio-test-migration/issues/15) | El chatbot y la especificación de su versión con API |

**Los 17 issues cerrados tienen escrita la decisión y el porqué**, incluidos los caminos que se
descartaron. Si quieres ver cómo se llegó a algo, ese es el sitio — no este README.

Convención de ramas: `main` es lo publicado, una rama por issue, fusionada por Pull Request.

---

## Qué falta

- [ ] **Accesibilidad del chat** — foco de teclado y lector de pantalla sin revisar
- [ ] **Comportamiento en móvil** de la burbuja
- [ ] **Un criterio de evaluación** del chatbot que no sea probarlo a mano
- [ ] **CV en inglés** — hoy solo está en español
- [ ] **Muro de contraseña de verdad**, con servidor — requisito para cualquier despliegue serio

Lo que **no** está previsto: conectar el chatbot a un modelo de lenguaje. Está especificado en
[`spec/`](spec/chatbot-api-produccion.md) y ahí se queda hasta que haya una razón para pagarlo.

---

## Contacto

**Ismael Casado** — Product Designer · Madrid

[![Portfolio](https://img.shields.io/badge/portfolio-isma--casaca.framer.website-ff6b35)](https://isma-casaca.framer.website/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ismaelcasadoc-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ismaelcasadoc/)
[![Medium](https://img.shields.io/badge/Medium-@ismael.casadoc-000000?logo=medium&logoColor=white)](https://medium.com/@ismael.casadoc)

📄 [Descargar mi CV](assets/cv/isma-casado-cv-es.pdf)

---

<sub>El contenido de los proyectos y las imágenes son míos, o de los clientes en los casos bajo NDA.
El código puedes mirarlo, aprender de él y copiar lo que te sirva.</sub>
