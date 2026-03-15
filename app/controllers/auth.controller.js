// Auth controller

const db = require('../models/db.js');
const User = db.User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth.config.js');
const SECRET_KEY = authConfig.secret;

// Registrar un nuevo usuario (POST /signup)
module.exports.signup = async (req, res, next) => {
    try {
        // 1. Comprobamos que no exista ya un usuario con ese email
        const existingUser = await User.findOne({ where: { email: req.body.email } });
        if (existingUser) {
            return res.status(409).json({ error: "Ya existe un usuario con ese email." });
        }

        // 2. Ciframos la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(req.body.password, authConfig.salt);

        // 3. Creamos el usuario con la contraseña cifrada
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            icon: ''
        });

        // 4. Respondemos sin devolver la contraseña
        const { password, ...userWithoutPassword } = newUser.dataValues;
        res.status(201).json(userWithoutPassword);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar el usuario." });
    }
};

// Iniciar sesión (POST /login)
module.exports.login = async (req, res, next) => {
    try {
        // 1. Buscamos el usuario por email
        const user = await User.findOne({ where: { email: req.body.email } });

        if (!user) {
            return res.status(401).json({ error: "Credenciales incorrectas." });
        }

        // 2. Comparamos la contraseña recibida con la cifrada en la base de datos
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Credenciales incorrectas." });
        }

        // 3. Generamos un token JWT real con el id del usuario
        const token = jwt.sign(
            { id: user.id },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        // 4. Respondemos con el token y los datos del usuario (sin la contraseña)
        const { password, ...userWithoutPassword } = user.dataValues;
        res.status(200).json({
            message: "Login correcto.",
            user: userWithoutPassword,
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar sesión." });
    }
};