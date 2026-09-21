# 🧸 Epify

**Epify** es una plataforma de chat diseñada para niños, inicialmente desarrollada como una **web responsive mobile-first**.

La plataforma permite que los niños puedan descubrir y agregar otros usuarios como amigos y, una vez que la solicitud sea aceptada, iniciar una conversación privada.

> **Estado:** Demo / MVP
> **Plataforma:** Web responsive
> **Enfoque:** Mobile-first

---

## 🎯 Objetivo

Crear una experiencia de comunicación sencilla, amigable y segura para niños.

Epify permitirá:

* 👤 Crear y gestionar un perfil.
* 🔎 Buscar otros usuarios.
* 👥 Enviar solicitudes de amistad.
* 🤝 Aceptar o rechazar solicitudes.
* 💬 Conversar con amigos aceptados.
* 🚫 Bloquear usuarios.
* ⚠️ Reportar usuarios o mensajes.
* 🤖 Opcionalmente conversar con un asistente de IA.

### Regla principal

> **En Epify, dos usuarios solamente pueden conversar cuando ambos han aceptado la relación de amistad.**

Encontrar a otro usuario no significa que automáticamente pueda enviarle mensajes.

---

## 🧒 Concepto

Epify busca ofrecer una experiencia similar a una red social de mensajería, pero con una experiencia simplificada y pensada específicamente para niños.

El flujo principal es:

```text
       🔎 Buscar
          │
          ▼
     👤 Ver usuario
          │
          ▼
    ➕ Agregar amigo
          │
          ▼
   ⏳ Solicitud pendiente
          │
          ▼
      🤝 Aceptar
          │
          ▼
    👥 Son amigos
          │
          ▼
       💬 Chat
```

---

## 📱 Experiencia principal

Al ingresar a Epify, el usuario debería poder acceder rápidamente a:

```text
┌──────────────────────────────┐
│ 🧸 Epify                     │
├──────────────────────────────┤
│                              │
│ ¡Hola! 👋                    │
│                              │
│ 👥 Mis amigos                │
│                              │
│ 🔎 Buscar amigos             │
│                              │
│ 🤝 Solicitudes               │
│                              │
│ 🤖 Asistente                 │
│                              │
└──────────────────────────────┘
```

---

## 💬 Chat

El chat es el elemento principal de comunicación de Epify.

Los usuarios podrán conversar únicamente con contactos que hayan aceptado la solicitud de amistad.

```text
┌──────────────────────────────┐
│ ←  🧒 Alex                   │
├──────────────────────────────┤
│                              │
│ Hola 👋                      │
│                              │
│                    ¡Hola! 😊 │
│                              │
│ ¿Qué estás haciendo?         │
│                              │
├──────────────────────────────┤
│ Escribe un mensaje...    ➤  │
└──────────────────────────────┘
```

---

## 👥 Amigos

La sección **Mis amigos** mostrará únicamente las relaciones aceptadas.

```text
Mis amigos

🧒 Alex
   ● Disponible

🧒 Mateo
   ● Disponible

🧒 Sofía
   ○ Desconectada
```

Al seleccionar un amigo se podrá acceder a la conversación.

---

## 🤝 Solicitudes

Epify tendrá un sistema de solicitudes de amistad.

### Solicitud recibida

```text
┌──────────────────────────────┐
│ 🧒 Lucas                     │
│                              │
│ [Aceptar]    [Rechazar]      │
└──────────────────────────────┘
```

### Solicitud enviada

```text
┌──────────────────────────────┐
│ 🧒 Ana                       │
│                              │
│ ⏳ Solicitud pendiente        │
└──────────────────────────────┘
```

---

## 🔎 Buscar amigos

Los usuarios podrán buscar otros usuarios mediante un identificador de Epify.

```text
🔎 Buscar amigos

┌──────────────────────────────┐
│ Buscar por usuario...        │
└──────────────────────────────┘

Resultados

🧒 Alex
@alex123

[➕ Agregar]
```

---

## 🔒 Seguridad y privacidad

Debido a que Epify está pensado para menores, la seguridad debe ser una parte fundamental del producto.

Entre las reglas principales:

* Un usuario no puede enviar mensajes a alguien que no sea un amigo aceptado.
* Los usuarios pueden bloquear a otros usuarios.
* Los usuarios pueden reportar cuentas o mensajes.
* No se debe solicitar información personal innecesaria.
* No se debe mostrar públicamente información sensible.
* La aplicación debe evitar incentivar el intercambio de datos personales.
* La moderación debe formar parte de una futura versión de producción.
* La demo debe utilizar únicamente datos ficticios.

> **Importante:** esta versión es una demo de concepto y no debe utilizarse con niños reales. Una versión de producción requeriría una revisión específica de seguridad, privacidad, moderación y requisitos legales aplicables.

---

## 🧩 Pantallas

La primera versión de Epify debería contar como mínimo con:

### 1. Home

Entrada principal de la aplicación.

### 2. Mis amigos

Lista de contactos aceptados.

### 3. Solicitudes

Solicitudes recibidas y enviadas.

### 4. Buscar amigos

Búsqueda y envío de solicitudes.

### 5. Perfil

Información básica del usuario.

### 6. Chat

Conversaciones privadas con amigos.

### 7. Reportar / bloquear

Acciones de seguridad disponibles desde perfiles y conversaciones.

### 8. Asistente

Chat separado con el asistente de IA, si se incluye en la demo.

---

## 🏗️ Arquitectura

```text
Epify
│
├── 👤 Users
│
├── 👥 Friends
│   ├── Requests
│   ├── Accepted
│   └── Blocked
│
├── 💬 Conversations
│   └── Messages
│
├── ⚠️ Reports
│
└── 🤖 AI Assistant
```

---

## 🗄️ Modelo de datos

### User

```text
User
├── id
├── username
├── avatar
├── status
└── createdAt
```

### FriendRequest

```text
FriendRequest
├── id
├── senderId
├── receiverId
├── status
└── createdAt
```

Estados:

```text
PENDING
ACCEPTED
REJECTED
BLOCKED
```

### Conversation

```text
Conversation
├── id
├── participantA
├── participantB
└── createdAt
```

### Message

```text
Message
├── id
├── conversationId
├── senderId
├── content
├── createdAt
└── status
```

---

## 🔐 Regla de autorización

La regla más importante del backend de Epify:

```text
¿A y B son amigos aceptados?
          │
     ┌────┴────┐
     │         │
    Sí         No
     │         │
     ▼         ▼
  Permitir   Rechazar
    chat      mensaje
```

Esta regla debe validarse en el **backend**, no solamente en el frontend.

---

## 📐 Responsive

Epify será desarrollado como una web responsive con enfoque **mobile-first**.

### Mobile

```text
┌──────────────────────┐
│ 🧸 Epify             │
├──────────────────────┤
│                      │
│      Contenido       │
│                      │
│                      │
├──────────────────────┤
│ 🏠  👥  🔎  👤      │
└──────────────────────┘
```

### Desktop

```text
┌────────────────────────────────────────┐
│ 🧸 Epify                               │
├──────────────┬─────────────────────────┤
│              │                         │
│ 👥 Amigos    │       💬 Chat           │
│              │                         │
│ 🧒 Alex      │                         │
│ 🧒 Mateo     │                         │
│ 🧒 Sofía     │                         │
│              │                         │
└──────────────┴─────────────────────────┘
```

---

## 🎨 Identidad

**Nombre:** Epify

El diseño visual debería transmitir:

* 🧸 Amabilidad
* 🌈 Diversión
* 🛡️ Seguridad
* ✨ Simplicidad
* 👥 Comunidad

La identidad visual debe evitar una apariencia excesivamente infantil si el producto busca ser utilizado por un rango amplio de edades.

---

## 🧪 MVP

### Primera demo

* [ ] Home de Epify
* [ ] Perfil de usuario
* [ ] Usuarios mock
* [ ] Buscar usuarios
* [ ] Enviar solicitud
* [ ] Recibir solicitud
* [ ] Aceptar solicitud
* [ ] Rechazar solicitud
* [ ] Lista de amigos
* [ ] Chat entre amigos
* [ ] Bloquear usuario
* [ ] Reportar usuario
* [ ] Responsive mobile-first

### Segunda etapa

* [ ] Backend
* [ ] Base de datos
* [ ] Autenticación
* [ ] Mensajería en tiempo real
* [ ] Moderación
* [ ] Sistema de reportes
* [ ] Notificaciones
* [ ] Controles parentales
* [ ] Asistente de IA

---

## 🗺️ Roadmap

### Fase 1 — Demo

UI + datos mock + navegación + flujo de amistad + chat simulado.

### Fase 2 — Backend

Usuarios + autenticación + amistades + conversaciones + mensajes.

### Fase 3 — Tiempo real

WebSockets + mensajes instantáneos + estados online/offline.

### Fase 4 — Seguridad

Moderación + reportes + bloqueos + controles parentales + protección de datos.

### Fase 5 — Producto

Testing con usuarios, accesibilidad, analítica y posible aplicación móvil.

---

## 🚀 Stack sugerido

* React
* TypeScript
* Vite
* Tailwind CSS
* ESLint
* Prettier

Para la primera demo, los usuarios, solicitudes y mensajes pueden utilizar datos mock.

---

## 📦 Instalación

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

---

## ⚠️ Alcance

**Epify actualmente es una demo de concepto.**

El objetivo de esta primera versión es validar:

* La experiencia visual.
* El flujo de agregar amigos.
* El sistema de solicitudes.
* La restricción de chat entre amigos.
* La experiencia responsive.

No representa todavía un producto final listo para ser utilizado por menores.
