# 🛡️ Arquitectura y Stack Tecnológico - SecureCollab

Este documento describe la estructura y las herramientas seleccionadas para la plataforma SecureCollab, diseñada bajo un enfoque estricto de **Defensa en Profundidad** y control de acceso basado en roles/atributos.

---

## ⚙️ Backend (API REST)
El motor principal, enfocado en una arquitectura por capas robusta y segura.

### Core y Base de Datos
* **Core:** Node.js con Express.js.
* **Base de Datos:** MongoDB.

### Autenticación & Criptografía
* **`jsonwebtoken`:** Generación de Access Tokens (15 min) y Refresh Tokens (7 días).
* **`bcrypt`:** Hashing seguro de contraseñas.
* **Cifrado Nativo (`crypto`):** Encriptación en reposo para campos `sensitive` con AES-256-GCM.

### Seguridad & Middlewares
* **`cookie-parser`:** Crucial para manejar el Refresh Token en cookies `HttpOnly` (mitiga ataques XSS).
* **`helmet`:** Protección automática mediante la configuración de cabeceras HTTP de seguridad.
* **`cors`:** Restricción estricta de los dominios que pueden consumir la API (Allowlist).
* **`rate-limiter-flexible`:** Prevención de ataques de fuerza bruta y limitación de peticiones (mitiga ataques DoS).
* **`joi`:** Validación estricta de todos los datos de entrada en cada endpoint (mitiga inyecciones).

### Testing
* **`jest` + `supertest`:** Frameworks para simular peticiones HTTP y ejecutar pruebas de seguridad y vulnerabilidades.

---

## 💻 Frontend (SPA)
La interfaz del usuario, enfocada en la usabilidad y el manejo ultra-seguro de la sesión (exclusivamente en memoria RAM).

* **Core & Build Tool:** React + Vite.
* **Enrutamiento:** React Router v6.
* **Cliente HTTP:** `axios` (ideal para interceptores y *refresh* silencioso).
* **Estilos y UI:** Tailwind CSS (incluyendo soporte para Dark Mode).
* **Seguridad Frontend:** `DOMPurify` para sanitizar cualquier input o renderizado de texto (especialmente en comentarios y descripciones de tareas), previniendo vulnerabilidades de XSS reflejado y almacenado.
* **Tiempo Real:** `socket.io-client` para la recepción de notificaciones interactivas.

---

## ✅ Configuraciones Realizadas (Bloque 1)

1.  **Definición del Stack Tecnológico:** Selección definitiva de herramientas orientadas a la seguridad y el rendimiento.
2.  **Arquitectura de Carpetas:** Creación de la estructura base separando las responsabilidades en capas (`/backend` y `/frontend`).
3.  **Configuración del Entorno de Datos:** Implementación de **Docker Compose** para contenedorizar y aislar la base de datos MongoDB.
4.  **Inicialización de Dependencias:** Instalación de las librerías críticas de seguridad (`helmet`, `cookie-parser`, `bcrypt`, `joi`) en el entorno de Node.
5.  **Preparación del Frontend:** Generación del proyecto de React con Vite y diseño de la estrategia para el manejo de tokens sin usar `localStorage`.