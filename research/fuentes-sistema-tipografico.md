# Research: una familia de muchos anchos + las displays de la entrada

> Resuelve el ticket [#37](https://github.com/i-casaca/portfolio-test-migration/issues/37),
> hijo del mapa [#35](https://github.com/i-casaca/portfolio-test-migration/issues/35).
> Bloquea el [#38](https://github.com/i-casaca/portfolio-test-migration/issues/38).
>
> Sigue la convención de `research/arquitectura-api.md`: cada afirmación va con su fuente, y
> donde no he podido confirmar algo contra documentación primaria lo digo en vez de rellenar
> el hueco.

## Cómo se ha verificado (importa, porque cambia el resultado)

Nada de lo que sigue viene de artículos ni de listas de "las mejores fuentes gratis". Todo se ha
comprobado pidiendo los ficheros de verdad:

- **Ejes reales**: leyendo `https://fonts.google.com/metadata/fonts`, el endpoint de metadatos de
  Google Fonts (1.942 familias, con su registro de ejes). Esto distingue un eje `wdth` real de
  "dos cortes que se llaman Condensed y Expanded".
- **Lo que sirve el CDN**: pidiendo la CSS a `fonts.googleapis.com/css2?...` y descargando los
  `.woff2` que devuelve, para medir bytes reales en vez de estimarlos.
- **Cobertura de caracteres**: abriendo cada `.woff2` servido con `fontTools` e inspeccionando su
  `cmap`. Los tamaños de fichero no sirven para esto: hay que mirar el mapa de caracteres.
- **Licencias**: leyendo el `METADATA.pb` de cada familia en el repo canónico `google/fonts`, y
  el `.txt` de licencia que viene dentro de las descargas reales de Fontshare y Velvetyne.

Un aviso metodológico que casi me lleva a una conclusión falsa: al comprobar cobertura con
`?text=`, **solo puedes verificar los caracteres que has pedido**. Mi primera pasada no incluía
`í` en la cadena y las 29 familias aparecían como "les falta la í". No les faltaba: no se la había
pedido. Las tablas de abajo están hechas pidiendo explícitamente cada carácter que se verifica.

---

## 0. Resumen de la recomendación

| Rol | Familia | Licencia | Cómo se sirve | Peso real medido |
|---|---|---|---|---|
| Toda la web | **Roboto Flex** | OFL 1.1 | Google Fonts, `wdth,wght@25..151,100..1000` | **59.696 B** (subset `latin`) |
| Saludo 1 — masa geométrica | **Rubik Mono One** | OFL 1.1 | Google Fonts `?text=¡Hola!` | **916 B** |
| Saludo 2 — trazo a mano | **Rock Salt** | **Apache 2.0** | Google Fonts `?text=Ey` | **1.576 B** |
| Saludo 3 — condensada extrema | **Bebas Neue** | OFL 1.1 | Google Fonts `?text=Buenas` | **1.072 B** |
| Saludo 4 — estructura lineal | **Monoton** | OFL 1.1 | Google Fonts `?text=Hey` | **696 B** |

Las cuatro displays juntas suman **4.260 B (4,2 kB)**. Con la familia principal, el coste
tipográfico total de la primera carga es **≈62 kB**, y sustituye a las dos familias actuales
(Inter + Fraunces) más las cinco displays de proyecto.

Todo se sirve desde Google Fonts con el mismo patrón de `<link>` que ya usa `index.html`.
**Cero build, cero npm, cero ficheros de fuente en el repo.**

---

## 1. La familia principal: quién tiene eje `wdth` de verdad

### El mapa completo

De 1.942 familias en Google Fonts, **59 no-Noto tienen un eje `wdth` registrado**. Estas son las
que además cubren `latin-ext` y tienen recorrido de ancho suficiente para que "recorrer los
anchos" signifique algo:

| Familia | Categoría | `wdth` | `wght` | Otros ejes | `latin` medido |
|---|---|---|---|---|---|
| **Science Gothic** | Sans | **50–200** | 100–900 | `CTRS`, `slnt` | 95.704 B |
| **Roboto Flex** | Sans | **25–151** | 100–1000 | 11 más (ver abajo) | **59.696 B** |
| Anybody | Display | 50–150 | 100–900 | — | 56.860 B |
| Georama | Sans | 62,5–150 | 100–900 | — | 87.948 B |
| Saira | Sans | 50–125 | 100–900 | — | 98.760 B |
| Archivo | Sans | 62–125 | 100–900 | — | 90.096 B |
| Encode Sans | Sans | 75–125 | 100–900 | — | 44.504 B |
| Nunito Sans | Sans | 75–125 | 200–1000 | `YTLC`, `opsz` | — |
| Mona Sans / Hubot Sans | Sans | 75–125 | 200–900 | — | — |

Fuente de los ejes: `https://fonts.google.com/metadata/fonts`. Fuente de los pesos: descarga real
del subset `latin` que devuelve `css2`.

Nótese lo que dice esa última columna y que es contraintuitivo: **Roboto Flex, con el doble de
recorrido de ancho, pesa un 34 % menos que Archivo y un 38 % menos que Science Gothic.**

### Dos hallazgos sobre cómo sirve Google las variables (esto no está en la documentación)

Ambos comprobados descargando y abriendo el `fvar` de los ficheros:

1. **Pedir un rango más estrecho no ahorra ni un byte.** `Roboto+Flex:wdth,wght@25..151,100..1000`
   y `Roboto+Flex:wdth,wght@75..125,300..800` devuelven **exactamente el mismo fichero de
   59.696 B**, con el `fvar` intacto en `wdth 25–151`. O sea: pide siempre el rango completo, no
   hay penalización por hacerlo.
2. **Google sí recorta los ejes que no pides.** Roboto Flex tiene 13 ejes en origen (`GRAD`,
   `XOPQ`, `XTRA`, `YOPQ`, `YTAS`, `YTDE`, `YTFI`, `YTLC`, `YTUC`, `opsz`, `slnt`, `wdth`, `wght`).
   Pidiendo `wdth,wght` el fichero servido contiene **solo esos dos**. No estamos cargando el
   monstruo paramétrico completo: estamos cargando una variable de dos ejes.
   Y pidiendo `Roboto+Flex:wght@400` devuelve una estática de 14.160 B sin `fvar`.

Ese punto 2 es lo que hace viable la recomendación. El miedo razonable a Roboto Flex ("es una
fuente enorme con trece ejes") no aplica a cómo se sirve aquí.

### Decisión: Roboto Flex

**Licencia**: OFL 1.1 — confirmada en
[`ofl/robotoflex/METADATA.pb`](https://github.com/google/fonts/blob/main/ofl/robotoflex/METADATA.pb)
(`license: "OFL"`, y vive en el directorio `ofl/`). Permite uso web comercial, self-hosting,
modificación y subsetting sin pedir permiso.

**Ejes servidos**: `wdth 25–151`, `wght 100–1000`. Es el recorrido de ancho más amplio de
cualquier libre pensada para texto: 25 % es una condensada casi imposible y 151 % una expandida
ancha de verdad. Cubre `latin` y `latin-ext`.

**Por qué esta y no las otras:**

- **vs. Science Gothic** (`wdth 50–200`, recorrido nominalmente mayor): pesa 95,7 kB frente a
  59,7 kB, un 60 % más, y su esqueleto cuadrado-técnico tiene demasiado carácter propio para ser
  *también* el cuerpo de texto de todo el sitio. Cuando una sola familia carga con la home, los
  casos y los párrafos largos, el carácter fuerte deja de ser un activo. Queda como la opción a
  considerar si en algún momento se quiere que la familia principal grite más: su eje `CTRS`
  (contraste) es algo que Roboto Flex no tiene.
- **vs. Archivo** (`wdth 62–125`): la mitad de recorrido de ancho y aun así 90 kB. Es una
  grotesca excelente, pero 62–125 no da para los seis escalones que pide el ticket sin que
  "fino-ancho" y "muy-ancho" acaben pareciéndose. Es la suplente natural si Roboto Flex resulta
  demasiado neutra al verla en pantalla.
- **vs. Anybody** (`wdth 50–150`, 56,9 kB, casi tan barata): es la más tentadora de las
  descartadas y merece una prueba real. Está clasificada como **Display** en los metadatos de
  Google, y ese es el motivo del descarte: está dibujada para tamaños grandes, no para sostener
  párrafos. Si el sitio termina con muy poco texto corrido, cámbiese por esta sin drama — es
  bastante más personal que Roboto Flex y viene de Velvetyne.
- **vs. Encode Sans** (44,5 kB, la más ligera): `wdth 75–125` es un recorrido demasiado corto.
  Entre 75 y 125 no hay seis anchos distinguibles; hay tres y dos interpolaciones.
- **vs. Saira / Georama**: mismo problema que Archivo con peor relación peso/recorrido
  (98,8 kB y 87,9 kB).

**El punto honesto en contra de Roboto Flex**: es un esqueleto muy visto y, en su ajuste por
defecto (`wdth 100`, `wght 400`), se lee como Roboto. La respuesta es que en este sistema casi
nunca va a estar en su ajuste por defecto, y que la personalidad del sitio la ponen las displays
de la entrada. Si al verlo en pantalla sigue sabiendo a poco, el cambio a Archivo o a Anybody es
una línea de CSS, porque los seis escalones se definen una sola vez.

### Los seis escalones, en CSS

Un solo `<link>`, y la variedad sale de `font-stretch` + `font-weight`. Se usan las propiedades
altas de CSS, no `font-variation-settings`, porque así heredan y cascadean con normalidad (el
`@font-face` que sirve Google ya declara `font-weight: 100 1000` y `font-stretch: 25% 151%`,
verificado en la respuesta del CDN):

```css
:root {
  --f: "Roboto Flex", "Helvetica Neue", Arial, sans-serif;
}

/* los seis escalones del ticket */
.t-fino       { font-family: var(--f); font-weight: 200; font-stretch:  100%; }
.t-normal     { font-family: var(--f); font-weight: 400; font-stretch:  100%; }
.t-medio      { font-family: var(--f); font-weight: 500; font-stretch:  100%; }
.t-ancho      { font-family: var(--f); font-weight: 500; font-stretch:  125%; }
.t-fino-ancho { font-family: var(--f); font-weight: 200; font-stretch:  140%; }
.t-muy-ancho  { font-family: var(--f); font-weight: 700; font-stretch:  151%; }

/* y el extremo opuesto, que es donde esta familia se gana el sueldo */
.t-condensada { font-family: var(--f); font-weight: 800; font-stretch:   40%; }
```

`font-stretch` en porcentaje mapea directamente al eje `wdth`. El `<link>` es uno solo:

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wdth,wght@25..151,100..1000&display=swap" rel="stylesheet">
```

---

## 2. Fontshare no resuelve el punto 1, y hay una razón de licencia además de la técnica

El ticket pedía mirar Fontshare. Lo he hecho contra su API, no contra su web (que es
client-side y no devuelve nada útil a un `curl`).

**Técnicamente**: `https://api.fontshare.com/v2/fonts?limit=100` devuelve el catálogo completo
(`count_total: 100`, `has_more: false`). Recorriendo el campo `axes` de las 100 familias, los
únicos ejes que existen en todo Fontshare son:

```
wght × 83    ital × 1    opsz × 1
```

**Cero familias con eje `wdth`.** Fontshare está fuera del punto 1 del ticket, no por gusto sino
por catálogo.

**Y además, la licencia es un problema para este proyecto.** Las familias de Fontshare vienen en
dos licencias (campo `license_type`): `sil_ofl` y `itf_ffl`. Las OFL son réplicas de familias que
ya están en Google Fonts (Archivo, Poppins, Montserrat...). Las propias de la casa —Satoshi,
Switzer, Clash Display, General Sans, Cabinet Grotesk— son `itf_ffl`. He descargado
`api.fontshare.com/v2/fonts/download/satoshi` y leído el `License/FFL.txt` que trae dentro. Dos
cláusulas chocan de frente con cómo funciona este sitio:

> **02. Limitations of usage** — "You may not modify, edit, adapt, translate, reverse engineer,
> decompile or disassemble, alter or otherwise copy the Font Software [...] without the prior
> written consent of the Licensor."

Subsetear una fuente es modificarla. **El truco del subsetting —que es la técnica central de este
sistema— requiere permiso escrito de ITF para cualquier fuente `itf_ffl`.**

> "You are not allowed to transmit the Font Software over the Internet in font serving or for
> font replacement [...] without the prior written consent of the Licensor."

Y la misma cláusula 02 prohíbe "uploading them in a public server", lo cual es exactamente lo que
sería commitear un `.woff2` en un repo público de GitHub servido por Pages.

Es una EULA propietaria de uso gratuito, no una licencia libre. Para un repo público que subsetea
sus fuentes, **la OFL no es un detalle: es el requisito**. La OFL 1.1 autoriza explícitamente
modificar y redistribuir. Recomendación derivada: **que todo el sistema tipográfico sea OFL (o
Apache 2.0), y evitar `itf_ffl` por completo.**

### Las otras fundiciones del ticket

- **Velvetyne** — OFL 1.1, confirmado leyendo el `LICENSE.txt` de un repo real
  ([`velvetyne/basteleur`](https://gitlab.com/velvetyne/basteleur), "This Font Software is
  licensed under the SIL Open Font License, Version 1.1"). Su
  [página de licencias](https://velvetyne.fr/about/) pide **acreditar al diseñador y a la
  fundición**, lo cual es una condición fácil de cumplir pero hay que cumplirla. Catálogo
  extraordinario para displays raras (Pilowlava, Trickster, Basteleur, Fungal, BianZhiDai). Nada
  documentado con eje `wdth`. No está en Google Fonts → no hay `?text=`, hay que self-hostear
  subseteado (ver §4).
- **Collletttivo** — 16 tipografías open source (Apfel Grotezk, Ronzino, Absans, Coconat,
  Sinistre...). No he podido confirmar la licencia por familia ni la presencia de ejes `wdth`
  desde su web: **lo digo como no verificado**, no como inexistente. Habría que abrir la ficha de
  cada tipografía. No hace falta para esta recomendación.
- **Open Foundry** — es un catálogo curado de ~30 familias que ya están en Google Fonts (Roboto,
  Inter, Oswald, Work Sans, League Gothic...). Útil como galería de referencia; **no es una fuente
  de fuentes nuevas** ni aporta ninguna familia con `wdth` que no esté ya en la tabla de §1.

**Conclusión de esta sección**: para el punto 1 del ticket, Google Fonts es hoy el único sitio con
ejes `wdth` libres, reales y servidos por un CDN. No es pereza: es el resultado de recorrer los
cuatro catálogos.

---

## 3. Las displays de la entrada

### Criterio

El efecto es el contraste entre ellas, así que el conjunto se elige por **disparidad en cuatro
dimensiones distintas** — masa, gesto, proporción y estructura — de modo que ninguna se parezca a
otra en el eje en que la de al lado destaca:

| Saludo | Familia | Qué aporta | Licencia | Peso medido |
|---|---|---|---|---|
| 1 | **Rubik Mono One** | Masa. Geométrica pesadísima de ancho fijo; el saludo es un bloque macizo. | OFL 1.1 | 916 B (`¡Hola!`) |
| 2 | **Rock Salt** | Gesto. Manuscrita a rotulador, trazo irregular y sucio; lo único no dibujado con regla. | **Apache 2.0** | 1.576 B (`Ey`) |
| 3 | **Bebas Neue** | Proporción. Condensada extrema en caja alta, vertical y estrecha. | OFL 1.1 | 1.072 B (`Buenas`) |
| 4 | **Monoton** | Estructura. Display de líneas múltiples: hueca, sin masa, todo contorno. | OFL 1.1 | 696 B (`Hey`) |

Licencias confirmadas una por una en `google/fonts`:
[`ofl/rubikmonoone`](https://github.com/google/fonts/blob/main/ofl/rubikmonoone/METADATA.pb),
[`apache/rocksalt`](https://github.com/google/fonts/blob/main/apache/rocksalt/METADATA.pb),
[`ofl/bebasneue`](https://github.com/google/fonts/blob/main/ofl/bebasneue/METADATA.pb),
[`ofl/monoton`](https://github.com/google/fonts/blob/main/ofl/monoton/METADATA.pb).

**Rock Salt es Apache 2.0, no OFL.** No cambia nada en la práctica —Apache 2.0 permite uso
comercial, self-hosting y modificación— pero conviene no escribir "todo OFL" en ningún sitio,
porque no lo es.

### El `?text=` funciona con las cuatro, y con acentos

Comprobado pidiendo cada una y leyendo el `unicode-range` que devuelve la CSS, que es la propia
declaración de Google de qué glifos ha podido servir:

```
Rubik Mono One  ?text=¡Hola!  → unicode-range: U+21, U+48, U+61, U+6c, U+6f, U+a1   →   916 B
Rock Salt       ?text=Ey      → unicode-range: U+45, U+79                           → 1.576 B
Bebas Neue      ?text=Buenas  → unicode-range: U+42, U+61, U+65, U+6e, U+73, U+75   → 1.072 B
Monoton         ?text=Hey     → unicode-range: U+48, U+65, U+79                     →   696 B
```

El `U+a1` de la primera línea es la apertura `¡` servida correctamente. Además he verificado el
`cmap` de las 29 candidatas pidiendo explícitamente `¡ ¿ Á É Í Ó Ú Ñ ñ á é í ó ú ü`: **las 29
cubren el castellano completo**, acentos y signos de apertura incluidos. La cobertura no fue el
criterio de descarte de ninguna.

**Un detalle sobre los subsets que corrige una suposición habitual**: el castellano **no
necesita `latin-ext`**. Esto no es un tecnicismo: **Rock Salt no publica subset `latin-ext`** en
Google Fonts (y Linefont tampoco). Si el criterio hubiera sido "que tenga `latin-ext`", Rock Salt
se habría descartado por error. Su `cmap` cubre el castellano completo, verificado glifo a glifo.

El motivo es que el subset `latin` de Google declara `unicode-range: U+0000-00FF, ...`, y
ahí dentro están `¡` (U+00A1), `¿` (U+00BF), `á é í ó ú` (U+00E1–U+00FA) y `ñ` (U+00F1).
`latin-ext` empieza en U+0100 y es para checo, polaco, turco, etc. Verificado en la respuesta del
CDN. Para las displays da igual, porque `?text=` ignora los subsets y sirve glifo a glifo, pero
importa para la familia principal: **basta el subset `latin`**.

### Dos avisos de dibujo

Comprobados comparando los contornos de `a` y `A` en el fichero servido:

- **Rubik Mono One** y **Silkscreen** **no tienen minúsculas reales**: `a` y `A` devuelven el
  mismo contorno. Los saludos que vayan en estas dos se verán en caja alta pase lo que pase.
  Para `¡Hola!` en Rubik Mono One es indiferente, pero conviene saberlo antes de maquetar.
- **Bebas Neue** y **Monoton** **sí tienen minúsculas** con contornos distintos de las
  mayúsculas, en contra de lo que suele decirse de Bebas.

### El `<head>`, siguiendo el patrón que ya está en el repo

Mismo formato que las líneas 21–25 de `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Rubik+Mono+One&text=%C2%A1Hola%21&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Rock+Salt&text=Ey&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&text=Buenas&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Monoton&text=Hey&display=swap" rel="stylesheet">
```

Dos cosas que hay que respetar al tocar esto:

1. **El `¡` va URL-encoded como `%C2%A1`** (UTF-8 de U+00A1). Sin encodear, el `<link>` es frágil.
   El `!` como `%21` por prudencia.
2. **Si se cambia el texto del saludo, hay que cambiar el `?text=`.** Es el precio del truco: la
   fuente solo trae los glifos pedidos, así que un saludo nuevo con una letra nueva se renderiza
   con la fuente de fallback y nadie se da cuenta hasta que se ve. Merece un comentario en el
   HTML al lado de los `<link>`.

---

## 4. Si alguna vez se quiere una display de fuera de Google Fonts

Velvetyne tiene displays con mucho más carácter que cualquier cosa en Google Fonts (Pilowlava,
que se derrite; Trickster, de contraste extremo caligráfico; Basteleur, una bastarda rara). No
están en Google Fonts, así que no hay `?text=`. La ruta es subsetear a mano y commitear el
`.woff2`, **que la OFL permite explícitamente**.

Probado de principio a fin con Basteleur para confirmar que es viable:

```bash
pip install fonttools brotli          # una vez, en local; no entra en el repo
pyftsubset Basteleur-Bold.otf \
  --text="¡Hola!" --flavor=woff2 \
  --layout-features='' --no-hinting --desubroutinize \
  --output-file=assets/fonts/basteleur-hola.woff2
```

Resultado real: **103.056 B → 1.116 B**, 7 glifos, cobertura completa de `¡Hola!` verificada en
el `cmap` del fichero generado. Es competitivo con lo que sirve Google.

```css
@font-face {
  font-family: "Basteleur";
  src: url("/assets/fonts/basteleur-hola.woff2") format("woff2");
  font-display: swap;
}
```

Esto **no rompe la regla de "sin build"**: `pyftsubset` se ejecuta una vez en local, a mano, y lo
que se commitea es el `.woff2` resultante. GitHub Pages sirve un fichero estático. No hay npm, ni
bundler, ni paso de compilación en el despliegue. Lo que sí añade es **una obligación de crédito**
(Velvetyne pide acreditar diseñador y fundición) y un fichero binario en el repo que hay que
regenerar si cambia el saludo.

No lo recomiendo para el arranque: las cuatro de §3 dan disparidad suficiente por 4,2 kB y cero
mantenimiento. Queda documentado para cuando el sitio esté vivo y se quiera subir la apuesta en un
saludo concreto.

---

## 5. Alternativas descartadas

### Familia principal

| Candidata | Motivo del descarte |
|---|---|
| Science Gothic | `wdth 50–200` es el mejor recorrido, pero 95,7 kB (+60 %) y demasiado carácter para ser también el texto corrido. |
| Anybody | Casi igual de barata (56,9 kB) y muy personal, pero clasificada Display: no está dibujada para párrafos. La suplente si el sitio lleva poco texto. |
| Archivo | `wdth 62–125` no da seis anchos distinguibles, y aun así pesa 90 kB. |
| Encode Sans | La más ligera (44,5 kB), pero `wdth 75–125` es un recorrido demasiado corto. |
| Saira / Georama | Peor relación peso/recorrido (98,8 kB / 87,9 kB) que las de arriba. |
| Nunito Sans, Mona Sans, Hubot Sans, Asap, Trispace, Truculenta | `wdth 75–125`: recorrido corto. Mismo problema que Encode Sans sin ser más ligeras. |
| Inter (la actual) | **No tiene eje `wdth`.** Sus ejes en Google Fonts son `wght` (100–900) y `opsz` (14–32). Incompatible con el punto 1. |
| Fraunces (la actual) | Sin `wdth` (`SOFT`, `WONK`, `opsz`, `wght`). Además, dos familias es lo que el ticket quiere eliminar. |
| Satoshi, Switzer, Clash Display, General Sans, Cabinet Grotesk | Fontshare: **ningún eje `wdth` en todo el catálogo**, y licencia `itf_ffl` que prohíbe subsetear sin permiso escrito. |
| Roboto Condensed / Archivo Narrow / Saira Condensed | Son el antipatrón que el ticket señala: cortes separados que imitan un eje. No interpolan. |
| Linefont | `wdth 25–200`, el recorrido más bestia de todos, pero **sin `latin-ext`** y es una display experimental, no una familia de texto. |
| Amstelvar | Laboratorio de ejes paramétricos, no una familia para producción. |

### Displays

| Candidata | Motivo del descarte |
|---|---|
| Anton | Ya se usa en `index.html` para Adrenaline: reutilizarla resta disparidad. Bebas Neue ocupa su hueco condensado. |
| Bungee, Unbounded, Yeseva One, Bodoni Moda | Ya en uso para nombres de proyecto; misma razón. |
| Archivo Black | Es la principal candidata suplente de la familia de texto: usarla también de display rompería el contraste. |
| Nabla | Espectacular (variable cromática COLRv1) pero 2.832 B y **soporte de color font desigual entre navegadores**: riesgo alto para el primer impacto del sitio. |
| Silkscreen | Solo 700 B y muy alienígena, pero pixel bitmap: a tamaño enorme se ve roto, y **sin minúsculas reales**. |
| Rubik Glitch / Rubik Wet Paint | ~11 kB cada una: el efecto ya viene dibujado en el contorno y cuesta 10× lo que las elegidas. |
| Bagel Fat One | Buena (1.292 B) pero compite en el mismo eje que Rubik Mono One: masa redonda contra masa geométrica. |
| Abril Fatface / Alfa Slab One | Didone gorda y slab gorda: contraste de detalle, no de categoría. Aportan poco frente a Rubik Mono One. |
| Bowlby One, Poetsen One, Fjalla One, Oswald | Correctas y sin defecto: simplemente no añaden una quinta dimensión a masa/gesto/proporción/estructura. |
| Monoton vs Bungee Shade / Bungee Outline | Bungee Shade (8.068 B) y Outline (6.560 B) hacen lo mismo que Monoton por 10× el peso. |
| Big Shoulders Display | 1.392 B, condensada variable y muy buena; Bebas Neue es más extrema en proporción por menos bytes. |
| Sacramento, Grape Nuts, Sedgwick Ave Display | Manuscritas más suaves; Rock Salt es la más agresiva y la que más contrasta con las otras tres. |
| Pilowlava, Trickster, Basteleur (Velvetyne) | Las más interesantes en carácter, pero exigen self-hosting subseteado + crédito obligatorio. Documentadas en §4 como mejora futura. |

---

## 6. Lo que queda sin verificar

En interés de no presentar esto como más cerrado de lo que está:

- **No he visto ninguna de estas fuentes renderizada.** Todo lo de arriba es licencia, ejes,
  bytes y cobertura de glifos —cosas comprobables por fichero—. Si Roboto Flex resulta demasiado
  neutra a ojo, o si Monoton no aguanta el tamaño enorme, eso se decide mirando, y el cambio es
  barato: los seis escalones viven en un sitio y cada display es un `<link>`.
- **Collletttivo**: no he confirmado licencia por familia ni ejes. No afecta a la recomendación,
  pero el ticket lo pedía como fuente y el resultado es "sin verificar", no "descartado".
- **Los saludos son de ejemplo.** `¡Hola!` / `Ey` / `Buenas` / `Hey` sirven para medir. Cuando se
  decidan los definitivos hay que regenerar los `?text=` — ver el aviso al final de §3.

---

## Fuentes

Documentación primaria y ficheros reales, en el orden en que se han usado:

- Metadatos y registro de ejes de Google Fonts — `https://fonts.google.com/metadata/fonts`
- API CSS2 de Google Fonts — `https://fonts.googleapis.com/css2` (respuestas y `.woff2` medidos)
- Repo canónico de licencias — [`github.com/google/fonts`](https://github.com/google/fonts),
  ficheros `METADATA.pb` de `ofl/…` y `apache/…`
- API de Fontshare — `https://api.fontshare.com/v2/fonts` (catálogo y campo `axes`)
- EULA de Fontshare — `License/FFL.txt` dentro de
  `https://api.fontshare.com/v2/fonts/download/satoshi` (Copyright 2021 Indian Type Foundry,
  actualizada 22 marzo 2021)
- Licencias de Velvetyne — [velvetyne.fr/about](https://velvetyne.fr/about/) y
  `LICENSE.txt` de [`gitlab.com/velvetyne/basteleur`](https://gitlab.com/velvetyne/basteleur)
- Catálogo de Collletttivo — [collletttivo.it](https://www.collletttivo.it/)
- Catálogo de Open Foundry — [open-foundry.com/fonts](https://open-foundry.com/fonts)
- `pyftsubset`, de [fonttools](https://github.com/fonttools/fonttools) (v4.60.2), para el subset
  de §4
