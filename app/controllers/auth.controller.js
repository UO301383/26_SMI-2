// Auth controller

const db = require('../models/db.js');
const User = db.User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const authConfig = require('../config/auth.config.js');
const SECRET_KEY = authConfig.secret;

const OPENFIRE_HOST = process.env.OPENFIRE_HOST || 'localhost';
const OPENFIRE_URL = `http://${OPENFIRE_HOST}:9090/plugins/restapi/v1`;
const OPENFIRE_SECRET = process.env.OPENFIRE_SECRET || 'secretkey';

const openfireHeaders = {
    'Authorization': OPENFIRE_SECRET,
    'Content-Type': 'application/json'
};

async function ensureOpenfireUser({ username, password, name, email }) {
    const userData = {
        username,
        password,
        name: name || username,
        email
    };

    try {
        await axios.post(`${OPENFIRE_URL}/users`, userData, { headers: openfireHeaders });
        return true;
    } catch (error) {
        const status = error.response && error.response.status;

        if (status === 409 || status === 400) {
            try {
                await axios.put(`${OPENFIRE_URL}/users/${encodeURIComponent(username)}`, userData, { headers: openfireHeaders });
                return true;
            } catch (updateError) {
                console.warn("No se pudo actualizar el usuario en Openfire:", updateError.message);
                return false;
            }
        }

        console.warn("No se pudo crear el usuario en Openfire:", error.message);
        return false;
    }
}


// Registrar un nuevo usuario (POST /signup)
module.exports.signup = async (req, res, next) => {
    try {
        // 1. Comprobamos que no exista ya un usuario con ese email 
        const existingUser = await User.findOne({ where: { email: req.body.email } });
        if (existingUser) {
            return res.status(409).json({ error: "Ya existe un usuario con ese email." });
        }

        // 2. Comprobamos que no exista ya un usuario con ese username
        const existingName = await User.findOne({ where: { username: req.body.username } });
        if (existingName) {
            return res.status(409).json({ error: "Este nombre de usuario ya esta en uso."})
        }

        // 3. Ciframos la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(req.body.password, authConfig.salt);

        // 4. Creamos el usuario con la contraseña cifrada
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            icon: ''
        });

        // 5. Creamos el usuario en Openfire para el chat
        await ensureOpenfireUser({
            username: req.body.username,
            password: req.body.password,
            name:     req.body.name,
            email:    req.body.email
        });

        // 6. Respondemos sin devolver la contraseña
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

        const xmppReady = await ensureOpenfireUser({
            username: user.username,
            password: req.body.password,
            name:     user.name,
            email:    user.email
        });

        // 4. Respondemos con el token y los datos del usuario (sin la contraseña)
        const { password, ...userWithoutPassword } = user.dataValues;
        res.status(200).json({
            message: "Login correcto.",
            user: userWithoutPassword,
            token: token,
            xmppReady
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar sesión." });
    }
};
