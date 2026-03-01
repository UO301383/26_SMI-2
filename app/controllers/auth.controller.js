// Auth controller

const User = require('../models/user.model');

// Registrar un nuevo usuario (POST /signup)
module.exports.signup = async (req, res, next) => {
    try {
        // En una app real aquí encriptaríamos la contraseña antes de guardarla.
        // Por ahora, usamos la función create de nuestro modelo.
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            icon: '' // El icono se subirá más adelante en otra ruta
        });
        
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

// Iniciar sesión (POST /login)
module.exports.login = async (req, res, next) => {
    try {
        const users = await User.findAll();
        const user = users.find(u => u.email === req.body.email && u.password === req.body.password);
        
        if (!user) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        // ¡NUEVO! Generamos un token simulado con su ID para que lo copie en Postman
        const simulatedToken = `token-del-usuario-${user.id}`;

        res.status(200).json({
            message: "Login correcto",
            user: user,
            token: simulatedToken // Aquí le damos el token
        });

    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};