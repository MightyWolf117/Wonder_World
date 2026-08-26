Alpha Tactical Core:

Aquí se ejecutan las distintas acciones, habilidades, objetos y combos. Todo en busca de obtener la mayor cantidad de notas musicales en la cadena táctica y EXP con el tiempo disponible.

Las notas musicales se ponen en dos lugares: 


Matriz de línea rítmica:
Es la melodía completa, incluyendo el uso de la habilidad “Guardian”. Se usa para activar combos.
Cadena táctica:
Son las verdaderas notas musicales que se han ejecutado. Esta cadena determina:
Ticks de cooldown disminuidos en el menú de ego.
Notas a ejecutar en el astrolabio

Las “estadísticas en general” se refieren a las siguientes:
Energía: Normalmente disminuye al ejecutar cazas. Recupero 4 al “pasar el día”.
Estrés: Normalmente aumenta al ejecutar cazas. Recupero 1 al “pasar el día”.
EGO: Se gasta al usar habilidades y combos.
Mood: Normalmente aumenta al ejecutar saltos entre mundos (altera el efecto completo de salto entre mundos cuando no está al máximo). Se usa como moneda de cambio para distintas cosas en otros menús. Normalmente no disminuye solo a menos que pase algún evento muy malo.
Ticks (tiempo): El determinante de todo. Ejecutar cualquier acción cuesta ticks. Cada hora que tenga libre al día, desde el momento que abro el menú táctico, otorga 4 ticks, y el total final se redondea hacia el múltiplo de 5 más cercano. Distintos efectos de menús u objetos pueden aumentarlo o disminuirlo.
EXP: Necesaria para añadir “C” en la zona de caza. Cada EXP se convierte en 1 “C”, redondeando hacia arriba (Ej. 7.5 exp = 8 “C”)
Monedas: Normalmente obtenidas por el combo “SS”, van directamente a la “Tienda de la manada” para ser gastadas allí.
Eventos: Normalmente obtenidos por ejecutar un combo que no tendrá efecto (Ej. hacer “CC” [combo que activa frenesí] cuando frenesí ya está activo). Van directamente a la “Tienda de la manada” para ser gastados allí.
Rompe límites: Raramente obtenidos, me permiten cambiar estadísticas a mi favor en la “Modificación directa de la matriz” (zona inferior del menú táctico, donde puedo editar todo manualmente). No van a la “tienda de la manada”.
Instinto: Por ahora, solo hay 4 instintos que tienen un efecto automático: frenesí, juguetón y animado. “Calmado” es el instinto por defecto que no hace nada. Si, en cualquier momento, me invento otro instinto y su efecto, lo tengo que modificar manualmente, sería bueno poder configurar más instintos. Ahora te detallo los efectos de los instintos ya programados. Los instintos no se quitan al utilizar su efecto, solo se quitan al cambiar a otro instinto, o manualmente:
Frenesí: +1 EXP en la siguiente “Caza” (1 vez al día).
Juguetón: +1 “S” en la cadena táctica en el siguiente “Salto entre mundos” (1 vez al día)
Animado: 1 EXP en la siguiente “Caza” o +1 “S” en la cadena táctica en el siguiente “Salto entre mundos” (Sólo se puede activar 1 vez al día. Si se activa uno de los efectos, el otro también se bloquea hasta el día siguiente).
Objetos: Comprados en la “Tienda de la manada”, se deben forjar manualmente para añadir su nombre, descripción y efecto.
Condiciones: Comprado como coste, o por alguna enfermedad real. Te detallo los dos tipos de condiciones:
Curable: Con al menos 1 condición curable, se activa la posibilidad de ejecutar la acción “Ir a la enfermería” (E). Tienen cierta cantidad de HP. Cuando se le acabe el “HP” o se cumpla una condición especificada en su descripción, desaparece.
Incurable: No activa la posibilidad de ejecutar la acción “Ir a la enfermería” (E). Solo se pueden curar si se cumple la condición especificada en su descripción.
Triaje: Modifica la ganancia de EXP. Hay 3 triajes que, normalmente, se determinan por la siguiente fórmula interna: Estrés - (Energía + Mood) = Inestabilidad.
Verde: Inestabilidad es menor que “-6”. Sin efectos.
Amarillo: Inestabilidad es “-6”, “-5”, “-4” o “-3”. Ejecutar “Cazas” solo otorga 0.5 EXP.
Rojo: Inestabilidad es mayor que “-3”. Ejecutar “Cazas” otorga EXP normal, pero cada “Caza” ejecutada añade 1 condición curable de 1 hp aleatoria. Cambia el menú de EGO a “Rojo”.


Zona de caza


Aquí se añaden las “S” obtenidas en el Astrolabio (Afilar garras/Dejar huellas) o las “C” por la EXP (Cada EXP se convierte en 1 “C”, redondeando hacia arriba (Ej. 7.5 exp = 8 “C”)). Existen 2 tipos de jefes que pueden ser añadidos:

Jefe domable: Tiene una Restricción que se mantiene activa mientras no se “Termine”. Una vez se termina, puede seguir siendo atacado para dominarlo y ganar 1 moneda. Si no se termina antes de que acabe su tiempo límite, se aplica el castigo al menú táctico.
Jefe indomable: Tiene una restricción que se mantiene activa mientras no se “Termine”. Una vez se termina, puede seguir siendo atacado para añadir ataques Endless, los ataques Endless no otorgan nada. Si no se termina antes de que acabe su tiempo límite, se aplica el castigo al menú táctico. No puede ser atacado con “S”.


Guarida lunar alfa (Astrolabio)

Aquí se añaden las notas de la cadena táctica que no sean “C” ni “E”, y se usan como moneda de cambio para utilizar acciones de ocio. Cuando la limpieza llega a 0, se bloquean las acciones I, III, IV, VII, VIII, X y XI. Cuando la limpieza está al máximo, el siguiente día obtienes una “O” gratis en el Astrolabio. “Pasar el día” disminuye 1 limpieza.
 Te detallo las acciones que tienen efecto en los menús:
V - Olfatearse: Añade +1 limpieza.
VII - Afilar las garras: Añade +1 S en la Zona de Caza.
IX - Lamerse las heridas: Añade +2 limpieza.
X - Dejar huellas: Añade +2 S en la Zona de Caza.


Alpha EGO tactical core

Tiene distintos efectos sobre los demás menús. Cada EGO tiene un cooldown de ticks que disminuye al ingresar la cadena táctica en la cámara de combustión. Cada EGO tiene un modo estable y un modo corroído, con sus propios efectos y costes. El estado del menú (Estable o Corroído) depende del Triaje del menú táctico. Los EGOs en cooldown pasan a su estado Corroído, y pueden ser usados en cualquier momento a menos que algo lo impida explícitamente.


Tienda de la manada

Se gastan las monedas, monedas irrompibles y eventos positivos asegurados. Las monedas, monedas irrompibles y eventos positivos asegurados se mantienen al “pasar el día”, pero los “Golpes de suerte”, no. Existen 3 tiendas principales:
Tiendas rotativas: Cada vez que “pasar el día” se pulse, 3 de 12 tiendas son elegidas al azar para mostrarse. Cada tienda tiene su propio coste, y solo tienen 3 de stock (solo se puede comprar allí 3 veces al día). Comprar con monedas da un 50% de probabilidad de obtener un Golpe de Suerte para esa tienda, que puede ser usado en los efectos de los integrantes de esa tienda. 
Tienda del batallón: Tienda básica. Tiene 4 vendedores con su propio coste y efecto, pero no hay golpes de suerte.
Tienda secreta: Con un 10% de probabilidad de aparecer cada vez que “pasas el día”. Es igual que la tienda del batallón, pero con costes y efectos cambiados.


La vida diaria del lobo

Mis tareas diarias, que pueden ser marcadas como “diariamente”, “cada X días”, “solo los siguientes días de la semana” o “la fecha específica X de cada mes”, donde X es un número ingresado manualmente.
Cada día que no tenga una tarea “fallida”, obtengo +1 moneda para la tienda. 
Fallar una tarea la coloca en riesgo de reincidencia, si la fallo mientras se encuentra allí, otorga debuffs de estadísticas para el menú táctico. Cada tarea tiene su propio debuff.
Las tareas no-diarias pueden ser ejecutadas fuera de horario, lo que otorga un escudo contra el riesgo de reincidencia, es decir, cuando se marque como Fallida, se cambia automáticamente a Saltada (Saltada y Cumplida tienen el mismo efecto). 












Objeto, los pasos en orden son:

En la Tienda de la manada [Tienda del batallón], gasto 1 moneda para comprar 1 Objeto.
Me imagino un objeto, su nombre, descripción, coste y efectos en mi mente.
Abro la "Forja de objetos" (Menú táctico). Le añado el nombre y la descripción que pensé
Si edita (aumenta o disminuye) estadísticas básicas (Ticks, Energía, EGO, Mood o Estrés), pongo ese número en donde corresponde (Ver imagen adjunta)
Además, le doy una "Categoría", que solo es para que se ordene en un grupo de objetos de la misma categoría (Categorías creadas manualmente en el Menú Táctico)
Efecto de Triage es por si cambia el triage. Puede cambiarlo a Verde, Amarillo o Rojo durante X turnos o durante todo el día, depende del objeto
Además, puede tener otros efectos que afecten a otros menús, como añadir monedas (Tienda de la manada), reducir Cooldowns (Menú de EGO), añadir condiciones (Menú táctico, manualmente), Añadir EXP (Zona de Caza) o añadir notas a la melodía (Guarida lunar)
Una vez el objeto está creado, aparece aquí, a espera de ser usado:
Si el cambio fue automático (Srta. Gemini hizo el código para que pueda ser automático: Ticks, Energía, EGO, Mood, Estrés y Triage). Solo lo uso y no hago nada más
Si el cambio es manual (En otros menús o ninguna de las estadísticas mencionadas arriba [Ej. añadir una condición], tengo que hacerlo manualmente desde el Menú de Edición del menú correspondiente

Evento de la vida real

Al igual que los objetos, pueden modificar cualquier estadística o característica existente en los menús, solo que no pasan por la Forja de objetos ni son considerados un objeto dentro del Menú Táctico
Su efecto es inmediato.

Con cualquier estadística (Tanto para objeto como para un evento de la vida real) me refiero a:

Menú táctico
Energía
Estrés
EGO
Mood
Ticks
Bloquear alguna acción
Eliminar o añadir objetos

Zona de caza
EXP

Tienda de la manada
Monedas
Eventos positivos asegurados
Monedas irrompibles

Guarida lunar alfa
Añadir o quitar notas de la melodía
Aumentar o disminuir limpieza

Menú de EGO
Disminuir Cooldown
Alterar el traige
Bloquear uno o más EGOs