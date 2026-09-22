# Registro de Cambios y Mejoras en Epify

Este documento resume las soluciones y nuevas funcionalidades implementadas en Epify:
1. **Perfil Administrador y Gestión de Cuentas (Creación y Eliminación)**.
2. **Solución del Bug de Caída Rápida y Motor de Audio en Tetris Kids**.
3. **Solución del Bug de Chat en Tiempo Real y Actualizaciones Optimistas**.
4. **Nuevo Juego: Stickman Brawl (2 Jugadores Simultáneos / 1P vs CPU)** y solución del contador de vida en tiempo real.
5. **Solución del Corte de Pantalla en Google PAC-MAN (Corrección de Box-Sizing)**.

---

# 1. Perfil Administrador y Gestión de Cuentas

Se implementó un rol de **Administrador (`admin`)** con un panel de control completo para crear y eliminar cuentas de usuario, garantizando la persistencia de datos, la integridad referencial y actualizaciones en tiempo real.

### Credenciales de Acceso Administrador
- **Usuario:** `admin`
- **PIN:** `1234`
- **Acceso rápido:** Botón directo disponible en la pantalla de inicio de sesión (`LoginView.tsx`).

---

# 2. Solución del Bug de Caída Rápida y Audio en Tetris Kids

### Causa Raíz
- El estado del juego (`board`, `piecePos`, `dropTimer`) estaba sujeto a *stale closures* de React. Al pulsar "Caída Rápida" repetidas veces, la lectura asíncrona leía una captura desactualizada del tablero, provocando que la nueva pieza borrara los bloques fijados previamente.

### Solución Aplicada
- **Sincronización síncrona mediante Referencias (`useRef`)**:
  - `boardRef`, `piecePosRef`, `currentPieceRef`, `nextPieceRef`, `dropTimerRef` y `isHardDroppingRef`.
- **Cancelación y reprogramación atómica del temporizador** al ejecutar `hardDrop()`. Las piezas se apilan correctamente sin importar la velocidad de pulsación.
- **Motor de Audio Chiptune**: Síntesis nativa con Web Audio API de *Korobeiniki* y efectos de sonido en tiempo real.

---

# 3. Solución del Bug de Chat en Tiempo Real

### Problema Reportado
A veces, al escribir en el chat (tanto con Epibot como con amigos), no se mostraba el mensaje enviado ni la respuesta recibida hasta recargar la página (`F5`).

### Causas Raíz Identificadas
1. **Corrupción de Conversación en Memoria:**
   - Cuando se enviaba un mensaje en una conversación nueva (o no cargada previamente en el cliente), el listener `socket.on('message_received')` guardaba la conversación con `participantA: message.senderId` y `participantB: currentUserId`.
   - Al ser el emisor el usuario actual, ambos participantes se guardaban como el mismo usuario (`participantA === participantB === currentUserId`).
   - La función `getConversationWith(targetUserId)` buscaba una conversación con `targetUserId` y, al no encontrarla, devolvía `[]`, ocultando todos los mensajes hasta recargar.
2. **Desconexión y Pérdida de Autenticación de Socket:**
   - Ante micro-cortes, suspensión del equipo o reconexión automática de Socket.IO, el socket reconectado no volvía a emitir el evento `authenticate`.
   - El backend recibía el socket con `currentUserId = null`, descartando los envíos posteriores con `"No autenticado"` y omitiendo la entrega de mensajes entrantes.
3. **Falta de Renderizado Optimista:**
   - La interfaz borraba el campo de texto pero no mostraba el mensaje hasta esperar la respuesta completa del socket, causando sensación de mensajes perdidos ante cualquier latencia.
4. **Violación de Reglas de Hooks en Componentes:**
   - En `ChatView.tsx`, `EpibotView.tsx`, `ProfileView.tsx` y `SearchFriendsView.tsx` existían retornos condicionales antes de los hooks de React (`useState`, `useRef`, `useEffect`).

### Soluciones Implementadas
1. **Envío del Objeto Conversación Autoritativo desde el Backend:**
   - En `server/socket.ts` e `index.ts`, la emisión de `message_received` ahora incluye el objeto `conversation` completo con los participantes correctos.
   - En `EpifyContext.tsx`, la conversación se sincroniza y almacena de inmediato.
2. **Renderizado Optimista Instantáneo:**
   - Al pulsar "Enviar", el mensaje se muestra de inmediato en pantalla (`0ms lag`) con un ID temporal `temp_` que luego es reemplazado de manera transparente por el ID definitivo del servidor.
3. **Búsqueda Resiliente en `getConversationWith`:**
   - Además de buscar por ID de conversación, busca por `senderId` y `receiverId`. Incluso si una conversación aún no tiene ID formal, los mensajes entre ambos usuarios se visualizan sin interrupción.
4. **Re-autenticación Automática en `socket.ts`:**
   - Se añadieron listeners en `connect` y `reconnect` para emitir `authenticate` con el usuario activo cada vez que el socket se reconecte.
   - Se implementaron salas nativas en Socket.IO (`socket.join(userId)` y `io.to(userId).emit(...)`) para garantizar entrega en todas las pestañas.
5. **Endpoint HTTP de Respaldo (`POST /api/messages`):**
   - Garantiza que si los WebSockets se encuentran temporalmente reconectando, el mensaje se persiste y entrega vía HTTP y se retransmite a ambos usuarios.
6. **Corrección de Hooks de React:**
   - Se ordenaron los hooks en todos los componentes para cumplir al 100% con las Reglas de Hooks de React.

---

# 4. Stickman Brawl: Juego de Pelea para 2 Jugadores y Actualización de Vida a 60 FPS

Se diseñó e integró un juego de combate estilo **Stickman** fluido, dinámico y amigable para todas las edades (sin violencia gráfica, con efectos cómicos "¡POW!", "¡BAM!", chispas y estrellas de impacto).

### Solución al Contador de Vida (HP) en Tiempo Real
- **Causa Raíz:** Las propiedades de vida (`p.hp`, `p.displayHp`) se calculaban dentro del ciclo de animación (`requestAnimationFrame`), pero estaban contenidas en referencias (`useRef`) sin desencadenar re-renderizados de React. El DOM solo se enteraba del cambio de vida al producirse un K.O. mediante `setMatchState('round_end')`.
- **Solución Aplicada:**
  1. **Referencias Directas al DOM (`p1HpBarRef`, `p2HpBarRef`, `p1HpTextRef`, `p2HpTextRef`)**: Se actualiza el ancho de las barras y el porcentaje numérico en cada fotograma a 60 FPS sin sobrecargar React.
  2. **Barras Flotantes en Canvas:** Se dibuja una barra de salud viva y reactiva justo encima de la cabeza de cada Stickman.
  3. **Cajas de Colisión Optimizadas:** Se ajustó la detección de golpes (`isFacingDefender && distX < maxDistX && distY < 60`) para garantizar que cada puño y patada conecte con precisión y reduzca vida al instante.
  4. **Solución al Congelamiento al Recibir Golpes:** Se corrigió el temporizador de recuperación `actionTimer` que solo restauraba las acciones si eran `'punching'` o `'kicking'`. Ahora el jugador aturdido por un golpe se recupera automáticamente tras 8 fotogramas (~130ms) a `'idle'`, permitiendo esquivar, contraatacar y moverse con total fluidez.

### Controles
| Acción | Jugador 1 (Azul Neón) | Jugador 2 (Rojo Fuego) |
|---|---|---|
| Moverse | `A` (Izq) / `D` (Der) | `←` (Flecha Izq) / `→` (Flecha Der) |
| Saltar | `W` | `↑` (Flecha Arriba) |
| Cubrirse / Bloqueo | `S` (Reduce 70% daño) | `↓` (Flecha Abajo) |
| Puñetazo | `F` | `K` o `Teclado Num 1` |
| Patada | `G` | `L` o `Teclado Num 2` |

- **Compatibilidad Táctil y Móvil:** Incluye botones de acción rápida en pantalla para dispositivos táctiles.

---

# 5. Solución del Corte de Pantalla en Google PAC-MAN

### Causa Raíz
- El doodle de Google PAC-MAN (creado originalmente en 2010) fue programado asumiendo el modelo de caja estándar `box-sizing: content-box` (donde `border-top: 25px` + `height: 136px` + `padding-bottom: 25px` = `186px` de alto total).
- Al incluir el reseteo moderno `* { box-sizing: border-box; }`, `#pcm-c` limitaba su altura exterior a solo 136px, dejando únicamente 86px de área visible interior. Como `#pcm-c` tiene `overflow: hidden`, **la parte inferior del laberinto (50 píxeles de pared, puntos y frutas) quedaba cortada**.

### Solución Aplicada
1. **Regla `box-sizing: content-box !important`:** Se forzó explícitamente en `#board-scaler`, `#lga`, `#logo`, `#pcm-c` y `#pcm-p` tanto en el CSS de `public/games/pacman/index.html` como en la inyección de estilos de `pacman.js`.
2. **Escalado Automático Inmediato:** Se ejecutó `updateGameScale()` inmediatamente al cargar el documento (y en `DOMContentLoaded`), adaptando la altura del marco del arcade a la escala exacta del laberinto completo.
3. **Ampliación del Viewport en [PacmanGame.tsx](file:///d:/Proyectos%20Antigravity/Epify/src/components/games/PacmanGame.tsx):** Se incrementaron las dimensiones del iframe contenedor a `maxWidth: 640px` y `height: 520px` para que el laberinto, los botones arcade y el D-Pad táctil se vean al 100% sin barras de desplazamiento ni cortes.

---

# 6. Borrado de Mensajes y Limpieza de Chat (Tiempo Real)

Se implementó soporte completo tanto en backend como en frontend para gestionar los mensajes de chat:

### Funcionalidades Añadidas
1. **Eliminar Mensaje Individual (🗑️):**
   - Cada burbuja de mensaje (en chats con amigos y en el chat con Epibot) cuenta con un botón discreto de papelera.
   - Al confirmar, el mensaje se retira de la interfaz al instante (0ms lag), se borra de la base de datos y se sincroniza en tiempo real vía WebSockets a todas las pestañas.
2. **Limpiar Chat Completo (🧹):**
   - En el menú de opciones del chat de amigos (`ChatView.tsx`) y en la cabecera del chat con Epibot (`EpibotView.tsx`) se agregó la opción **"Limpiar chat completo"**.
   - Con confirmación segura previa, vacía la conversación en el servidor y en la pantalla de inmediato.
3. **Arquitectura y Endpoints:**
   - **Backend (`server/db.ts`):** Métodos `deleteMessage` y `clearConversationMessages`.
   - **Rutas HTTP (`server/index.ts`):** `DELETE /api/messages/:messageId` y `DELETE /api/conversations/:convId/messages`.
   - **WebSockets (`server/socket.ts`):** Eventos `delete_message` -> `message_deleted` y `clear_chat` -> `conversation_cleared`.

---

# 7. Verificación y Pruebas Realizadas

1. **Pruebas de API Automatizadas:**
   - Script `verify_chat_delete.cjs`: Envío de mensaje (`201`), borrado individual (`200 OK`) y limpieza total de conversación (`200 OK`).
2. **Compilación y Linters:**
   - `npm run build` (`tsc -b && vite build`): **0 errores** (construcción de producción limpia en 328ms).
   - `oxlint`: **0 errores** en `src/` y `server/`.
3. **Servidores Activos en Vivo:**
   - Servidor frontend Vite disponible en `http://localhost:5173/`.
   - Servidor backend API/WebSockets en `http://localhost:3001/`.
