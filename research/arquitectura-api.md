# Research: arquitectura de producción para el chatbot con `claude-haiku-4-5`

> Resuelve el ticket [#19](https://github.com/i-casaca/portfolio-test-migration/issues/19),
> hijo del mapa [#15](https://github.com/i-casaca/portfolio-test-migration/issues/15).
>
> **Nada de esto se ejecuta.** Es documentación de cómo sería la versión con API real del
> chatbot-entrevista, si algún día Ismael acepta el coste. El prototipo actual ("shadowman")
> no usa ningún LLM.
>
> Nota sobre dónde vive este archivo: el repo tiene una carpeta `.scratch/portfolio-migration/`
> con snapshots e investigación del **mapa #1** (la migración desde Framer). Ese `.scratch/` está
> explícitamente scoped a ese esfuerzo (ver su propio `README.md`), no es una convención general
> del repo para *cualquier* research. Como el mapa #15 (este chatbot) no tiene una carpeta
> equivalente todavía, este archivo se guarda en `research/arquitectura-api.md`, en la raíz del
> repo, tal como pedía el ticket.

Cada afirmación va con su fuente. Donde no pude confirmar algo contra documentación primaria,
lo digo explícitamente en vez de rellenar el hueco.

---

## Estado de este documento

Completo — partes 1 a 5.

---

## 1. Proxy serverless gratuito: Cloudflare Workers vs Vercel Functions vs Netlify Functions

### Por qué hace falta un proxy

La clave de API de Anthropic no puede vivir en el navegador: el repo es público, así que
cualquiera podría leerla desde el código fuente servido por GitHub Pages y usarla a costa de
Ismael. Necesitamos una pieza de servidor, fuera del repo público, que reciba la pregunta del
visitante, añada la clave (guardada como secreto en esa plataforma) y llame a
`api.anthropic.com` en nombre del navegador. Las tres opciones son "funciones serverless"
gratuitas que no requieren gestionar un servidor propio.

### Qué incluye el plan gratuito hoy

**Cloudflare Workers (plan Free):**
- **100.000 peticiones/día**, con el contador reiniciando a medianoche UTC. Pasado ese límite,
  las peticiones fallan con el error 1027.
- **10 ms de tiempo de CPU** por petición HTTP (solo cuenta ejecución activa de código, no el
  tiempo de espera de red — o sea, esperar la respuesta de Anthropic no cuenta contra este límite).
- Máximo **50 subpeticiones** (llamadas `fetch()` a otras APIs) por invocación.
- 128 MB de memoria por isolate, hasta 100 Workers por cuenta.
- Fuente: [developers.cloudflare.com/workers/platform/limits](https://developers.cloudflare.com/workers/platform/limits/)

**Vercel Functions (plan Hobby, con Fluid Compute activado por defecto en proyectos nuevos):**
- **1.000.000 de invocaciones/mes** incluidas.
- **4 horas de "Active CPU"** incluidas al mes (tiempo de CPU realmente en ejecución; el tiempo
  esperando una respuesta externa como la de Anthropic no cuenta).
- **360 GB-hora de memoria provisionada** incluida.
- Duración máxima de función: **300 s (5 minutos)**, por defecto y como máximo en Hobby (en Pro
  se puede extender a 800 s, o 1800 s en beta).
- Memoria máxima: **2 GB / 1 vCPU** en Hobby.
- Fuentes: [vercel.com/docs/functions/usage-and-pricing](https://vercel.com/docs/functions/usage-and-pricing),
  [vercel.com/docs/functions/limitations](https://vercel.com/docs/functions/limitations)

**Netlify Functions (plan Free/Starter):**
- **125.000 invocaciones de función/mes** incluidas (más 1 millón de invocaciones de Edge
  Functions, que es una pieza distinta y más limitada).
- Límite de ejecución: **60 segundos** para funciones síncronas normales (el límite histórico de
  10 s que aparece en foros y artículos antiguos ya no corresponde a la documentación vigente),
  30 s para funciones programadas (`scheduled`), 15 minutos para funciones en segundo plano
  (`background`, solo en planes de pago).
- Memoria: 1024 MB por defecto (configurable de 1024 a 4096 MB solo en planes Pro/Enterprise de
  pago por crédito).
- Fuentes: [netlify.com/blog/introducing-netlify-free-plan](https://www.netlify.com/blog/introducing-netlify-free-plan/),
  [docs.netlify.com/build/functions/configuration](https://docs.netlify.com/build/functions/configuration/)

**Ojo con una cosa:** los tres planes gratuitos son generosos para un chatbot de portfolio (nadie
va a hacer 100.000 peticiones/día a la web de Ismael), así que el criterio de elección no debería
ser "cuál da más cuota gratis", sino cuál es más simple de operar sin ser experto en
infraestructura.

### Arranque en frío (cold start)

- **Cloudflare Workers:** la documentación oficial explica que Workers no usan el modelo de
  máquina virtual por invocación; cada Worker corre en un *isolate* V8 dentro de un proceso ya
  arrancado. Cita textual: *"Any given isolate can start around a hundred times faster than a
  Node process on a container or virtual machine"*. No dan un número exacto en milisegundos, pero
  el diseño está pensado para que el arranque en frío sea, en la práctica, imperceptible.
  Fuente: [developers.cloudflare.com/workers/reference/how-workers-works](https://developers.cloudflare.com/workers/reference/how-workers-works/)
- **Vercel y Netlify:** ambas corren sobre funciones al estilo AWS Lambda (contenedor por
  invocación cuando no hay una instancia "caliente" reciente). No encontré en la documentación
  oficial de ninguna de las dos un número concreto de milisegundos de cold start — es un dato que
  varía con el runtime (Node vs Edge) y no está publicado como garantía. Lo dejo señalado como no
  verificado contra fuente primaria en vez de rellenarlo con cifras de blogs de terceros. Lo que sí
  es primario: Vercel ofrece un runtime "Edge" (basado en V8 isolates, como Cloudflare) además del
  runtime "Node.js" — el Edge runtime tiene arranques más rápidos por el mismo motivo arquitectónico
  que Cloudflare, pero para esta llamada (proxy a Anthropic con streaming) el runtime Node.js de
  Vercel también funciona.

### Cómo se ejecuta la misma función en local

Confirmado contra documentación oficial en los tres casos — **sí, las tres ofrecen un comando de
CLI que simula la función localmente antes de desplegar**:

- **Cloudflare:** `wrangler dev` — *"Start a local server for developing your Worker"*. Corre el
  runtime real `workerd` en local (el mismo motor que produción, con `TZ=UTC` para igualar el
  comportamiento de fechas). Las peticiones se mandan a `localhost:8787`.
  Fuente: [developers.cloudflare.com/workers/wrangler/commands/workers](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
- **Vercel:** `vercel dev` — *"replicate the Vercel deployment environment locally, allowing you
  to test your Vercel Functions [...] without requiring you to deploy each time"*.
  Fuente: [vercel.com/docs/cli/dev](https://vercel.com/docs/cli/dev)
- **Netlify:** `netlify dev` — arranca un entorno de desarrollo local que reproduce el entorno de
  producción de Netlify, incluidas las funciones serverless.
  Fuente: [docs.netlify.com/cli/get-started](https://docs.netlify.com/cli/get-started/)

En los tres casos hace falta instalar la CLI de la plataforma (`npm install -g wrangler` /
`vercel` / `netlify-cli`) y tener Node.js instalado — no es "sin instalar nada", pero tampoco
exige nada más allá de eso.

### Recomendación

Para alguien que no es experto en código y que ya tiene el sitio en GitHub Pages, recomiendo
**Cloudflare Workers**, por estas razones concretas:

1. Es la única de las tres cuya documentación primaria explica *por qué* no hay arranque en frío
   (isolates V8 arrancando dentro de un runtime ya activo), en vez de depender del modelo
   contenedor-por-invocación de AWS Lambda que usan Vercel y Netlify por debajo. Para un chatbot
   donde la primera respuesta importa (nadie quiere esperar 1-2 s extra en la primera pregunta),
   esto es una ventaja estructural, no solo de marketing.
2. El límite de CPU (10 ms) parece agresivo, pero como no cuenta el tiempo de espera de red (la
   parte lenta es esperar a que Anthropic genere texto), un proxy que solo reenvía bytes entre el
   navegador y Anthropic apenas consume CPU activa — encaja bien en ese límite.
3. Vercel y Netlify están más orientados a servir el frontend completo (Next.js, builds, etc.).
   Aquí GitHub Pages ya sirve el sitio; lo único que hace falta es *un* endpoint de función suelto,
   sin re-plataformizar todo el hosting. Cloudflare Workers permite desplegar exactamente eso — un
   único archivo de función — sin pedir que el resto del sitio se mueva a su plataforma.
4. Turnstile (el captcha de Cloudflare, ver sección 4) es del mismo proveedor y se integra sin
   salir del ecosistema, lo cual simplifica la historia para alguien no experto: una cuenta, una
   CLI (`wrangler`), una consola.

Vercel es la alternativa más razonable si en el futuro el frontend se reescribe con un framework
(Next.js, etc.) — ahí Vercel Functions vienen "gratis" con el despliegue. Netlify queda en tercer
lugar aquí: su límite de invocaciones/mes (125.000) es el más bajo de los tres (aunque de sobra
para este caso) y su rate limiting nativo por IP solo es completo en el plan Enterprise (ver
sección 4), lo que la hace menos autosuficiente para el objetivo de anti-abuso.

---

## 2. Streaming SSE y CORS

### Por qué streaming

Anthropic devuelve las respuestas del modelo como Server-Sent Events (SSE) cuando se pide
streaming — el texto llega en trozos, no todo de golpe. Para que el visitante vea la respuesta
"escribiéndose" en vivo (en vez de una barra de carga y luego todo el texto de golpe), la función
proxy tiene que reenviar esos trozos al navegador según van llegando, no esperar a que Anthropic
termine y mandar todo junto.

### Cómo se hace en cada plataforma

**Cloudflare Workers:** el patrón documentado usa `TransformStream`: se crea un par
`{ readable, writable }`, se itera sobre los trozos de la respuesta de streaming (en el ejemplo
oficial, de OpenAI, pero el patrón es idéntico para Anthropic) escribiendo cada fragmento al lado
`writable`, y se devuelve `new Response(readable)` inmediatamente — el Worker no espera a que
termine el stream para responder, lo va rellenando en vivo. `ctx.waitUntil()` asegura que el
streaming en segundo plano continúe aunque la función ya haya "respondido".
Fuente: [developers.cloudflare.com/workers/examples/openai-sdk-streaming](https://developers.cloudflare.com/workers/examples/openai-sdk-streaming/)
(patrón general de streaming con `ReadableStream`/`Response`:
[developers.cloudflare.com/workers/runtime-apis/streams](https://developers.cloudflare.com/workers/runtime-apis/streams/))

**Vercel Functions:** soporta streaming de forma nativa devolviendo un `Response` cuyo `body` es
un stream, con cabecera `Content-Type: text/event-stream`. Vercel recomienda su propio paquete
`ai` (Vercel AI SDK) para reducir el código repetitivo de streaming, aunque no es obligatorio —
un `ReadableStream` a mano también funciona. Límite relevante: con el runtime **Edge**, la función
debe empezar a enviar respuesta en menos de 25 s para mantener la capacidad de streaming, y puede
seguir transmitiendo hasta 300 s en total. Con el runtime **Node.js** (con Fluid Compute), el
límite es el `maxDuration` general (300 s por defecto/máximo en Hobby).
Fuente: [vercel.com/docs/functions/streaming-functions](https://vercel.com/docs/functions/streaming-functions),
[vercel.com/docs/functions/limitations](https://vercel.com/docs/functions/limitations)

**Netlify Functions:** también soporta pasar directamente un `Response` cuyo `body` ya es un
`ReadableStream` (el ejemplo oficial es literalmente "pasar `res.body` de la API de OpenAI
directamente"), con cabecera `content-type: text/event-stream`. Limitación explícita documentada:
**60 segundos de límite de ejecución y 20 MB de límite de tamaño de respuesta** para funciones en
modo streaming. Las funciones programadas (`scheduled`) no soportan streaming porque no devuelven
cuerpo de respuesta.
Fuente: [docs.netlify.com/build/functions/api](https://docs.netlify.com/build/functions/api/)

En los tres casos el patrón de código es el mismo a alto nivel: la función abre la conexión SSE
hacia `api.anthropic.com` con la clave secreta, y por cada evento que Anthropic manda, lo reenvía
tal cual (o transformado) al navegador por su propia conexión SSE. Ninguna de las tres exige
"guardar todo en memoria y mandarlo de una vez" — las tres soportan el streaming real de extremo a
extremo.

**Nota práctica para el caso concreto de Ismael:** con un corpus de portfolio de ~12K tokens y
turnos de conversación cortos, la respuesta de Anthropic para `claude-haiku-4-5` normalmente
tarda pocos segundos en completarse — muy por debajo de cualquiera de estos límites (10 ms de CPU
activa de Cloudflare no es un problema porque ese tiempo es de *espera*, no de CPU; 60 s de
Netlify y 300 s de Vercel/Hobby son de sobra). El límite que sí importa vigilar si algún día se
añaden documentos mucho más largos o conversaciones muy largas es el de Netlify (60 s), el más
corto de los tres para funciones en streaming.

### CORS

El navegador va a llamar a la función proxy desde `https://i-casaca.github.io`, que es un origen
distinto al de la función (`*.workers.dev`, `*.vercel.app` o `*.netlify.app`, o el dominio propio
si se configura uno). Sin cabeceras CORS correctas, el navegador bloquea la respuesta aunque la
llamada de red haya funcionado.

Configuración necesaria en los tres casos (esto es un patrón HTTP estándar, no específico de
ninguna plataforma, pero cada una lo aplica sobre su propio objeto `Response`):

- Cabecera `Access-Control-Allow-Origin: https://i-casaca.github.io` en la respuesta real
  (nunca `*` si se quiere restringir a un origen concreto — y para un proxy con clave de pago
  detrás, restringir el origen es importante, aunque no sustituye al rate limiting).
- Responder a la petición de *preflight* (`OPTIONS`) con
  `Access-Control-Allow-Methods: POST, OPTIONS` y
  `Access-Control-Allow-Headers` (ecoando lo que el navegador pida en
  `Access-Control-Request-Headers`, típicamente `Content-Type`).
- Cabecera `Vary: Origin` para que la caché HTTP no sirva la respuesta CORS de un origen a otro
  visitante con un origen distinto.
- El ejemplo oficial de Cloudflare para un proxy CORS muestra exactamente este patrón (aunque el
  suyo es genérico, no específico de streaming): fija `Access-Control-Allow-Origin` al origen de
  la petición, añade `Vary: Origin`, y contesta el preflight con los métodos y cabeceras
  permitidos. Fuente: [developers.cloudflare.com/workers/examples/cors-header-proxy](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- Para Vercel y Netlify no encontré un ejemplo oficial *específico para streaming + CORS
  combinados* (sí para CORS en general, y sí para streaming en general, por separado) — technically
  se combinan poniendo las cabeceras CORS en el mismo objeto `Response` que ya lleva
  `Content-Type: text/event-stream`, pero marco esto como inferencia razonable a partir de la
  documentación, no como cita textual de un ejemplo que junte ambas cosas.

---

## 3. Gestión de secretos

La pregunta común a las tres plataformas: ¿dónde vive la clave de Anthropic, cómo llega al código
de la función, y puede acabar filtrada en un log por error?

**Cloudflare Workers:**
- La clave se guarda con `npx wrangler secret put API_KEY` (o desde el dashboard, en
  Workers & Pages > Settings > Variables and Secrets), nunca en el código ni en `wrangler.toml`.
- En el código se lee como `env.API_KEY` dentro del handler `fetch(request, env, ctx)`.
- Cita textual de la documentación: *"Secrets are environment variables. The difference is secret
  values are not visible within Wrangler or Cloudflare dashboard after you define them."* — es
  decir, una vez guardado, ni siquiera Ismael puede volver a ver el valor en la consola; solo
  puede sobrescribirlo.
- En local, para desarrollo, la clave se guarda en un archivo `.dev.vars` (formato `dotenv`) que
  **nunca debe subirse al repo** (hay que añadirlo a `.gitignore` explícitamente).
- Fuente: [developers.cloudflare.com/workers/configuration/secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

**Vercel:**
- Las variables de entorno se gestionan en Project Settings, o por CLI con `vercel env add`.
- Desde mayo 2026 (según la documentación vigente), las variables de producción/preview se marcan
  por defecto como **`sensitive`**: una vez guardadas, "no pueden volver a verse en el dashboard
  ni con `vercel env ls`" — mismo principio de "solo escritura" que Cloudflare. Se puede optar por
  no marcarlas como sensibles con `--no-sensitive`, pero por defecto Vercel protege el valor.
- Para desarrollo local, `vercel env pull` (o, si se usa `vercel dev`, el comando recomendado es
  `vercel pull`) descarga las variables a un archivo `.env.local` — que igualmente hay que
  mantener fuera de git.
- Fuente: [vercel.com/docs/cli/env](https://vercel.com/docs/cli/env)

**Netlify:**
- Las variables de entorno se gestionan desde la UI, la CLI (`netlify env:set`) o la API; Netlify
  desaconseja explícitamente guardarlas en `netlify.toml` (que sí iría al repo).
- Existe una funcionalidad llamada **Secrets Controller** para marcar variables como
  "Contains secret values", con restricciones de acceso adicionales — aunque la documentación
  aclara que las variables del contexto **Local development no pueden marcarse como secretas**
  (sí las de Preview/Production).
- Los cambios quedan registrados en un log de auditoría del equipo.
- No pude confirmar contra documentación primaria el detalle exacto de si Netlify hace *scanning*
  automático de los logs de build/función para detectar una clave secreta filtrada accidentalmente
  en la salida — la página de resumen menciona "security features" sin especificar ese mecanismo
  punto por punto; lo señalo como pendiente de verificar en vez de darlo por hecho.
- Fuente: [docs.netlify.com/build/environment-variables/overview](https://docs.netlify.com/build/environment-variables/overview/)

**Conclusión de esta sección:** las tres plataformas resuelven el problema central igual de bien
— la clave nunca toca el repo público, se inyecta como variable de entorno en tiempo de ejecución,
y una vez guardada no se puede volver a leer desde la consola (solo sobrescribir). La diferencia
está en los nombres de los comandos, no en la seguridad de fondo.

---

## 4. Rate limiting y protección anti-abuso

Este es el punto que más le debería importar a Ismael: un chatbot público sin login, llamando a
una API de pago, es exactamente el escenario que puede generar una factura sorpresa si alguien
(a propósito o sin querer, con un script) lo machaca a peticiones.

### Qué ofrece cada plataforma de forma nativa

**Cloudflare (plan Free):**
- **Rate Limiting Rules:** 1 regla en el plan gratuito, con ventana de conteo de **10 segundos**
  y tiempo de mitigación de **10 segundos**, contando solo por IP, y limitado a los campos
  "Path" y "Verified Bot". Es poco flexible pero gratis y nativo — suficiente para un límite
  simple tipo "máximo N peticiones por IP cada 10 s" en el endpoint del chat.
  Fuente: [developers.cloudflare.com/waf/rate-limiting-rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- **Turnstile:** el "captcha" de Cloudflare, gratuito, que verifica que quien manda la petición es
  humano sin el clásico "elige todas las fotos con semáforos". Se integra con un widget en el
  navegador más una llamada de verificación (`siteverify`) desde el servidor (la propia función
  Worker) antes de aceptar la pregunta. No confirmé contra la documentación primaria los detalles
  exactos de esa llamada `siteverify` (la página general de Turnstile no los detalla) — lo marco
  como pendiente de mirar la referencia de API de Turnstile si se llega a implementar.
  Fuente: [developers.cloudflare.com/turnstile](https://developers.cloudflare.com/turnstile/)

**Vercel (plan Hobby):**
- **WAF Rate Limiting:** confirmado que Hobby incluye **1 regla por proyecto** y
  **1.000.000 de peticiones limitadas incluidas**, con ventana de conteo configurable entre
  10 segundos y 10 minutos, contando por IP o "JA4 Digest" (huella del cliente TLS). Se configura
  desde el dashboard (Firewall > Configure > New Rule), no en código.
  Fuente: [vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
- El resto del WAF (bloqueo por IP, reglas personalizadas, mitigación DDoS) es gratis en todos los
  planes.

**Netlify (plan Free/Starter):**
- **Rate limiting nativo, pero solo "básico" en el plan gratuito:** 2 reglas por proyecto,
  configuradas en código (en la función o en `netlify.toml` para redirects), y solo pueden
  filtrar por *path*, no por IP directamente en el plan gratuito (el filtrado por IP/CIDR,
  geolocalización o cabeceras HTTP es exclusivo del nivel **Enterprise con High-Performance
  Edge**). El ejemplo de código sí permite `aggregateBy: ["ip", "domain"]` dentro de la función,
  así que sí se puede contar por IP a nivel de código — la limitación de "Enterprise-only" es
  para las reglas gestionadas desde la UI del dashboard, no para las reglas en código.
  Fuente: [docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
- No tiene un captcha propio equivalente a Turnstile; la vía habitual es integrar un tercero
  (p. ej. Arcjet, que tiene una integración directa con Netlify) o el propio Turnstile de
  Cloudflare como servicio externo.

### Patrón recomendado (independiente de la plataforma elegida)

Ninguna protección nativa por sí sola es suficiente para "grifo abierto sobre la tarjeta" — se
recomienda combinar capas:

1. **Límite por IP en la función proxy** (nativo de la plataforma, ver arriba) — para frenar
   scripts simples y bucles accidentales.
2. **Turnstile u otro captcha invisible** antes de aceptar la primera pregunta de una sesión —
   para frenar bots automatizados que roten de IP.
3. **Tope de gasto en el lado de Anthropic** (esto no depende de la plataforma serverless en
   absoluto, es una protección en la cuenta de Anthropic): la Consola de Anthropic permite fijar
   límites de gasto por *workspace* (spend limits) para que, pase lo que pase en el proxy, el
   gasto mensual no pueda superar un tope fijado de antemano. Esta es, en la práctica, la última
   red de seguridad real — todo lo demás (rate limiting, captcha) reduce el *volumen* de abuso,
   pero solo el tope de gasto en Anthropic pone un techo absoluto en dólares. Lo detallo con la
   fuente primaria en la sección 5, tras confirmar los números de precio con el skill `/claude-api`.
4. Límite de longitud de conversación / turnos por sesión en el propio diseño del chatbot (esto no
   es una protección de plataforma, es un límite de producto: cuantos menos turnos y más corto el
   contexto, menor el coste máximo por conversación).

---

## 5. Verificación de precios y prompt caching de `claude-haiku-4-5`

Esta sección se hizo invocando el skill `/claude-api` (que mantiene una tabla de modelos y precios
cacheada y verificada) y complementando con `WebFetch` directo a la documentación oficial vigente
de Anthropic — las dos fuentes coinciden en cada cifra.

### Precio vigente

Confirmado contra `platform.claude.com/docs/en/about-claude/pricing.md` (tabla "Model pricing")
y contra `platform.claude.com/docs/en/about-claude/models/overview.md` (tabla comparativa de
modelos):

| Concepto | Precio |
|---|---|
| Entrada base (Base Input Tokens) | **$1 / MTok** |
| Salida (Output Tokens) | **$5 / MTok** |
| Escritura de caché, TTL 5 minutos | $1.25 / MTok |
| Escritura de caché, TTL 1 hora | $2 / MTok |
| Lectura de caché (cache hit) | $0.10 / MTok |

Esto coincide exactamente con lo que ya tenía anotado el mapa #15 ($1/$5 por MTok). Además:
ventana de contexto **200K tokens** (de sobra para un corpus de ~12K), salida máxima **64K
tokens** (el modelo con el tope más bajo de toda la familia Claude 4 actual, pero irrelevante aquí
— una respuesta de chat no se acerca a 64K tokens).

Fuentes: [platform.claude.com/docs/en/about-claude/pricing](https://platform.claude.com/docs/en/about-claude/pricing.md),
[platform.claude.com/docs/en/about-claude/models/overview](https://platform.claude.com/docs/en/about-claude/models/overview.md)

### Mecánica de prompt caching para este modelo concreto

- **Mínimo cacheable para `claude-haiku-4-5`: 4096 tokens.** Confirmado textualmente contra
  `platform.claude.com/docs/en/build-with-claude/prompt-caching.md`: *"4,096 tokens for Claude
  Haiku 4.5"*. Este es, de hecho, el mínimo más alto de toda la familia de modelos actual (los
  modelos Opus/Sonnet más nuevos bajan a 512-1024 tokens) — pero el corpus del portfolio, con
  ~12.000 tokens, lo supera cómodamente, así que no es un problema práctico aquí. Sí es relevante
  si en el futuro alguien decide cachear un fragmento más pequeño (por ejemplo, solo las
  instrucciones de comportamiento sin el corpus): por debajo de 4096 tokens, Haiku 4.5
  simplemente no cachea ese bloque — sin error, solo `cache_creation_input_tokens: 0` en la
  respuesta.
- **TTLs disponibles: 5 minutos (por defecto) o 1 hora (explícito).** Se activa con
  `"cache_control": {"type": "ephemeral"}` (5 min) o
  `"cache_control": {"type": "ephemeral", "ttl": "1h"}` (1 hora). No hay más opciones de TTL.
- **Multiplicador de escritura:** 1,25× el precio base de entrada para TTL de 5 minutos; 2× para
  TTL de 1 hora.
- **Multiplicador de lectura:** 0,1× el precio base de entrada, en ambos casos.

Fuente primaria para todo este bloque:
[platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md)

**Detalle importante que no estaba en el mapa:** el caché de prompts de Anthropic se indexa por
los bytes exactos del prefijo (system + tools), **no por sesión de usuario ni por visitante**. Si
dos visitantes distintos preguntan algo al chatbot dentro de la misma ventana de TTL, el segundo
lee del mismo caché que escribió el primero — el caché es compartido a nivel de cuenta/workspace,
no privado por conversación. Esto cambia la lectura de "cada visitante paga una escritura" a "se
paga una escritura cada vez que pasa más tiempo que el TTL sin que nadie llame al endpoint con ese
mismo prefijo".

### Validación de la estimación del mapa, paso a paso

Cifras del mapa a validar: ~0,017 $ la primera pregunta (escritura de caché), ~0,004 $ cada
pregunta siguiente, ~0,04 $ una conversación de 6 turnos, ~1 $ cada 25 conversaciones. Corpus
~12.000 tokens en el `system` (con `cache_control` al final del bloque). Asumo, porque el mapa no
lo fija explícitamente, una respuesta típica de Haiku de ~300-500 tokens de salida por turno y
una pregunta de visitante de ~50-150 tokens — son los tamaños razonables para un chat de
preguntas y respuestas sobre un portfolio; lo marco como supuesto, no como dato confirmado.

**Primera pregunta de un visitante** (el caché de ese prefijo de 12K tokens está frío —
expiró o nunca se escribió):

| Concepto | Cálculo | Coste |
|---|---|---|
| Escritura de caché del corpus (12.000 tokens, TTL 5 min, 1,25×) | 12.000 × $1,25 / 1.000.000 | 0,0150 $ |
| Pregunta del visitante (no cacheada, ~100 tokens de entrada) | 100 × $1 / 1.000.000 | 0,0001 $ |
| Respuesta de Haiku (~400 tokens de salida) | 400 × $5 / 1.000.000 | 0,0020 $ |
| **Total primera pregunta** | | **≈ 0,017 $** |

Esto **coincide con la cifra del mapa** (0,017 $) casi exactamente — el término dominante, con
diferencia, es la escritura del caché (0,015 $ de los 0,017 $ totales), así que el número es
sólido siempre que el corpus completo esté efectivamente en el bloque cacheado.

**Cada pregunta siguiente en la misma conversación** (el caché sigue caliente, dentro del TTL de
5 minutos, y se supone que cada turno añade también un breakpoint de caché al final para que la
conversación previa se lea barata en el siguiente turno):

| Concepto | Cálculo | Coste |
|---|---|---|
| Lectura de caché (12.000 corpus + ~500 de turno previo ≈ 12.500 tokens) | 12.500 × $0,10 / 1.000.000 | 0,0013 $ |
| Escritura de caché del turno nuevo (~100 tokens de la pregunta) | 100 × $1,25 / 1.000.000 | 0,0001 $ |
| Respuesta de Haiku (~400 tokens de salida) | 400 × $5 / 1.000.000 | 0,0020 $ |
| **Total por pregunta siguiente** | | **≈ 0,0034 $** |

El mapa dice ~0,004 $ — mi cálculo da ~0,0034 $, un poco por debajo pero **en el mismo orden de
magnitud y compatible con el margen de incertidumbre** de la longitud real de las respuestas (si
las respuestas son algo más largas, ~500-600 tokens en vez de 400, el total sube a ~0,004 $
exactos). No corrijo esta cifra — la doy por validada dentro del margen de una estimación.

**Conversación completa de 6 turnos:** primera pregunta (0,017 $) + 5 preguntas siguientes
(5 × ~0,0034-0,004 $ ≈ 0,017-0,02 $) = **≈ 0,034-0,037 $**, redondeando, coherente con el
"~0,04 $" del mapa. **Validado.**

**25 conversaciones completas:** aquí es donde entra el matiz del párrafo anterior sobre cómo se
comparte el caché. Si cada una de esas 25 conversaciones llega **espaciada más de 5 minutos** de
cualquier otra (el escenario típico de un portfolio con tráfico esporádico, que es exactamente lo
que se espera aquí), cada una paga su propia escritura de caché completa: 25 × ~0,037 $ ≈ **0,93 $
— redondea a "~1 $"**, tal y como dice el mapa. **Validado**, con la salvedad de que esa cifra
asume implícitamente tráfico disperso (visitantes que no se solapan dentro del TTL); si varios
recruiters abrieran el chat casi a la vez (por ejemplo, justo después de que Ismael comparta el
link en LinkedIn), compartirían la escritura de caché y el coste real de esas 25 conversaciones
bajaría por debajo de 1 $.

**Conclusión de la validación:** las cifras del mapa son correctas — no encontré ningún error que
corregir. El cálculo paso a paso las reproduce dentro de un margen razonable (la única cifra que
sale ligeramente distinta, "cada pregunta siguiente", depende de un supuesto no fijado —longitud
de la respuesta— y el propio mapa probablemente asumió un output algo más largo que mis 400
tokens de referencia).

### ¿Compensa el TTL de 1 hora dado el tráfico esporádico del portfolio?

Esta es la pregunta que el ticket pedía evaluar explícitamente, y la respuesta es: **depende del
patrón de tráfico, y con los datos actuales no está claro que compense — no lo activaría por
defecto.**

Con TTL de 5 minutos (el que usan los cálculos de arriba), el coste de escritura es 1,25× el
precio base. Con TTL de 1 hora, ese coste sube a 2× — un extra de aproximadamente
12.000 × ($2 − $1,25) / 1.000.000 = **0,009 $ por escritura**, comparado con la de 5 minutos.

Ese extra solo se recupera si, dentro de esa ventana de 1 hora ampliada, llega **al menos un
visitante adicional** que de otro modo habría forzado una escritura nueva bajo el TTL corto de 5
minutos (porque llegó más de 5 minutos después del anterior, pero menos de 60). Ese visitante
"rescatado" paga una lectura (~0,0012 $ para 12.500 tokens) en vez de una escritura completa
(~0,015-0,024 $) — un ahorro neto de ~0,014-0,022 $ por visitante rescatado, más que suficiente
para justificar el extra de 0,009 $ de la escritura ampliada, **si ese visitante existe**.

El problema es que, para un portfolio con tráfico verdaderamente esporádico (el escenario que el
propio mapa asume — "nadie va a hacer 100.000 peticiones/día a la web de Ismael"), es poco
probable que dos visitantes distintos lleguen dentro de la misma ventana de una hora la mayoría
de las veces. En ese caso, el TTL de 1 hora **solo añade coste** (el extra de escritura de 0,009 $
en cada conversación) **sin ahorrar nada**, porque no hay un segundo visitante que aproveche el
caché más largo.

Mi recomendación, con la información disponible (no verificada contra datos reales de tráfico del
sitio, que no existen todavía): **quedarse con el TTL por defecto de 5 minutos**, salvo que Ismael
anticipe ráfagas de tráfico concentradas (por ejemplo, justo después de compartir el link del
portfolio en LinkedIn o en una entrevista donde varias personas lo abren casi a la vez) — en ese
escenario específico, sí compensaría cambiar a 1 hora para esas ráfagas. Como el propio corpus no
cambia entre visitantes, una alternativa más simple que ajustar el TTL sería **pre-calentar el
caché** (`max_tokens: 0` con el breakpoint del corpus, ver la referencia de prompt caching) justo
después de compartir el link, si se quiere garantizar que la primera persona que abra el chat no
pague la escritura completa — pero esto añade complejidad operativa que probablemente no vale la
pena para el volumen de tráfico esperado.

---

## Resumen y recomendación

1. **Plataforma:** Cloudflare Workers, por el modelo de arranque en frío basado en isolates V8
   (sin el modelo contenedor-por-invocación de AWS Lambda que usan Vercel y Netlify por debajo),
   por encajar bien con un proxy ligero de solo reenvío de bytes, y porque Turnstile (su propio
   captcha, gratuito) resuelve la capa de anti-abuso sin salir del mismo proveedor. Vercel es la
   alternativa razonable si el frontend se reescribe algún día con un framework.
2. **Streaming y CORS:** las tres plataformas soportan streaming real de la respuesta de Anthropic
   con el patrón `ReadableStream`/`Response`, y CORS se resuelve con las cabeceras HTTP estándar
   (`Access-Control-Allow-Origin` fijado a `https://i-casaca.github.io`, no a `*`).
3. **Secretos:** las tres plataformas resuelven el problema igual de bien — la clave nunca toca el
   repo, se guarda como variable de entorno de solo escritura.
4. **Anti-abuso:** ninguna protección nativa sola basta; se recomienda combinar límite por IP +
   captcha (Turnstile) + un tope de gasto fijado en la propia cuenta de Anthropic, que es la
   última red de seguridad real en dólares.
5. **Precios y caching de `claude-haiku-4-5`:** confirmados contra documentación primaria
   ($1/$5 por MTok, mínimo cacheable de 4096 tokens para este modelo concreto, TTLs de 5 min/1 h
   con multiplicadores 1,25×/2× en escritura y 0,1× en lectura). **La estimación de coste del mapa
   #15 es correcta** — validada paso a paso, sin errores que corregir. El TTL de 1 hora no está
   claramente justificado para tráfico esporádico; el de 5 minutos (por defecto) es la opción más
   simple y probablemente suficiente.

**Lo que no pude verificar contra fuente primaria** (señalado explícitamente en el cuerpo del
documento en vez de rellenado): cifras exactas de arranque en frío en milisegundos para Vercel y
Netlify; el detalle exacto de la llamada `siteverify` de Turnstile; si Netlify escanea
automáticamente sus logs de build/función en busca de secretos filtrados; un ejemplo oficial que
combine streaming y CORS en la misma respuesta para Vercel o Netlify (sí existe para Cloudflare).



