# Indicativos del Proyecto

## Estructura de carpetas

    Tenemos 2 carpetas principales, una para el forntend y una para el backend, cada una alojara lo correspondiente para el desarrollo.

### Frontend

    Nuestro Frontend debe usar una estructura modular, limpia basada en arquitectura de capas. 

        - No usar archivos monoliticos (+300 lineas siempre que no sean de una unica funcion, de ser el caso, dividirlo)
        - priorizar inyeccion de dependencias y tipado fuerte
        - Usar diseño First Mobile (Diseñar primero para moviles y adaptarse al tamaño progresivamente)
        - Respetar los modelos iniciales entregados, solo hacer cambios si son estrictamente necesarios.

#### Styles

    - Los estilos deben respetar la idea original, pero creando archivos CSS para cada componente.
    - No modificar los archivos globales de styles.css a menos que sea estrictamente necesario.
    - Priorizar el uso de CSS puro. Solo usar librerias externas si es estrictamente necesario y solo si respeta el estilo visual   definido o si es solicitado por el usuario.
    - Si se necesita una librería, esta debe ser ligera y bien documentada.

### Backend

    El proyecto es un pseudo juego, asi que usaremos un sistema de Servidor autoritativo, sera quien procese las peticiones y logica, el cliente (Frontend) mostrara las respuestas.

        - Debe ser un servidor HTTP abierto a peticiones publicas, por ende el CORS no debe restringir IP desde el inicio, pero si debe realizar bloque de IP temporal si esta satura de peticiones (+10 por segundo)
        - Usar C# (.NET) como lenguaje, con ASP.NET para el servidor

        