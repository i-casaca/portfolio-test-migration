# Portfolio test migration

Prueba de migración del portfolio de Ismael Casado ("Isma Casaca"), de
[Framer](https://isma-casaca.framer.website/) a un sitio estático hecho a mano — sin build,
sin framework, solo HTML/CSS/JS — publicado con GitHub Pages.

**Sitio en vivo:** https://i-casaca.github.io/portfolio-test-migration/

Es un experimento para aprender el flujo de publicación en GitHub (repositorio, issues, ramas,
Pull Requests, Pages) partiendo de cero, no una arquitectura definitiva.

## Estructura

```
index.html              Home: hero interactivo + índice de los 5 proyectos
adrenaline.html          Página de proyecto — bajo muro de contraseña (cliente/NDA)
arabvision.html          Página de proyecto — bajo muro de contraseña (cliente/NDA)
nexahub.html             Página de proyecto — bajo muro de contraseña (cliente/NDA)
manu-cardiel.html        Página de proyecto — abierta
el-paraguas.html         Página de proyecto — abierta
assets/images/<slug>/    Imágenes reales de cada proyecto (portada + mockups)
assets/cv/               CV descargable (español)
.scratch/portfolio-migration/   Snapshot histórico del plan de trabajo (ver más abajo)
```

Cada página es un archivo HTML autocontenido (estilos y scripts inline) — no hay paso de build,
así que cualquier cambio en el código se ve reflejado tal cual al servir los archivos.

## Muro de contraseña

Adrenaline, Arabvision y Nexahub son proyectos de cliente y llevan un muro de cortesía (blur +
contraseña) delante del contenido. **No es seguridad real**: la comparación se hace en el propio
navegador (hash SHA-256, ver el `<script>` de cualquiera de esas páginas), así que alguien con
conocimientos técnicos podría saltárselo. Sirve para no mostrar el contenido a quien navegue la
web por curiosidad, no para protegerlo de alguien decidido. La contraseña se comparte directamente
(por LinkedIn/email), no hay formulario de solicitud.

## Cómo verlo en local

No requiere instalar nada aparte de un servidor estático cualquiera, por ejemplo:

```bash
python3 -m http.server 8000
```

y abrir `http://localhost:8000/`.

## Seguimiento del trabajo

El plan de trabajo se gestiona como [GitHub Issues](https://github.com/i-casaca/portfolio-test-migration/issues)
de este mismo repositorio, siguiendo la metodología [Wayfinder](https://github.com/anthropics/claude-code):
el issue [#1](https://github.com/i-casaca/portfolio-test-migration/issues/1) es el mapa (destino,
decisiones tomadas, alcance), y cada ticket hijo lleva una etiqueta `wayfinder:research` /
`wayfinder:prototype` / `wayfinder:grilling` / `wayfinder:task`. Convención de ramas: `main` es lo
publicado; una rama por ticket, fusionada por Pull Request al resolverlo.
