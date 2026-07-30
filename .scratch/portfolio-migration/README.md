# Tracker local (markdown)

No hay tracker externo configurado (proyecto sin repo Git todavía), así que este esfuerzo usa un
tracker local en markdown, siguiendo la convención genérica de Wayfinder:

- `map.md` — el mapa: destino, notas, decisiones tomadas, niebla (lo que aún no está lo bastante
  definido para ser un ticket) y lo que queda fuera de alcance.
- `tickets/NNN-slug.md` — un archivo por ticket (issue hijo del mapa). Frontmatter:
  - `id`: número de ticket
  - `title`: título corto
  - `type`: uno de `research`, `prototype`, `grilling`, `task`
  - `status`: `open` | `closed`
  - `assignee`: quién lo ha reclamado (vacío = sin reclamar)
  - `blocked_by`: lista de ids de tickets que deben cerrarse antes de poder trabajar este

Un ticket está **desbloqueado** cuando todos los tickets en `blocked_by` están `closed`. La
**frontera** son los tickets abiertos, desbloqueados y sin reclamar — lo que se puede coger ahora.

Al cerrar un ticket, se añade un comentario de resolución al final de su archivo (bajo `## Resolución`)
y se apunta un resumen de una línea en `map.md` → Decisiones hasta ahora.
