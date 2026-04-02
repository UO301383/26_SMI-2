// Comment controller

const db = require('../models/db.js');
const Comment = db.Comment;

// Consultar los comentarios de un vídeo (GET /comment/video/:videoId)
module.exports.getByVideo = async (req, res, next) => {
    try {
        const comments = await Comment.findAll({
            where: { videoId: req.params.videoId }
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los comentarios." });
    }
};

// Crear un comentario (POST /comment)
module.exports.create = async (req, res, next) => {
    try {
        const comment = await Comment.create({
            text:    req.body.text,
            userId:  req.user.id,
            videoId: req.body.videoId
        });
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el comentario." });
    }
};

// Borrar un comentario (DELETE /comment/:id)
module.exports.delete = async (req, res, next) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        if (!comment) {
            return res.status(404).end();
        }

        // Solo puede borrar el autor del comentario
        if (comment.userId !== req.user.id) {
            return res.status(403).json({ error: "No tienes permiso para borrar este comentario." });
        }

        await comment.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: "Error al borrar el comentario." });
    }
};