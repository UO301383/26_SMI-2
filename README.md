# Servicio de Videos en la Nube

Backend en Node.js/Express para un servicio tipo YouTube Shorts centrado en la subida, catalogacion y reproduccion de videos cortos por usuarios registrados.

Este README documenta el estado real del repositorio a fecha de revision, diferenciando entre:

- Lo que ya existe en codigo.
- Lo que existe solo de forma parcial.
- Lo que todavia no esta implementado.

## 1. Objetivo del trabajo

Implementar un servicio web similar a YouTube Shorts que permita:

- Registrar y autenticar usuarios.
- Subir videos mediante formulario web.
- Almacenar la informacion en base de datos.
- Procesar automaticamente los videos subidos.
- Generar miniaturas con `ffmpeg`.
- Reproducir los videos en HTML5.
- Ofrecer streaming adaptativo MPEG-DASH con al menos 3 calidades.

## 2. Estado general del repositorio

El repositorio contiene sobre todo el backend API. No hay frontend implementado todavia.

Hay una base funcional parcial para:

- API REST con Express.
- Registro e inicio de sesion.
- Modelos Sequelize para usuarios y videos.
- Procesado de video con `ffmpeg` para MP4 y miniatura.
- Generacion backend de contenido MPEG-DASH.

Pero el proyecto no esta todavia integrado extremo a extremo. Ahora mismo hay varios bloqueos importantes:

- El `README` anterior era una plantilla de una API de libros y no describia este proyecto.
- Las rutas de usuario que dependen de `req.user` no llevan middleware de autenticacion.
- El frontend completo falta.
- Docker existe, pero sigue siendo una adaptacion incompleta de la plantilla inicial.
- Los tests actuales son de un proyecto de libros y no prueban este servicio.

## 3. Estructura actual

```text
26_SMI-2/
├── app/
│   ├── app.js
│   ├── config/
│   │   ├── auth.config.js
│   │   └── db.config.js
│   │   └── storage.config.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── validators/
│   │       └── video.validator.js
│   ├── models/
│   │   ├── db.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   └── utils/
│       └── encoding_video.js
├── test/
│   ├── index.js
│   └── routes/
│       ├── book.routes.test.js
│       └── utils.js
├── Dockerfile
├── docker-compose.yml
├── index.js
├── package.json
├── script_encoding.sh
└── README.md
```

## 4. Requisitos del enunciado frente al estado real

### 4.1 Funciones minimas

| Requisito | Estado | Observaciones |
| --- | --- | --- |
| Subida de videos mediante formulario web | No implementado | Existe backend para crear video y subir archivo, pero no hay formulario web ni cliente. |
| Videos precargados de miembros del grupo | No implementado | No hay carpeta de datos iniciales, seeds ni material cargado en el repo. |
| Registro de usuarios por formulario web | Parcial | El endpoint `POST /signup` existe, pero no hay frontend. |
| Autenticacion usuario/contrasena para subir videos | Parcial | `signup` y `login` usan `bcrypt` y `jsonwebtoken`, y las rutas de video protegidas validan JWT. Aun faltan ajustes en rutas privadas de usuario. |
| Uso de base de datos para la subida de videos | Parcial | Sequelize esta configurado para MySQL y el flujo de video ya usa el modelo real, pero falta validar el sistema completo en ejecucion. |
| Actualizacion automatica del contenido al subir un video | Parcial | Al subir un archivo se genera MP4, miniatura y contenido DASH, pero falta probar el flujo extremo a extremo y desplegarlo. |
| Web HTML5 con listado y miniaturas | No implementado | No hay HTML, vistas, plantillas ni frontend SPA. |
| Extraccion automatica de miniatura con `ffmpeg` | Implementado | `getThumbnail()` existe en `app/utils/encoding_video.js`. |
| Reproduccion directa con HTML5 | No implementado | No existe cliente web ni pagina de reproduccion. |
| Reproduccion adaptativa MPEG-DASH en 3 calidades | Parcial | El backend ya genera MPEG-DASH en 3 calidades y expone el `manifest.mpd`, pero aun no hay reproductor DASH en cliente ni validacion final en despliegue. |

### 4.2 Funciones adicionales simples

| Requisito | Estado | Observaciones |
| --- | --- | --- |
| Framework en cliente (Bootstrap) | No implementado | No hay frontend. |
| Filtrado de videos por usuario | Parcial | Existe endpoint `GET /video/user/:userId` y ya usa el modelo de video integrado en backend. Sigue faltando el frontend. |
| Filtros opcionales combinables con `ffmpeg` | No implementado | No hay endpoints ni scripts para marca de agua, blanco y negro, velocidad, etc. |
| Listas de reproduccion automaticas | No implementado | No hay logica ni modelo asociado. |
| Buscador de videos | No implementado | No hay endpoint de busqueda ni interfaz. |
| Grabacion desde cliente con WebRTC | No implementado | No hay frontend ni integracion WebRTC. |

### 4.3 Funciones adicionales complejas

| Requisito | Estado | Observaciones |
| --- | --- | --- |
| Chat entre usuarios registrados | No implementado | No existe servidor de mensajeria. |
| Video en directo via RTSP | No implementado | No hay pipeline de streaming en directo. |
| Conversacion VoIP entre usuarios | No implementado | No hay servidor VoIP ni senalizacion. |

## 5. Lo que si esta implementado en codigo

### API y servidor

- Arranque del servidor Express en `index.js`.
- Configuracion base en `app/app.js` con `cors` y `body-parser`.
- Rutas declaradas para autenticacion, usuarios y videos.

### Usuarios y autenticacion

- `POST /signup` crea usuarios.
- `POST /login` autentica por email y password.
- Las contrasenas se cifran con `bcrypt`.
- Se genera JWT al iniciar sesion.
- Hay modelo `user` en Sequelize con `name`, `email`, `username`, `password` e `icon`.

### Base de datos

- Configuracion MySQL en `app/config/db.config.js`.
- Conexion Sequelize en `app/models/db.js`.
- Sincronizacion automatica con `sequelize.sync()` al arrancar.

### Procesado multimedia

- Conversion de video a MP4 con `ffmpeg`.
- Extraccion automatica de miniatura PNG con `ffmpeg`.
- Generacion de contenido MPEG-DASH con `manifest.mpd` y segmentos `.m4s`.
- Script `script_encoding.sh` para generar 3 representaciones de video.

### Validacion

- Validacion backend para `title` y `description` al crear videos mediante `express-validator`.

## 6. Limitaciones y problemas detectados en la implementacion actual

Esta seccion es importante porque varias cosas aparecen como hechas, pero todavia no se comportan como una entrega funcional completa.

### Bloqueos criticos

1. Las rutas de usuario que dependen de sesion no estan protegidas.
   - `PUT /user`, `PUT /user/upload` y `DELETE /user` leen `req.user.id`.
   - En `app/routes/user.routes.js` no se aplica `auth.verifyToken`.
   - Resultado: esas rutas fallaran o se comportaran de forma incorrecta.

2. Falta validacion real del pipeline completo en entorno de ejecucion.
   - El backend ya genera MP4, miniatura y DASH.
   - Pero aun no esta comprobado de extremo a extremo con MySQL, `ffmpeg`, subida real y reproduccion desde cliente.

3. No existe frontend para consumir el manifiesto DASH.
   - El backend expone el `manifest.mpd`.
   - Pero todavia no hay reproductor con `dash.js` o similar.

### Problemas relevantes, aunque no bloqueen el arranque

- `docker-compose.yml` solo levanta un backend y sigue nombrado como servicio de libros.
- `Dockerfile` usa `node:12`, no instala `ffmpeg` y no prepara entorno para MySQL ni nginx.
- No hay asociaciones Sequelize entre usuarios y videos.
- Falta confirmar en pruebas reales la persistencia correcta de rutas procesadas en todos los casos.
- No hay almacenamiento ni subida real de iconos de usuario.
- No hay manejo de errores consistente en todos los controladores.
- Los tests en `test/` son de una API de libros (`/books`) y no corresponden a este proyecto.

## 7. API disponible en el codigo actual

### Autenticacion

- `POST /signup`
  - Registra un usuario.
- `POST /login`
  - Devuelve usuario y token JWT.

### Usuarios

- `GET /user`
  - Lista usuarios.
- `GET /user/:id`
  - Obtiene un usuario por id.
- `PUT /user`
  - Pretende actualizar el usuario autenticado, pero falta proteger la ruta.
- `PUT /user/upload`
  - Reservada para icono de usuario; la logica aun no esta implementada.
- `DELETE /user`
  - Pretende borrar el usuario autenticado, pero falta proteger la ruta.

### Videos

- `GET /video`
  - Lista videos.
- `GET /video/:id`
  - Obtiene un video.
- `GET /video/user/:userId`
  - Filtra videos por usuario.
- `POST /video`
  - Crea metadatos de video; requiere autenticacion.
- `PUT /video/:id`
  - Actualiza titulo y descripcion; requiere autenticacion y propiedad.
- `DELETE /video/:id`
  - Borra el video logico; requiere autenticacion y propiedad.
- `POST /video/:id/upload`
  - Sube archivo y lanza recodificacion a MP4, miniatura y generacion MPEG-DASH.

## 8. Dependencias principales

- `express`
- `sequelize`
- `mysql2`
- `multer`
- `bcrypt`
- `jsonwebtoken`
- `express-validator`
- `cors`
- `body-parser`
- `ffmpeg` como dependencia de sistema, no de npm

## 9. Como arrancar el proyecto hoy

### Requisitos previos

- Node.js y npm.
- MySQL accesible con las variables:
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_USER`
  - `DATABASE_PASSWORD`
  - `DATABASE_NAME`
- `ffmpeg` instalado en el sistema.

### Comandos

```bash
npm install
npm start
```

### Limitaciones del arranque actual

- Si no hay MySQL, el backend no funcionara correctamente.
- Si no estan instalados `ffmpeg` y `ffprobe`, el procesado de video y DASH fallara.
- `npm test` no valida este proyecto; los tests estan desactualizados.

## 10. Trabajo pendiente priorizado

### Prioridad 1: dejar operativo el backend

- Proteger con middleware las rutas privadas de usuario.
- Validar en pruebas reales la persistencia de `path`, `thumbnail` y `dash`.
- Implementar borrado real de videos y, si procede, de ficheros asociados.

### Prioridad 2: completar el pipeline multimedia

- Probar la generacion MPEG-DASH con videos reales.
- Verificar el manifiesto y segmentos en navegador y reproductor compatible.
- Ajustar perfiles/calidades si hiciera falta segun los videos del proyecto.

### Prioridad 3: preparar despliegue

- Rehacer `Dockerfile` con una imagen moderna y `ffmpeg`.
- Rehacer `docker-compose.yml` con:
  - backend
  - mysql
  - nginx
- Definir volumenes para videos, miniaturas y DASH.

### Prioridad 4: construir el frontend

- Pagina de inicio con listado de videos y miniaturas.
- Registro de usuario.
- Login.
- Formulario de subida.
- Reproductor HTML5.
- Reproductor DASH.
- Maquetacion con Bootstrap.

### Prioridad 5: adicionales

- Buscador de videos.
- Filtros `ffmpeg`.
- Listas de reproduccion automaticas.
- Grabacion con WebRTC.

## 11. Estado resumido

### Hecho

- Estructura base del backend en Express.
- Rutas de autenticacion, usuario y video.
- Modelos Sequelize para usuario y video.
- Registro con hash de contrasena.
- Login con JWT.
- Verificacion JWT funcional en rutas protegidas de video.
- Validacion backend del alta de videos.
- Conversion a MP4 y extraccion de miniatura con `ffmpeg`.
- Generacion backend de MPEG-DASH en 3 calidades.
- Almacenamiento configurable en `storage/` en lugar de rutas fijas de Windows.

### Parcial

- Base de datos MySQL.
- Autenticacion real.
- Subida y procesado de videos.
- Filtrado por usuario.
- Docker.
- Streaming DASH.

### Pendiente

- Frontend completo.
- Integracion funcional extremo a extremo.
- Tests del servicio de videos.
- Videos precargados del equipo.
- Funciones adicionales.

## 12. Conclusiones

El repositorio ya no es una plantilla vacia: tiene una base backend valida para seguir construyendo el servicio. La parte de generacion backend de MPEG-DASH ya esta implementada, pero el proyecto todavia no puede considerarse una entrega funcional completa del sistema tipo YouTube Shorts porque faltan la interfaz web, la validacion extremo a extremo, el reproductor DASH en cliente y la puesta a punto de despliegue.

La siguiente fase recomendable es estabilizar primero el backend real y el almacenamiento, y despues montar frontend y despliegue.
