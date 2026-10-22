# Folio Web

[Español](#español) | [English](#english)

Live demo: https://chat.gcloud.com.gt
Backend repository: AIDocumentReaderApi

---

## Español

### Descripción

Folio Web es la interfaz de Folio, una aplicación de chat con inteligencia artificial que permite conversar con un modelo de lenguaje o consultar documentos propios mediante Retrieval-Augmented Generation (RAG). La aplicación ofrece una experiencia similar a la de los asistentes conversacionales modernos: respuestas en tiempo real, documentos adjuntos, citas verificables y un diseño limpio y adaptable a cualquier dispositivo.

Se comunica con Folio API, el backend desarrollado con FastAPI, Google Gemini y PostgreSQL con pgvector.

### Funcionalidades

- Respuestas en tiempo real con una animación de escritura progresiva.
- Carga de documentos desde un botón o arrastrando archivos a la ventana, con indicador del progreso de indexación.
- Citas numeradas dentro de la respuesta que muestran el fragmento de origen y abren el documento en la página correspondiente.
- Panel lateral de vista previa para PDF y archivos de texto.
- Selector de modelo y modo de razonamiento extendido con el proceso de razonamiento visible y colapsable.
- Renderizado de Markdown con tablas, listas y bloques de código con resaltado de sintaxis y opción de copiar.
- Detención, regeneración y copia de respuestas.
- Historial de conversaciones agrupado por fecha, con renombrado y eliminación.
- Tema claro y oscuro, con detección de la preferencia del sistema.
- Diseño adaptable para escritorio y dispositivos móviles.

### Tecnologías

| Área | Tecnología |
| --- | --- |
| Lenguaje | TypeScript |
| Biblioteca de interfaz | React 19 |
| Herramienta de compilación | Vite |
| Componentes y estilos | Material UI |
| Estado del servidor | TanStack Query |
| Enrutamiento | React Router |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| Despliegue | Docker, nginx |

### Estructura del proyecto

```
src/
  main.tsx               Punto de entrada, proveedores y rutas
  theme.ts               Tema de Material UI y paleta de colores
  globalStyles.ts        Estilos globales y tipografía de las respuestas
  config.ts              Constantes de la aplicación
  api/                   Cliente HTTP, endpoints, tipos y lectura de SSE
  store/                 Estado de las respuestas en curso y preferencias
  hooks/                 Animación de texto y desplazamiento automático
  components/
    layout/              Estructura general con barra lateral
    sidebar/             Historial de conversaciones
    chat/                Vista de chat, mensajes, editor y citas
    documents/           Vista previa e iconos de archivos
    markdown/            Renderizado de Markdown y bloques de código
    common/              Logotipo y selector de tema
```

### Decisiones técnicas

- **Streaming sobre fetch:** las respuestas se reciben como Server-Sent Events leídos desde `fetch`, lo que permite usar peticiones POST con cuerpo y cancelar la generación con `AbortController`.
- **Respuestas independientes de la navegación:** las respuestas en curso se guardan en un store externo basado en `useSyncExternalStore`, de modo que continúan aunque el usuario cambie de conversación.
- **Identidad anónima:** cada navegador genera un identificador que se envía en el encabezado `X-Client-Id`, por lo que cada usuario solo ve sus propias conversaciones sin necesidad de registrarse.
- **Tema con variables CSS:** los colores se definen como variables CSS para ambos esquemas, lo que permite cambiar de tema sin volver a renderizar los componentes.

### Ejecución local

Requisitos: Node.js 24 o superior y Folio API en ejecución en `http://127.0.0.1:8000`.

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. Vite redirige las peticiones a `/api` hacia el backend.

Para generar la versión de producción:

```bash
npm run build
```

### Despliegue

```bash
docker compose up -d --build
```

La imagen compila la aplicación y la sirve con nginx en `127.0.0.1:8011`, con caché de larga duración para los archivos estáticos y redirección de rutas hacia `index.html`. En producción, un nginx en el servidor enruta `/api` al backend y el resto del tráfico a este contenedor, con HTTPS.

---

## English

### Overview

Folio Web is the user interface of Folio, an AI chat application that lets users talk with a language model or query their own documents through Retrieval-Augmented Generation (RAG). It provides an experience similar to modern conversational assistants: real-time responses, file attachments, verifiable citations and a clean, responsive design.

It communicates with Folio API, the backend built with FastAPI, Google Gemini and PostgreSQL with pgvector.

### Features

- Real-time responses with progressive text rendering.
- Document upload through a button or by dragging files into the window, with indexing progress.
- Numbered inline citations that show the source passage and open the document at the corresponding page.
- Side preview panel for PDF and text files.
- Model selection and an extended reasoning mode with a visible, collapsible reasoning section.
- Markdown rendering with tables, lists and code blocks with syntax highlighting and copy support.
- Stopping, regenerating and copying responses.
- Conversation history grouped by date, with renaming and deletion.
- Light and dark themes, following the system preference by default.
- Responsive layout for desktop and mobile devices.

### Tech stack

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| UI library | React 19 |
| Build tool | Vite |
| Components and styling | Material UI |
| Server state | TanStack Query |
| Routing | React Router |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| Deployment | Docker, nginx |

### Project structure

```
src/
  main.tsx               Entry point, providers and routes
  theme.ts               Material UI theme and color palette
  globalStyles.ts        Global styles and response typography
  config.ts              Application constants
  api/                   HTTP client, endpoints, types and SSE reader
  store/                 In-progress response state and preferences
  hooks/                 Text animation and automatic scrolling
  components/
    layout/              Main layout with sidebar
    sidebar/             Conversation history
    chat/                Chat view, messages, composer and citations
    documents/           File preview and icons
    markdown/            Markdown and code block rendering
    common/              Logo and theme toggle
```

### Technical decisions

- **Streaming over fetch:** responses are received as Server-Sent Events read from `fetch`, which allows POST requests with a body and cancellation through `AbortController`.
- **Navigation-independent responses:** in-progress responses live in an external store built on `useSyncExternalStore`, so they keep running when the user switches conversations.
- **Anonymous identity:** each browser generates an identifier sent in the `X-Client-Id` header, so every user only sees their own conversations without signing up.
- **CSS variable theming:** colors are defined as CSS variables for both schemes, allowing theme changes without re-rendering components.

### Running locally

Requirements: Node.js 24 or later and Folio API running at `http://127.0.0.1:8000`.

```bash
npm install
npm run dev
```

The application runs at `http://localhost:5173`. Vite proxies requests under `/api` to the backend.

To create a production build:

```bash
npm run build
```

### Deployment

```bash
docker compose up -d --build
```

The image builds the application and serves it with nginx on `127.0.0.1:8011`, with long-term caching for static assets and route fallback to `index.html`. In production, a host-level nginx routes `/api` to the backend and all other traffic to this container over HTTPS.
