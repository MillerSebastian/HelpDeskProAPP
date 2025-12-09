# HelpDeskPro

Sistema de gestión de tickets de soporte técnico con autenticación basada en roles y verificación por correo electrónico.

## Descripción

HelpDeskPro es una aplicación web moderna de gestión de tickets de soporte que permite a los agentes administrar solicitudes de clientes de manera eficiente. La plataforma incluye autenticación segura, gestión de usuarios, y un sistema completo de tickets con comentarios y seguimiento en tiempo real.

## Características Principales

- 🔐 **Autenticación Segura**: Login con email/password y Google OAuth
- ✉️ **Verificación por Email**: Los nuevos usuarios deben verificar su correo antes de acceder
- 👥 **Gestión de Usuarios**: Los agentes pueden crear y administrar usuarios (clientes y agentes)
- 🎫 **Sistema de Tickets**: Creación, asignación y seguimiento de tickets de soporte
- 💬 **Comentarios en Tiempo Real**: Sistema de comentarios con actualizaciones en vivo
- 📊 **Dashboard Analítico**: Visualización de estadísticas y métricas de tickets
- 🌓 **Modo Oscuro**: Soporte completo para tema claro y oscuro
- 📱 **Diseño Responsivo**: Interfaz adaptable a diferentes dispositivos

## Tecnologías Utilizadas

### Frontend
- **Next.js 13.5.1** - Framework de React para aplicaciones web
- **React 18.2.0** - Biblioteca de interfaz de usuario
- **TypeScript 5.2.2** - Superset tipado de JavaScript
- **Tailwind CSS 3.3.3** - Framework de CSS utility-first
- **Radix UI** - Componentes de UI accesibles y sin estilos
- **Lucide React** - Iconos modernos para React
- **Recharts** - Biblioteca de gráficos para visualización de datos

### Backend & Base de Datos
- **Firebase 12.6.0** - Plataforma de desarrollo de aplicaciones
  - Firebase Authentication - Autenticación de usuarios
  - Cloud Firestore - Base de datos NoSQL en tiempo real
  - Firebase Storage - Almacenamiento de archivos
- **Firebase Admin 13.6.0** - SDK del lado del servidor para operaciones administrativas

### Servicios Adicionales
- **Nodemailer 7.0.11** - Envío de correos electrónicos
- **Cloudinary 2.8.0** - Gestión y optimización de imágenes

### Herramientas de Desarrollo
- **ESLint** - Linter para JavaScript/TypeScript
- **Autoprefixer** - PostCSS plugin para prefijos CSS
- **next-themes** - Gestión de temas (modo claro/oscuro)

## Requisitos Previos

- Node.js 16.x o superior
- npm o yarn
- Cuenta de Firebase
- Cuenta de Gmail (para envío de correos)
- Cuenta de Cloudinary (opcional, para gestión de imágenes)

## Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/MillerSebastian/HelpDeskProAPP.git
cd HelpDeskProAPP
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=tu_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Firebase Admin SDK
FIREBASE_ADMIN_CLIENT_EMAIL=tu_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="tu_private_key"

# Gmail Configuration
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password

# Cloudinary (opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

4. **Configurar Firebase**

- Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
- Habilitar Authentication (Email/Password y Google)
- Crear una base de datos Firestore
- Generar una clave privada para Firebase Admin SDK:
  - Ir a Configuración del proyecto > Cuentas de servicio
  - Generar nueva clave privada
  - Copiar `client_email` y `private_key` al `.env.local`

5. **Configurar Gmail**

- Habilitar verificación en 2 pasos en tu cuenta de Gmail
- Generar una contraseña de aplicación
- Usar esa contraseña en `GMAIL_APP_PASSWORD`

## Ejecución

### Modo Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Modo Producción
```bash
npm run build
npm start
```

### Verificación de Tipos
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Estructura del Proyecto

```
project/
├── app/                      # Rutas y páginas de Next.js
│   ├── api/                  # API Routes
│   │   └── users/create/     # Endpoint de creación de usuarios
│   ├── auth/                 # Páginas de autenticación
│   │   └── login/            # Página de login
│   ├── dashboard/            # Dashboards de la aplicación
│   │   ├── agent/            # Dashboard de agentes
│   │   │   ├── tickets/      # Gestión de tickets
│   │   │   └── users/        # Gestión de usuarios
│   │   ├── client/           # Dashboard de clientes
│   │   └── settings/         # Configuración de usuario
│   └── page.tsx              # Página principal
├── components/               # Componentes reutilizables
│   ├── ui/                   # Componentes de UI base
│   ├── CreateTicketDialog.tsx
│   ├── ProtectedRoute.tsx
│   └── Sidebar.tsx
├── context/                  # Contextos de React
│   └── AuthContext.tsx       # Contexto de autenticación
├── lib/                      # Utilidades y configuraciones
│   ├── firebase.ts           # Configuración de Firebase
│   ├── firebase-admin.ts     # Configuración de Firebase Admin
│   ├── email.ts              # Servicio de envío de emails
│   ├── tickets.ts            # Lógica de tickets
│   └── comments.ts           # Lógica de comentarios
└── public/                   # Archivos estáticos
```

## Uso

### Roles de Usuario

1. **Agente**
   - Crear y gestionar usuarios
   - Ver y gestionar todos los tickets
   - Asignar tickets a otros agentes
   - Responder y resolver tickets

2. **Cliente**
   - Crear tickets de soporte
   - Ver sus propios tickets
   - Agregar comentarios a sus tickets
   - Recibir notificaciones de actualizaciones

### Flujo de Trabajo

1. **Registro de Usuarios**
   - Los agentes crean usuarios desde el panel de administración
   - Los nuevos usuarios reciben un email de verificación
   - Deben verificar su email antes de poder iniciar sesión

2. **Creación de Tickets**
   - Los clientes crean tickets desde su dashboard
   - Pueden establecer prioridad y descripción
   - Los tickets se asignan automáticamente o manualmente

3. **Gestión de Tickets**
   - Los agentes pueden ver, filtrar y buscar tickets
   - Pueden cambiar el estado y asignar tickets
   - Sistema de comentarios para comunicación

## Seguridad

- ✅ Autenticación basada en Firebase
- ✅ Verificación de email obligatoria
- ✅ Rutas protegidas por rol
- ✅ Validación de usuarios en login con Google
- ✅ Variables de entorno para datos sensibles
- ✅ Firebase Admin SDK para operaciones del servidor

## Autor

**Sebastián Rodelo**  
Documento: 1043637249

## Licencia

Este proyecto es privado y de uso exclusivo para fines educativos y de demostración.

## Soporte

Para reportar problemas o solicitar características, por favor crear un issue en el repositorio de GitHub.
