// Middleware de autenticación simulada

module.exports.verifyToken = (req, res, next) => {
    // 1. Buscamos el token en las cabeceras de la petición (Postman)
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado: No has enviado ningún token." });
    }

    try {
        // 2. Simulamos que desencriptamos el token. 
        // Nuestro token de prueba será algo como "token-del-usuario-1"
        // Al separarlo por guiones, cogemos el último trozo (el ID)
        const parts = token.split('-');
        const userId = parts[parts.length - 1]; 

        // 3. ¡LA MAGIA! Rellenamos la variable req.user para que el controlador la pueda usar
        req.user = {
            id: parseInt(userId)
        };

        // 4. Le decimos a Express que deje pasar la petición al controlador
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido." });
    }
};