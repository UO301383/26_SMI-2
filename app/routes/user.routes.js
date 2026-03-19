// User routes

module.exports = app => {
    const controller = require("../controllers/user.controller");
    const auth = require('../middlewares/auth.middleware');
    const baseRoute = '/user';
    
    // Consultar todos los usuarios (GET /user)
    app.get(`${baseRoute}`, controller.getAll);   
        
    // Consultar un usuario por id (GET /user/:id)
    app.get(`${baseRoute}/:id`, controller.get);                            

    // --- RUTAS PROTEGIDAS (Actúan sobre el usuario en sesión, no llevan :id) ---

    // Actualizar datos del usuario en sesión (PUT /user)
    app.put(`${baseRoute}`, auth.verifyToken, controller.update);

    // Subir icono del usuario en sesión (PUT /user/upload)
    app.put(`${baseRoute}/upload`, auth.verifyToken, controller.uploadIcon);

    // Borrar usuario en sesión (DELETE /user)
    app.delete(`${baseRoute}`, auth.verifyToken, controller.delete);
};
