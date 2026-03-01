// User controller

const User = require('../models/user.model');

// Consultar todos los usuarios (GET /user)
module.exports.getAll = async (req, res, next) => {
    const users = await User.findAll();
    res.status(200).json(users);
};

// Consultar un usuario por id (GET /user/:id)
module.exports.get = async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).end();
    }
};

// Actualizar datos del usuario en sesión (PUT /user)
module.exports.update = async (req, res, next) => {
    // REGLA DE SEGURIDAD: Usamos req.user.id, NUNCA req.params.id
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return res.status(404).end();
    }

    // Actualizamos los campos permitidos si vienen en la petición
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
    // (Nota: la contraseña suele requerir un tratamiento especial de encriptación)

    res.status(200).json(user);
};

// Subir icono del usuario en sesión (PUT /user/upload)
module.exports.uploadIcon = async (req, res, next) => {
    // REGLA DE SEGURIDAD: Usamos req.user.id
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return res.status(404).end();
    }

    // Aquí irá la lógica para guardar el archivo físico en la carpeta S:\users
    // y actualizar la variable user.icon
    res.status(200).json({ message: "Lógica de subida de icono pendiente" });
};

// Borrar usuario en sesión (DELETE /user)
module.exports.delete = async (req, res, next) => {
    // REGLA DE SEGURIDAD: Usamos req.user.id
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return res.status(404).end();
    }

    // Lógica pendiente para borrar el usuario de la matriz/base de datos
    res.status(204).end();
};