// Comment controller

const db = require('../models/db.js');
const Comment = db.Comment;
const User = db.User;

// Consultar los comentarios de un vídeo (GET /comment/video/:videoId)
module.exports.getByVideo = async (req, res, next) => {
    try {
        const comments = await Comment.findAll({
            where: { videoId: req.params.videoId },
            order: [['createdAt', 'ASC']],
            include: [{ 
                model: User, 
                attributes: ['username', 'icon'] }],
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
        const commentConAutor = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                attributes: ['username', 'icon']
            }]
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
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: "No tienes permiso para borrar este comentario." });
        }

        await comment.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: "Error al borrar el comentario." });
    }
};

// Editar un comentario (PUT /comment/:id)
module.exports.update = async (req, res, next) => {
    try{
        const comment = await Comment.findByPk(req.params.id);
        if(!comment) {
            return res.status(404).end();
        }

        // Solo puede editar un comentario el autor del comentario
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({error: "No tienes permiso para editar este comentario"})
        }

        // Si es el autor editamos el comentario
        comment.text = req.body.text;
        await comment.save();
        res.status(200).json(comment);


    }catch (error) {
        res.status(500).json({ error: "Error al editar el comentario." })
    }

}