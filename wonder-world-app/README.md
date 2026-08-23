# Wonder World OS

**Alpha Fenrir Tactical Core** - Sistema de gamificación de rutinas, gestión de estrés y simulador de comandante táctico. Construido sobre Tauri, React y Vite.

## Versión Actual
**v1.0.0** (Build Oficial de Lanzamiento)

## Características Principales
*   **Gestión de Energía y Estrés (Tactical Core):** Sistema de resistencia biológica para regular los hábitos diarios del usuario (Energía, Estrés, Puntos E.G.O, Mood).
*   **Matrix E.G.O:** Equipamiento de nodos mentales e inserción de imágenes personalizadas en base64 para representar aliados o habilidades que reducen el impacto emocional.
*   **Vida Diaria (Operaciones):** Seguimiento de rutinas gamificadas con impacto directo (positivo y negativo) sobre la Energía y Estrés del jugador.
*   **Zona de Caza (Bosses):** Modo de enfrentamiento donde el usuario gestiona su progreso contra "Jefes" o metas de alta fricción, utilizando diferentes municiones tácticas.
*   **Guarida (Lair):** Interfaz para limpieza emocional, purgas de estrés usando melodías (texto) y activación de sectores de relajación mental.
*   **Tienda (Alquimia / Suministros):** Intercambio de moneda virtual ganada para adquirir recompensas de la vida real o ayudas en el juego.
*   **Full Backup System:** Sistema nativo para Android y PC para exportar e importar el progreso en formato JSON blindado contra bloqueos de WebView.

## Stack Tecnológico
*   **Frontend:** React (TSX), Vite, CSS Modules.
*   **Backend / Contenedor:** Tauri v2 (Rust).
*   **Almacenamiento:** Persistent LocalStorage (Aislado, con Inyección Activa para Cross-Platform).
*   **Plataformas:** PC (Windows, macOS, Linux), Móvil (Android nativo).

## Instalación y Desarrollo
1. Clona el repositorio.
2. Instala las dependencias: `npm install`
3. Ejecuta el entorno de pruebas de PC: `npm run tauri dev`
4. Ejecuta el entorno de pruebas de Android: `npm run tauri android dev`
5. Compila la APK para producción: `npm run tauri android build`

## Notas de Lanzamiento v1.0.0
*   Transformación UX/UI Mobile: Barras laterales responsivas, botones táctiles flotantes y contención de desbordes (overflow protection) en la Guarida y EGO.
*   Reingeniería del Motor de Guardado, resolviendo las paradojas de LocalStorage en Android WebView.
*   Interfaz y diseño "Cyberpunk/HUD" estabilizados y unificados con el icono oficial.
