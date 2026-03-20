# PeiTube

Servicio de vídeos cortos tipo YouTube Shorts. Backend REST API en Node.js.

## Stack

- Node.js + Express
- MySQL + Sequelize
- JWT + bcrypt
- FFmpeg (MP4, thumbnails, MPEG-DASH)

## Requisitos

- Node.js 18+
- MySQL 8+
- FFmpeg instalado en el sistema

## Instalación

```bash
npm install
```

Crea un archivo `.env` en la raíz

```bash
npm start
```

## API

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/signup` | Registro de usuario |
| POST | `/login` | Login, devuelve JWT |

### Usuarios
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/user` | No | Lista usuarios |
| GET | `/user/:id` | No | Obtiene usuario |
| PUT | `/user` | Sí | Actualiza perfil |
| DELETE | `/user` | Sí | Elimina cuenta |

### Vídeos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/video` | No | Lista vídeos (`?search=`) |
| GET | `/video/playlist` | No | Vídeos listos para reproducir |
| GET | `/video/user/:userId` | No | Vídeos de un usuario |
| GET | `/video/:id` | No | Obtiene vídeo |
| POST | `/video` | Sí | Crea vídeo |
| PUT | `/video/:id` | Sí | Actualiza vídeo |
| DELETE | `/video/:id` | Sí | Elimina vídeo |
| POST | `/video/:id/upload` | Sí | Sube archivo y procesa |

Al subir un vídeo se genera automáticamente: MP4, thumbnail y MPEG-DASH en 3 calidades (240p / 360p / 480p).

## Rutas protegidas

Incluir el token en la cabecera:

```
Authorization: Bearer <token>
```
