---
label: wayfinder:map
status: open
---


# Mapa: Migración de prueba del portfolio (Framer -> MVP estático en GitHub Pages)

## Destino

Un MVP en HTML/CSS/JS plano (sin build ni frameworks), migrado de
[isma-casaca.framer.website](https://isma-casaca.framer.website/), publicado como repositorio
**público** de GitHub (`i-casaca/portfolio-test-migration`) y desplegado con **GitHub Pages** en
`i-casaca.github.io/portfolio-test-migration` — una prueba guiada paso a paso para que Ismael
(no experto en git/GitHub/código) entienda el flujo de publicación, no una arquitectura definitiva.

Estructura del sitio:
- **Home**: una sola página con scroll (hero de impacto estilo cartel de Mickey17 — tipografía
  grande/condensada, paleta amarillo/rojo/navy — + índice de proyectos al estilo Irene Labat +
  sección About), con parallax de scroll y un efecto sutil de "glow"/rastro del ratón sobre
  texto/fondo como hilo de interacción en todo el sitio.
- **Páginas de proyecto** (una por proyecto, estilo sobrio/editorial tipo Diego Gómez/Irene Labat
  para legibilidad): Manu Cardiel y El Paraguas abiertos; Adrenaline, Arabvision y Nexahub tras un
  **muro de contraseña "blando"** (blur + password, cortesía visual, no seguridad real).
- Los 5 proyectos actuales de "Works" se migran con detalle completo (Context/Ejecución/Resultado).
- La sección "Out of Scope" de la web actual **no** se migra en este MVP (ver Fuera de alcance).

## Notas

- Dominio: diseño y desarrollo frontend para un portfolio personal. Skills a consultar según el
  ticket: `/impeccable` para trabajo de UI, `/prototype` para preguntas de diseño/interacción,
  `/grilling` y `/domain-modeling` por defecto.
- Ismael no es experto en código ni en GitHub — cada ticket debe explicarse paso a paso, priorizando
  que entienda el flujo sobre dejar el resultado "perfecto".
- **Override de "Plan, don't do":** este mapa SÍ lleva ejecución dentro de sí mismo. En cuanto un
  ticket de diseño/comportamiento se resuelve, se construye esa pieza con Ismael en la misma sesión
  o en una siguiente, en vez de dejar solo una decisión en papel — es un experimento hands-on, no un
  hand-off a otro desarrollador.
- Repo objetivo: `i-casaca/portfolio-test-migration` (repo de proyecto normal, no el repo raíz
  `i-casaca.github.io`). `gh` CLI instalado y autenticado como `i-casaca` (login vía navegador,
  sin gestionar contraseñas ni tokens directamente).
- **Este tracker vive ahora en GitHub Issues** de `i-casaca/portfolio-test-migration` (migrado
  desde markdown local). Este archivo se conserva como snapshot histórico de la carta inicial;
  la fuente de verdad es el issue #1 y sus hijos.
- Convención de ramas: `main` = publicado (fuente de Pages); una rama por ticket
  (`ticket-N-slug`), fusionada por Pull Request al resolver ese ticket.

## Tickets

- [ ] #2 Extraer contenido y assets completos de los 4 proyectos restantes (research)
- [ ] #3 Conseguir el archivo del CV (task)
- [x] #4 Crear el repo GitHub y desplegar una página de prueba con Pages (task)
- [x] #5 Definir el sistema visual: hero Mickey17 + páginas de proyecto sobrias (prototype)
- [ ] #6 Definir el efecto de parallax y el rastro sutil del ratón (prototype)
- [ ] #7 Definir el mecanismo del muro de contraseña (grilling)
- [ ] #8 Construir y desplegar el MVP completo del portfolio (task, bloqueado por #2-#7)

## Decisiones hasta ahora

- [Crear el repo GitHub y desplegar una página de prueba con Pages](https://github.com/i-casaca/portfolio-test-migration/issues/4) — repo público creado, Pages activo en `main`/`/`, verificado en navegador; tracker migrado a GitHub Issues; convención de ramas acordada (`main` + rama por ticket + PR).
- [Definir el sistema visual: hero Mickey17 + páginas de proyecto sobrias](https://github.com/i-casaca/portfolio-test-migration/issues/5) — el hero "cartel de cine" (Mickey17) se descartó por "demasiado brutal"; dirección final: estructura de filas alternadas fiel a natefussner.com (crema + menta, Fraunces/Inter), fusionada a `main` vía PR #9.

## Not yet specified

- Detalles finos de tipografía/paleta exacta del hero Mickey17 (qué fuente concreta, hex codes) —
  se resolverán en el prototipo visual.
- Detalles de comportamiento del efecto parallax/mouse-glow (intensidad, en qué elementos, si
  distorsiona letras o solo el fondo) — se resolverán en el prototipo de interacción.
- Detalle exacto del "recordar desbloqueo" del muro de contraseña (localStorage vs solo sesión,
  contraseña única para los 3 proyectos vs por proyecto) — se resolverá en la ticket de muro.
- Si más adelante se quiere dominio propio, analítica, o migrar "Out of Scope" — todavía no
  decidido, revisar tras validar el MVP.

## Fuera de alcance

- Sección "Out of Scope" (8 proyectos personales: fotografía, 3D, ilustración) — se deja fuera de
  este MVP de prueba; puede migrarse en un esfuerzo futuro si el experimento resulta útil.
- Seguridad real en el muro de contraseña (autenticación de servidor, cifrado) — decidido
  explícitamente como muro "blando" (cortesía visual), no como control de acceso real.
- Repo privado de GitHub / GitHub Pro de pago — descartado a favor de repo público, dado que es
  una prueba y no justifica el coste.

