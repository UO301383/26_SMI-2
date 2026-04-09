// Comment routes

module.exports = app => {
    const controller = require('../controllers/comment.controller');
    const auth = require('../middlewares/auth.middleware');

    const baseRoute = '/comment';

    // Ruta pública — cualquiera puede ver los comentarios de un vídeo
    app.get(`${baseRoute}/video/:videoId`, controller.getByVideo);

    // Rutas protegidas — necesitan token
    app.post(`${baseRoute}`, auth.verifyToken, controller.create);
    app.delete(`${baseRoute}/:id`, auth.verifyToken, controller.delete);
    app.put(`${baseRoute}/:id`, auth.verifyToken, controller.update);
};