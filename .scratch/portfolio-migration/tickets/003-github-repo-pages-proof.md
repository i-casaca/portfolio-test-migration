---
id: 3
title: "Crear el repo GitHub y desplegar una página de prueba con Pages"
type: wayfinder:task
status: open
assignee: claude-session
blocked_by: []
---

## Question

Antes de construir el sitio real, queremos validar de punta a punta el flujo de publicación que
Ismael quiere aprender: crear el repositorio público `i-casaca/portfolio-test-migration` en
github.com, inicializarlo con git localmente, subir un `index.html` mínimo ("hola mundo"),
activar GitHub Pages, y confirmar que carga en
`https://i-casaca.github.io/portfolio-test-migration/`.

**Ampliado a petición de Ismael:** además del repo + Pages, montar también:
- El tracker de este mapa migrado a GitHub Issues (en vez de markdown local) — el mapa como issue
  con label `wayfinder:map`, cada ticket como issue hijo con su label `wayfinder:<tipo>`.
- Una convención simple de branches: `main` = lo publicado (fuente de Pages); una rama por ticket
  (ej. `ticket-4-visual-system`), fusionada por Pull Request al resolver ese ticket. Enseña el
  flujo estándar de GitHub sin complicarlo (sin CI, sin checks obligatorios).

¿Cómo guiamos ese primer despliegue paso a paso (dado que no hay `gh` CLI instalado en esta
máquina), y queda confirmado que el flujo funciona?
