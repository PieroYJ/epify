# 🧸 Tecnologías del Proyecto — Epify

Documento técnico que detalla la arquitectura, lenguajes, frameworks, librerías y herramientas implementadas en el desarrollo de **Epify**.

---

## 1. 🌐 Lenguajes de Programación y Marcado

* **TypeScript (TS / TSX)**:
  * Lenguaje principal tanto para el **Frontend** como para el **Backend**.
  * Proporciona tipado estático estricto, interfaces compartidas (`User`, `FriendRequest`, `Conversation`, `Message`) y prevención de errores en tiempo de compilación.
* **JavaScript (Node.js / ES Modules)**:
  * Entorno de ejecución en el servidor y base de los módulos nativos de Node.js (`fs`, `path`, `http`).
* **HTML5**:
  * Estructura semántica, metadatos SEO, configuración de viewport *mobile-first* y carga de fuentes web en `index.html`.
* **CSS3 (CSS Moderno)**:
  * Sistema de diseño basado en **CSS Custom Properties (Variables)**, efectos de *Glassmorphism* (`backdrop-filter: blur`), maquetación con **Flexbox** y **CSS Grid**, micro-animaciones fluidas y diseño responsive adaptativo.
* **JSON**:
  * Formato para configuración (`package.json`, `tsconfig.json`) y motor de persistencia de la base de datos (`server/data/db.json`).

---

## 2. 💻 Frontend (Cliente Web)

* **React 19**:
  * Biblioteca para la construcción de interfaces de usuario interactivas basadas en componentes y Hooks (`useState`, `useEffect`, `useContext`, `useRef`).
* **Vite 8**:
  * Entorno de desarrollo de última generación con recarga rápida en caliente (HMR), empaquetado optimizado para producción y configuración de proxy inverso para API y WebSockets.
* **Lucide React**:
  * Colección de iconos vectoriales modernos y consistentes para navegación, acciones y seguridad infantil.
* **Canvas Confetti**:
  * Librería para efectos visuales de confeti animado al aceptar solicitudes de amistad.
* **Google Fonts**:
  * Tipografías optimizadas: **Outfit** (titulares amigables) y **Plus Jakarta Sans** (cuerpo de lectura accesible).
* **Socket.IO Client**:
  * Cliente WebSocket para escuchar y emitir eventos en tiempo real hacia el backend.

---

## 3. ⚙️ Backend (Servidor y API)

* **Node.js (v24+)**:
  * Entorno de ejecución del lado del servidor.
* **Express 5**:
  * Framework web para la creación de rutas RESTful (`/api/auth/login`, `/api/auth/register`, `/api/users`, `/api/data/:userId`, etc.).
* **Socket.IO**:
  * Servidor de comunicación bidireccional basada en eventos y WebSockets.
  * Gestiona:
    * Mensajes instantáneos entre dos niños reales (sin bots falsos).
    * Notificaciones inmediatas de solicitudes de amistad.
    * Estados de presencia en vivo (`online`, `playing`, `studying`, `offline`).
* **TSX (TypeScript Execute)**:
  * Ejecutor en caliente de TypeScript para Node.js sin necesidad de paso previo de transpilación manual.
* **CORS**:
  * Middleware para la gestión de orígenes cruzados seguros entre cliente y servidor.

---

## 4. 🗄️ Base de Datos y Almacenamiento

* **Base de Datos Persistente en Disco (`server/data/db.json`)**:
  * Sistema de almacenamiento de documentos JSON estructurado y gestionado mediante un controlador atómico en Node.js.
  * Colecciones persistidas:
    * `users`: Perfiles, avatares, PIN de acceso, mensajes de estado y usuarios bloqueados.
    * `friendRequests`: Solicitudes con estados (`PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED`).
    * `conversations`: Registro de conversaciones privadas.
    * `messages`: Historial de mensajes con marcas temporales y estado de lectura.
    * `reports`: Reportes de seguridad emitidos por los menores.
* **Almacenamiento de Sesión por Pestaña (`sessionStorage`)**:
  * Permite la apertura de múltiples pestañas simultáneas e independientes en un mismo navegador, posibilitando pruebas de chat entre niños en tiempo real desde la misma máquina.

---

## 5. 🛠️ Herramientas de Desarrollo y Calidad

* **Concurrently**:
  * Utilidad para ejecutar el servidor backend y el cliente Vite de forma simultánea con un solo comando (`npm run dev`).
* **Git & GitHub**:
  * Control de versiones distribuido y alojamiento de código en repositorio remoto.
* **Oxlint**:
  * Linter ultra rápido para inspección de calidad de código JavaScript/TypeScript.

---

## 6. ☁️ Despliegue e Infraestructura

* **Render (render.com)**:
  * Plataforma de alojamiento en la nube configurada como **Web Service Node.js unificado**.
  * En producción, el servidor Express aloja los archivos estáticos generados por Vite (`dist/`), mientras atiende las rutas API y las conexiones WebSocket de Socket.IO en el mismo puerto y dominio con certificado SSL gratuito (HTTPS / WSS).

---

## 7. 🛡️ Características de Arquitectura y Seguridad Infantil

1. **Regla de Autorización Estricta**: Dos usuarios solo pueden conversar si ambos han aceptado la relación de amistad; validada tanto en cliente como en backend antes de emitir cualquier mensaje.
2. **Cero Respuestas Automáticas en Cuentas Humanas**: Cada mensaje recibido proviene exclusivamente de la persona autenticada en esa cuenta.
3. **Epibot IA**: Mascota y asistente virtual preprogramado con filtros de seguridad, adivinanzas, chistes sanos y curiosidades para menores.
4. **Sistema de Bloqueo y Reportes Confidenciales**: Acciones preventivas inmediatas para proteger la experiencia de los niños.
