# Metodología — borrador para la sección nueva de index.html

Prosa pulida a partir de `respuestas-brutas.md`, conservando la voz, no reescrita a lenguaje
corporativo. Se ensambla en el sitio cuando el bloque 1 esté completo (6 preguntas) — de momento
es material de trabajo, no está publicado.

## Primer paso en un proyecto nuevo

Lo primero que hago al llegar a un proyecto nuevo es entender la situación real del equipo: cómo
está de adopción, qué problemas arrastran, qué pide realmente Design Ops. Me interesa la
metodología que ya usa el equipo — no para imponer la mía encima, sino para adaptarme a lo que ese
equipo concreto necesita.

Eso también define cómo entiendo un sistema de diseño: no es hacer los componentes más puros o
mejor implementados en Storybook. Es que esos componentes resuelvan lo que ese equipo necesita de
verdad, día a día.

En la práctica, mi primera semana es sobre todo mapear: quién es quién, qué hace cada uno, a quién
acudir para cada cosa. Para cuando toca ejecutar, ya sé cómo hacerlo.

## Qué herramientas uso, y cómo elijo

No me cierro dentro de un framework fijo. Conozco Design Thinking, uso shadowing, sigo buenas
prácticas — pero no las trato como un procedimiento que hay que seguir al pie de la letra. Sigo
normas básicas y sentido común, y dejo sitio a la improvisación de cada situación concreta.

Qué herramienta uso depende de la persona, de la situación, de lo que quiero investigar en ese
momento: no es lo mismo tomar notas textuales que montar un workshop o una sesión colaborativa.
Tengo muchas a mano y decido sobre la marcha cuál pide el momento.

No aplico siempre el mismo proceso — para mí, la metodología de hacer metodologías es precisamente
que no sea siempre la misma. Lo que sí se estandariza es entender cómo afecta cada decisión a cada
persona involucrada.

## Cuándo dejo de iterar

Hay parte de esto que se siente y no se explica del todo, pero también hay mínimos claros: cuando
el diseño cumple lo que pide la user story, y se ha debatido lo suficiente como para que las
personas necesarias lo hayan aceptado, ahí dejo de iterar y empiezo a construir.

Ese momento es también cuando entra el sistema de diseño de verdad — componentización,
documentación — porque la conceptualización ya está clara y acordada entre varias personas. Y, por
supuesto, las fechas del sprint también pesan en cuándo hay que cerrarlo.

## Cuando el cliente pide algo que va contra la usabilidad

Me ha pasado: un cliente pedía algo que iba contra la usabilidad del producto. En esos casos negocio
buscando la forma de dar lo que el cliente necesita de verdad, pero acercándolo lo más posible a una
interacción normal — planteo alternativas y explico las consecuencias de cada camino.

Con eso dicho, soy realista: en una cadena de producto donde el cliente tiene algo que decir, a
veces las exigencias de negocio ganan y acabas en soluciones menos usables — incluso rozando dark
patterns, que son algo que intento evitar siempre. Cuando toca pasar por ahí, no queda otra. Lo que
hago es ser diplomático, seguir planteando alternativas y buscar el punto medio.

## Cómo trabajo con desarrollo

Trabajo con desarrollo dentro del mismo flujo, no como una entrega que les llega después. Adecúo el
diseño a las exigencias reales del framework con el que va a construirse — sus mínimos técnicos, sus
límites de interacción — desde el principio, no al final.

Cuando lo hago así, lo que entrego conecta directamente con lo que desarrollo publica en su
Storybook, y eso se nota en el sprint: menos idas y vueltas, menos producción de más, mejor time to
market. Meter a desarrollo tarde en la cadena no ahorra tiempo — lo cuesta. Evitar esa fricción es
justo lo que hace que no se pierda tiempo.

## Cómo mido si un diseño funcionó después de publicarse

Las métricas salen de las librerías de Figma conectadas a los componentes que desarrollo publica —
esa vinculación es la que me deja ver adopción real, no solo intención de diseño.

Miro: adopción del sistema de diseño (componentes publicados en el front frente a los que hay en la
librería), si se completan los sprints, deuda técnica, porcentaje de tareas completadas, y cuánto
bajan los bugs de un sprint a otro. Todo eso se traduce en algo que negocio entiende: reducción de
costes y productividad.
