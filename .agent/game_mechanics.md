# Guía de Mecánicas y Lógica del Sistema (Wonder World)

Este documento estructura formalmente las reglas y dinámicas extraídas de las notas originales del cliente para facilitar la implementación de la lógica del sistema.

---

## 1. Estadísticas Generales (Core Stats)
Estas estadísticas determinan el estado principal y las acciones posibles dentro de los menús.

- **Energía:** Usada principalmente en Cazas (normalmente disminuye). Recuperas **4 puntos** al ejecutar la acción "Pasar el día".
- **Estrés:** Normalmente aumenta al ejecutar Cazas. Recuperas **1 punto** al "Pasar el día".
- **EGO:** Recurso gastado al utilizar habilidades y combos.
- **Mood:** Normalmente aumenta al ejecutar "Saltos entre mundos". Si no está al máximo, altera el efecto completo del salto. Funciona como moneda de cambio para otros menús y no disminuye automáticamente a menos que ocurra un evento negativo.
- **Ticks (Tiempo):** Es el costo de ejecutar cualquier acción. 
  - Cada hora libre al día desde que se abre el menú otorga **4 ticks**.
  - El total final se redondea hacia el múltiplo de 5 más cercano.
  - Efectos de objetos o menús pueden alterarlo.
- **EXP:** Sirve para ganar notas tipo **"C"** en la Zona de Caza. 
  - 1 EXP = 1 "C". Se redondea hacia arriba (ej. 7.5 EXP = 8 "C").
- **Monedas:** Obtenidas comúnmente al ejecutar un combo "SS". Se usan exclusivamente en la **Tienda de la Manada**.
- **Eventos:** Obtenidos cuando se ejecuta un combo sin efecto posible (ej. "CC" para frenesí cuando ya está activo). Sirven como divisa en la Tienda.
- **Rompe límites:** Efectos raros que permiten alterar estadísticas manualmente a tu favor desde la "Modificación directa de la matriz". No se pueden comprar en la Tienda.

---

## 2. Sistemas Tácticos Musicales
La mecánica principal gira en torno a generar "notas" musicales.

- **Matriz de línea rítmica:** Es la melodía completa. Incluye el uso de la habilidad "Guardian" y sirve para activar los combos.
- **Cadena táctica:** Las notas musicales reales que han sido ejecutadas de forma efectiva. Esta cadena:
  1. Disminuye el cooldown de los EGOs (Ticks reducidos en el Menú de EGO).
  2. Define qué notas se ejecutarán en el Astrolabio.

---

## 3. Estados y Modificadores

### Triaje e Inestabilidad
El Triaje modifica las ganancias de EXP de las cazas y cambia el estado del menú EGO. Se calcula con la fórmula:
`Inestabilidad = Estrés - (Energía + Mood)`

- **Verde (Inestabilidad menor a -6):** Sin efectos negativos. Funcionamiento normal.
- **Amarillo (Inestabilidad entre -6 y -3):** Ejecutar "Cazas" solo otorga **0.5 EXP**.
- **Rojo (Inestabilidad mayor a -3):** Las "Cazas" otorgan EXP normal, pero cada Caza añade **1 condición curable (1 HP)** aleatoria. Cambia la interfaz del menú EGO a color "Rojo".

### Instintos
Son efectos automáticos. Solo se quitan si los cambias manualmente o por otro instinto.
- **Calmado:** Estado por defecto, sin efectos.
- **Frenesí:** Otorga +1 EXP en la siguiente "Caza" (1 vez al día).
- **Juguetón:** Otorga +1 "S" a la cadena táctica en el siguiente "Salto entre mundos" (1 vez al día).
- **Animado:** Otorga 1 EXP en la siguiente "Caza" o +1 "S" en el siguiente "Salto entre mundos" (1 vez al día). Si se usa uno de los beneficios, el otro se bloquea hasta el próximo día.

### Condiciones (Enfermedades / Costos)
- **Curable:** Permiten ejecutar la acción "Ir a la enfermería" (E). Tienen HP. Desaparecen cuando su HP llega a 0 o se cumple una condición específica de su descripción.
- **Incurable:** No habilitan "Ir a la enfermería". Solo se curan cumpliendo la condición detallada en su descripción.

---

## 4. Estructura de Menús Secundarios

### A. Zona de Caza
Aquí se utilizan las notas **"S"** (Astrolabio) y las **"C"** (EXP).
- **Jefe Domable:** Su restricción está activa hasta que es "Terminado". Si lo terminas, puedes seguir atacándolo para ganar **1 moneda**. Si el tiempo expira antes de terminarlo, recibes un castigo.
- **Jefe Indomable:** Su restricción está activa hasta terminarlo. Una vez terminado, solo puedes hacer ataques "Endless" (sin recompensa). No se puede atacar con "S". Si el tiempo expira, recibes castigo.

### B. Guarida Lunar Alfa (Astrolabio)
Usa notas de la cadena táctica que **NO sean "C" ni "E"** como moneda para "acciones de ocio".
- **Limpieza:** 
  - "Pasar el día" disminuye 1 de Limpieza. 
  - A nivel 0 de limpieza se bloquean acciones específicas (I, III, IV, VII, VIII, X, XI). 
  - Con limpieza al máximo, obtienes una nota "O" gratis al día siguiente.
- **Efectos de Ocio:**
  - `V` (Olfatearse): +1 Limpieza.
  - `VII` (Afilar garras): +1 S (Zona de Caza).
  - `IX` (Lamerse): +2 Limpieza.
  - `X` (Dejar huellas): +2 S (Zona de Caza).

### C. Alpha EGO Tactical Core
- Cada EGO tiene un *Cooldown de Ticks* que disminuye al inyectar la cadena táctica en la cámara de combustión.
- **Estados de EGO:** Estable o Corroído. El estado global depende del Triaje (Verde/Amarillo = Estable, Rojo = Corroído).
- **Cooldowns activos:** Los EGOs en cooldown pasan forzosamente a modo Corroído y pueden forzarse a usarse (a menos que se indique lo contrario).

### D. Tienda de la Manada
Gasto de Monedas, Monedas irrompibles y Eventos. Al pasar el día, todo se conserva excepto los "Golpes de suerte".
- **Tiendas Rotativas:** Al pasar el día, aparecen 3 tiendas al azar de 12 posibles. Stock máximo de 3 por día. Comprar con monedas da un 50% de probabilidad de obtener un *Golpe de suerte*.
- **Tienda del Batallón (Básica):** 4 vendedores, sin golpes de suerte.
- **Tienda Secreta:** 10% de probabilidad de aparecer al pasar el día. Similar a la del batallón pero con reglas distintas.

### E. La Vida Diaria del Lobo
Manejo de hábitos diarios, semanales o mensuales.
- **Beneficio:** Día sin fallos otorga **+1 Moneda**.
- **Fallos:** Una tarea fallida entra en "Riesgo de reincidencia". Fallarla ahí otorga un debuff al Menú Táctico.
- **Escudos:** Tareas no-diarias ejecutadas fuera de su horario otorgan escudo (una falla se cambia a "Saltada", que cuenta como "Cumplida").

---

## 5. Creador de Objetos y Eventos
**Objetos (Forja):** 
- Cuestan 1 moneda (Tienda del batallón).
- Modifican Ticks, Energía, EGO, Mood, Estrés o Triaje automáticamente de ser necesario. Otras modificaciones complejas (condiciones, cooldowns) son de aplicación manual.
- Tienen nombre, descripción, costo, efectos de triaje (duración temporal o diaria) y categoría.

**Eventos Reales:**
- Aplican efectos idénticos a los objetos pero ocurren de forma inmediata y no se "fabrican" ni guardan en la Forja.
