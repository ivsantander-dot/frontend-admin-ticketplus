# Panel de Administración TicketPlus

Panel de administración frontend para TicketPlus con autenticación Microsoft Entra ID (MSAL).

## Stack Tecnológico

- **Framework**: React 18 + TypeScript con Vite
- **Autenticación**: MSAL (Microsoft Authentication Library) para Microsoft Entra ID
- **Estilizado**: Tailwind CSS
- **Routing**: React Router v6
- **Estado Global**: Context API

## Configuración Requerida

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_CLIENT_ID=tu_client_id_de_azure
VITE_TENANT_ID=tu_tenant_id_de_azure
VITE_REDIRECT_URI=http://localhost:5173
```

### Configuración de Azure Entra ID

1. Registra una aplicación en Azure Portal
2. Configura los siguientes permisos:
   - `openid`
   - `profile`
   - `User.Read`
3. Configura el Redirect URI: `http://localhost:5173`
4. Asigna el rol "admin" a los usuarios que deben tener acceso al panel

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:5173`

## Build

```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── auth/              # Configuración MSAL
├── components/
│   ├── auth/         # Componentes de autenticación
│   └── layout/       # Componentes de layout (Sidebar, Header, Layout)
├── contexts/         # Contextos globales (AuthContext)
├── pages/            # Páginas (Login, Dashboard)
├── App.tsx           # Configuración de rutas
└── main.tsx          # Bootstrap de la aplicación
```

## Funcionalidades

- ✅ Autenticación con Microsoft Entra ID
- ✅ Verificación de rol "admin"
- ✅ Layout con sidebar y header
- ✅ Dashboard visual con tarjetas de microservicios
- ⏳ Gestión de usuarios (próximamente)
- ⏳ Gestión de eventos (próximamente)
- ⏳ Gestión de tickets (próximamente)

## Seguridad

- Solo usuarios con rol "admin" pueden acceder al panel
- La autenticación se maneja mediante MSAL con Microsoft Entra ID
- Las variables de entorno están protegidas en `.gitignore`
