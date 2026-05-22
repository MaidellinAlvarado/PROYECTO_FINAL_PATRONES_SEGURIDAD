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




## ✅ Configuraciones Realizadas (Bloque 2 - Rate Limiting y Audit Logging)

6.  **Modelo de Auditoría Inmutable:** Creación de `src/models/auditLog.model.js` con índices optimizados y *hooks* de Mongoose (`pre`) para bloquear de forma estricta cualquier intento de modificación o eliminación de registros (Garantizando un enfoque *Append-Only*).
7.  **Servicio Centralizado de Logs:** Implementación de `src/services/auditLog.service.js` bajo diseño *Fail-Open* (el fallo en el registro no interrumpe la experiencia del usuario) con abstracción de red para la extracción automática de direcciones IP y User-Agent de las peticiones HTTP.
8.  **Estrategia Multicapa de Rate Limiting:** Creación de `src/middlewares/rateLimiter.js` utilizando la librería `rate-limiter-flexible` para mitigar vectores de ataque de Fuerza Bruta y DoS, definiendo políticas diferenciadas para flujos sensibles (Login y Registro).
9.  **Integración Transversal en Autenticación:** Inyección del servicio de auditoría en los controladores de accesos para capturar eventos clave en tiempo real: `auth.register`, `auth.login.success`, `auth.login.failure` (sin comprometer secretos) y `auth.logout`.
10. **Trazabilidad de Abuso en Red:** Vinculación del limitador de peticiones con el almacenamiento inmutable para generar logs automáticos bajo la acción `security.rate_limited`, respondiendo con el código de estado HTTP 429 e inyectando la cabecera dinámica `Retry-After`.
11. **Aislamiento de Capa de Datos:** Configuración y estabilización de la cadena de conexión en el entorno local hacia una base de datos dedicada (`securecollab`), resolviendo discrepancias de direccionamiento de red (IPv4/IPv6) entre el entorno de ejecución de Node.js y las herramientas de administración visual.