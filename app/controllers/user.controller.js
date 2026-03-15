// User controller

const db = require('../models/db.js');
const User = db.User;

// Consultar todos los usuarios (GET /user)
module.exports.getAll = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los usuarios." });
    }
};

// Consultar un usuario por id (GET /user/:id)
module.exports.get = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el usuario." });
    }
};

// Actualizar datos del usuario en sesión (PUT /user)
module.exports.update = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).end();
        }

        await user.update({
            name:     req.body.name     || user.name,
            email:    req.body.email    || user.email,
            username: req.body.username || user.username
        });

        const { password, ...userWithoutPassword } = user.dataValues;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el usuario." });
    }
};

// Subir icono del usuario en sesión (PUT /user/upload)
module.exports.uploadIcon = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).end();
        }
        res.status(200).json({ message: "Lógica de subida de icono pendiente" });
    } catch (error) {
        res.status(500).json({ error: "Error al subir el icono." });
    }
};

// Borrar usuario en sesión (DELETE /user)
module.exports.delete = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).end();
        }

        await user.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: "Error al borrar el usuario." });
    }
};