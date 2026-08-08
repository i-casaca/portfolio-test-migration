# Product

Contexto estratégico del sitio. Responde a quién, qué y por qué; el cómo se ve está en
[DESIGN.md](DESIGN.md). Lo escribió `/impeccable init` a partir de una entrevista con Ismael, y
cualquier pasada de diseño posterior lo lee antes de tocar nada.

> Los títulos de sección van en inglés y el contenido en español. No es un descuido: son el esquema
> que la herramienta lee para saber en qué registro y plataforma está. Traducirlos la devuelve al
> modo degradado que este archivo existe para evitar.

## Register

brand

## Platform

web

## Users

Otros diseñadores y desarrolladores. Llegan por el proceso, no por el resultado: quieren ver cómo
se piensa, cómo se documenta y por qué se descartó lo que se descartó. Leen despacio y rascan —
abren el repositorio, entran en los issues, miran el código fuente. Es una audiencia que detecta el
relleno de inmediato, y que premia que le enseñes las costuras.

El trabajo que buscan las conversaciones que nacen aquí es un rol de lead o manager ligado a
sistemas de diseño, con capacidad real de decisión. El sitio no le habla a un comité de selección;
le habla a un par que pueda acabar recomendándote a uno.

## Product Purpose

Es el portfolio de Ismael Casado, Product Designer, reconstruido a mano en HTML, CSS y JavaScript
planos. Existe para demostrar en el propio artefacto lo que afirma sobre su autor: que diseña
sistemas y entiende lo que hay debajo de ellos. La web es a la vez el argumento y la prueba.

Hay éxito cuando alguien de la audiencia llega, reconoce que esto no salió de una plantilla, y
escribe.

## Positioning

Diseño sistemas y sé lo que hay debajo. No es un diseñador que "también toca algo de código": es
alguien que entiende la construcción completa —de la decisión al despliegue— y por eso sus sistemas
aguantan cuando alguien los implementa.

## Conversion & proof

- **CTA primaria**: escribir a Ismael, por LinkedIn o por email.
- **CTA secundaria**: descargar el CV, para quien todavía no está listo para una conversación.
- **La línea que se recuerda a los 10 segundos**: *"Diseño sistemas, y sé cómo se construyen."*
- **Escalera de creencias**, en orden: sabe de sistemas → documenta y decide → no solo ejecuta →
  merece una conversación.
- **Prueba disponible hoy**: los issues cerrados del repositorio, cada uno con su decisión y su
  porqué, incluidos los caminos descartados; los documentos de `research/`, con fuentes.
- **Prueba por incorporar**: recomendaciones de LinkedIn; los artículos de Medium; proyectos
  todavía no traídos al portfolio, y una reescritura de los existentes que los oriente a contar el
  proceso de sistemas de diseño en vez del resultado.

## Brand Personality

Meticuloso, curioso, cercano. La meticulosidad se ve en el detalle ejecutado, no se anuncia. La
curiosidad es la razón por la que este sitio existe: se construyó a mano para entender qué pasa por
debajo. La cercanía es de tono, no de informalidad — se explica sin condescender y admite lo que no
sabe.

La voz habla en primera persona y declara sus límites cuando los tiene: el chat dice que no lleva un
modelo de IA detrás, el muro de contraseña dice que no es seguridad real. Esa honestidad es carácter
de marca, no una nota al pie.

Lo que debe sentir alguien en los primeros diez segundos: *este sabe de sistemas*.

## Anti-references

- **El portfolio de plantilla.** El molde de Framer o Webflow: hero centrado, rejilla de tarjetas
  idénticas, secciones intercambiables entre un portfolio y otro. Es la anti-referencia principal, y
  pesa el doble porque este sitio nace de migrar justamente eso.
- **La revista editorial.** Serif display en itálica, capitulares, rejilla de periódico, mucho
  blanco y ninguna imagen. Fue una salida digna hace unos años; hoy es tan reconocible como
  automática.

## Design Principles

1. **Declarar el límite.** Nada finge ser más de lo que es. Cuando una pieza no puede hacer algo, lo
   dice — y esa franqueza acaba siendo su carácter, no su disculpa.
2. **El sistema antes que la pantalla.** Cada decisión visual se toma una vez, se nombra y se
   reutiliza. Si algo solo sirve para una página, es sospechoso.
3. **Escribir la decisión, no solo el resultado.** El porqué vive en el repositorio, y los caminos
   descartados cuentan tanto como los elegidos. Es la prueba que convence a esta audiencia.
4. **Legible antes que impactante.** El impacto que cuesta una lectura no se paga. Ante la duda
   entre gritar y dejarse leer, se deja leer.
5. **Enseñar las costuras.** El visitante puede mirar debajo: código fuente comprensible, issues
   abiertos, investigación con fuentes. La transparencia es parte del producto.

## Accessibility & Inclusion

Compromiso de nivel AA en tres frentes concretos y auditables:

- Contraste de texto ≥ 4.5:1 en todo el sitio (≥ 3:1 en texto grande).
- Foco visible en todo lo que se pueda navegar con teclado.
- `prefers-reduced-motion` respetado siempre, con una alternativa real —no la ausencia de la
  animación, sino su versión quieta.

Además, el sitio debe ser legible sin JavaScript: el contenido nunca depende de que una animación
llegue a ejecutarse.

Quedan fuera de este compromiso, y anotados como pendientes en el README, la revisión con lector de
pantalla del chat y el orden de tabulación completo.
