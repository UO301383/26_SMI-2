// Video controller

// Importamos el modelo de video
const Video = require('../models/video.model');

// Importamos las funciones de FFmpeg (asegúrate de que la ruta coincida con donde lo guardaste)
const encoder = require('../utils/encoding_video');

// Consultar todos los vídeos (GET /video) 
module.exports.getAll = async (req, res, next) => {
    const videos = await Video.findAll();
    res.status(200).json(videos);
};

// Crear un nuevo vídeo (POST /video) 
module.exports.create = async (req, res, next) => {
    // Preparamos los datos del vídeo
    const videoData = { 
        title: req.body.title, 
        description: req.body.description,
        userId: req.user.id, // Asignado automáticamente por el backend 
        thumbnail: '', // Estos campos se rellenarán más adelante al subir el archivo
        path: '', 
        dash: '' 
    };

    const video = await Video.create(videoData);
    res.status(201).json(video);
};

// Consultar un vídeo por su id (GET /video/:id) 
module.exports.get = async (req, res, next) => {
    const video = await Video.findById(req.params.id);
    if (video) {
        res.status(200).json(video);
    } else {
        res.status(404).end();
    }    
};

// Consultar los vídeos de un usuario concreto (GET /video/user/:userId)
module.exports.getByUser = async (req, res, next) => {
    const videos = await Video.findAll();
    // Filtramos el array completo para quedarnos solo con los del userId indicado en la URL
    const userVideos = videos.filter(v => v.userId == req.params.userId);
    res.status(200).json(userVideos);
};

// Actualizar datos de un vídeo (PUT /video/:id)
module.exports.update = async (req, res, next) => {
    const video = await Video.findById(req.params.id);
    if (!video) {
        return res.status(404).end();
    }
    
    // COMPROBACIÓN DE SEGURIDAD: ¿Es el creador? 
    if (video.userId !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para modificar este vídeo" });
    }
    
    // Si es el creador, actualizamos los datos
    video.title = req.body.title || video.title;
    video.description = req.body.description || video.description;
    
    res.status(200).json(video);
};

// Borrar un vídeo (DELETE /video/:id)
module.exports.delete = async (req, res, next) => {
    const video = await Video.findById(req.params.id);
    if (!video) {
        return res.status(404).end();
    }
    
    // COMPROBACIÓN DE SEGURIDAD: ¿Es el creador? 
    if (video.userId !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para borrar este vídeo" });
    }
    
    // Nota: Para borrarlo realmente de la memoria, más adelante añadiremos un método 'delete' en video.model.js
    res.status(204).end(); // 204 significa "No Content" (indica que se ha borrado con éxito)
};

// Subir archivo de vídeo y procesarlo con FFmpeg (POST /video/:id/upload)
module.exports.upload = async (req, res, next) => {
    const video = await Video.findById(req.params.id);
    if (!video) {
        return res.status(404).end();
    }
    
    // COMPROBACIÓN DE SEGURIDAD: ¿Es el creador?
    if (video.userId !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para subir un archivo a este vídeo" });
    }

    // Comprobamos si la petición incluye un archivo
    // (req.file es la variable donde librerías como 'multer' guardan el archivo subido)
    if (!req.file) {
        return res.status(400).json({ error: "No se ha enviado ningún archivo de vídeo" });
    }

    try {
        // Definimos las rutas de entrada y salida basándonos en tu disco S:
        // req.file.path es donde el servidor guardó temporalmente el vídeo al recibirlo (ej: S:/uploads/video-1.avi)
        const inputVideoPath = req.file.path; 
        
        // Rutas finales donde FFmpeg dejará los archivos procesados
        const outputVideoPath = `S:/videos/video-${video.id}.mp4`;
        const outputThumbnailPath = `S:/videos/video-${video.id}.png`;
        const outputDashContentPath = `S:/videos/video-${video.id}`; // Carpeta para los trozos DASH

        // 1. Recodificar a MP4
        console.log("Iniciando recodificación a MP4...");
        await encoder.encodeMp4(inputVideoPath, outputVideoPath);
        
        // 2. Extraer fotograma (miniatura)
        console.log("Extrayendo miniatura...");
        await encoder.getThumbnail(outputVideoPath, outputThumbnailPath);
        
        // 3. Generar contenido DASH
        // Nota: Solo descomenta esta línea si ya tienes el archivo 'script_encoding.sh' en tu proyecto, 
        // si no, dará error porque no encontrará el script de bash.
        // console.log("Generando formato DASH...");
        // await encoder.encodeDash(outputVideoPath, outputDashContentPath);

        // Actualizamos nuestro "modelo" en la base de datos con las nuevas rutas
        video.path = `/videos/video-${video.id}.mp4`;
        video.thumbnail = `/videos/video-${video.id}.png`;
        video.dash = `/videos/video-${video.id}/manifest.mpd`; // Archivo principal de DASH

        // Respondemos al usuario con los datos actualizados del vídeo
        res.status(200).json(video);

    } catch (error) {
        console.error("Error al procesar el vídeo con FFmpeg:", error);
        res.status(500).json({ error: "Error interno al procesar el vídeo" });
    }
};