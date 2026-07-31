/* ===========================================================================
   chat-corpus-tags.js — el único trozo del corpus escrito a mano.

   Decidido en el ticket #20: el contenido sale del sitio leído en vivo, pero
   hay una cosa que la estructura del HTML no puede decir — de qué habla en
   concreto cada fragmento. Eso va aquí.

   El ticket #21 eliminó el campo `perfil` (se recortaron los perfiles de
   visitante del MVP), así que solo queda `tema`.

   Para qué sirve `tema`:
     1. Empuja la recuperación léxica cuando la pregunta usa palabras que no
        están literalmente en el texto ("i18n" no aparece en Arabvision, pero
        el fragmento va de eso).
     2. Alimenta la lista de "puedes preguntarme sobre X, Y, Z" cuando ninguna
        respuesta pasa el umbral (ticket #16).

   La clave es `<página>#<ancla>/<orden dentro del ancla>`, que es lo que
   genera el extractor. Si un fragmento no aparece aquí, sigue siendo
   buscable — simplemente no tiene empuje temático.
   =========================================================================== */

window.CHAT_CORPUS_TAGS = {
  /* ---------- home ---------- */
  'index.html#sobre-mi/0': 'nombre, presentación, product designer',
  'index.html#sobre-mi/1': 'Madrid, origen, arquitectura, café, empatía, por qué diseño',
  'index.html#sobre-mi/2': 'enfoque, ambición, tecnología, Smart TV, realidad virtual, tipos de plataforma',
  'index.html#sobre-mi/3': 'viajes, fotografía, aficiones, vida personal, 20 países',

  'index.html#experiencia/0': 'trabajo actual, Telefónica, design systems',
  'index.html#experiencia/1': 'EPAM, consultora, product designer',
  'index.html#experiencia/2': 'arquitectura, estudio, etapa anterior al diseño',
  'index.html#experiencia/3': 'freelance, modelado 3D',
  'index.html#experiencia/4': 'primer trabajo, ingeniería, arquitecto junior',

  'index.html#formacion/0': 'McKinsey, formación en liderazgo y negocio',
  'index.html#formacion/1': 'design systems, Figma',
  'index.html#formacion/2': 'behavioral design, psicología del comportamiento',
  'index.html#formacion/3': 'inteligencia artificial generativa aplicada a UX',
  'index.html#formacion/4': 'bootcamp, cómo entré en UX, reconversión',
  'index.html#formacion/5': 'carrera universitaria, arquitectura, UPM',

  /* ---------- páginas de proyecto ---------- */
  'arabvision.html#ficha/0': 'streaming OTT, cliente, 2023, UX designer',
  'arabvision.html#contexto/0': 'streaming bajo demanda, mercado árabe, RTL, accesibilidad',
  'arabvision.html#ejecucion/0': 'research cultural, i18n, RTL, entrevistas, trabajo con equipo de marca',
  'arabvision.html#resultado/0': 'proyecto detenido, conflicto, qué salió mal, adaptabilidad de la interfaz',

  'adrenaline.html#ficha/0': 'app deportiva, whitelabel, cliente, 2023, UX designer',
  'adrenaline.html#contexto/0': 'eventos deportivos, backend flexible, proveedores externos, MVP',
  'adrenaline.html#ejecucion/0': 'estadísticas, TV en vivo, VOD, diseño de interfaz deportiva',
  'adrenaline.html#resultado/0': 'resultado, aprendizajes, clientes premium',

  'nexahub.html#ficha/0': 'CMS, herramienta interna, cliente, 2022, UI designer',
  'nexahub.html#contexto/0': 'JIRA, gestión de incidencias, QA, eficiencia interna',
  'nexahub.html#ejecucion/0': 'diseño de CMS, flujo de tickets, herramienta para QA',
  'nexahub.html#resultado/0': 'adopción, herramienta global, resultado',

  'el-paraguas.html#ficha/0': 'app de viajes, bootcamp, proyecto final, 2021, UX designer',
  'el-paraguas.html#contexto/0': 'pandemia, COVID, free tours, turismo, aglomeraciones',
  'el-paraguas.html#ejecucion/0': 'proceso de bootcamp, investigación de usuarios, diseño de app de viajes',
  'el-paraguas.html#resultado/0': 'resultado del proyecto final, aprendizajes del bootcamp',

  'manu-cardiel.html#ficha/0': 'web de artista, proyecto personal, 2024, web designer',
  'manu-cardiel.html#contexto/0': 'Kit Digital, coste de mantenimiento, arte urbano, identidad de artista',
  'manu-cardiel.html#ejecucion/0': 'rediseño web, CMS para el cliente, autonomía del artista',
  'manu-cardiel.html#resultado/0': 'resultado, web publicada, gestión del contenido'
};
