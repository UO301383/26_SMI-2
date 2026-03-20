// Middleware de autenticación real con JWT

const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config.js');

const SECRET_KEY = authConfig.secret;

module.exports.verifyToken = (req, res, next) => {
    if(!req.headers['authorization']) {
        return res.status(401).json({ error: "Acceso denegado: No has enviado ningún token." });
    }
    // 1. Buscamos el token en las cabeceras de la petición
    const token = req.headers['authorization'].replace('Bearer ', '');
    try {
        // 2. Verificamos y desencriptamos el token con la clave secreta
        const decoded = jwt.verify(token, SECRET_KEY);

        // 3. Guardamos los datos del usuario en req.user para que el controlador los pueda usar
        req.user = {
            id: decoded.id
        };

        // 4. Dejamos pasar la petición al controlador
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
};
