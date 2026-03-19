// Video routes

module.exports = app => {
    const controller = require("../controllers/video.controller");
    const validator = require('../middlewares/validators/video.validator'); 
    const storageConfig = require('../config/storage.config.js');
    
    // IMPORTAMOS EL MULTER
    const multer = require('multer');
    const upload = multer({ dest: storageConfig.uploadsDir }); 

    // ¡NUEVO! IMPORTAMOS NUESTRO PORTERO DE AUTENTICACIÓN
    const auth = require('../middlewares/auth.middleware');
    
    const baseRoute = '/video'; 
    
    // RUTAS PÚBLICAS (Cualquiera puede verlas sin token)
    app.get(`${baseRoute}`, controller.getAll);                             
    app.get(`${baseRoute}/:id`, controller.get);                            
    app.get(`${baseRoute}/user/:userId`, controller.getByUser);
    app.get(`${baseRoute}/playlist`, controller.getPlaylist);

    // --- RUTAS PROTEGIDAS (Necesitan pasar por auth.verifyToken) ---
    
    // Crear un nuevo vídeo (Añadimos el auth antes del validator)
    app.post(`${baseRoute}`, auth.verifyToken, validator.validateVideo, controller.create);    

    // Actualizar datos de un vídeo
    app.put(`${baseRoute}/:id`, auth.verifyToken, controller.update);

    // Borrar un vídeo
    app.delete(`${baseRoute}/:id`, auth.verifyToken, controller.delete);

    // Subir archivo de vídeo 
    app.post(`${baseRoute}/:id/upload`, auth.verifyToken, upload.single('video'), controller.upload);
};
