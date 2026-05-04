// User controller

const db = require('../models/db.js');
const User = db.User;
const fs = require('fs');
const path = require('path');
const storageConfig = require('../config/storage.config.js');

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
        if (!req.file) {
            return res.status(400).json({ error: "No se ha subido ningún archivo." });
        }
        const filename = 'user-' + user.id + '.jpg';
        const rutaDestino = path.join(storageConfig.usersDir, filename);
        fs.mkdirSync(storageConfig.usersDir, { recursive: true });
        fs.copyFileSync(req.file.path, rutaDestino);
        fs.unlinkSync(req.file.path);
        await user.update({ icon: '/users/' + filename });
        res.status(200).json({ icon: '/users/' + filename });
    } catch (error) {
        console.error('uploadIcon error:', error);
        res.status(500).json({ error: "Error al subir el icono del usuario." });
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