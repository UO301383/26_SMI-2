// Chat routes

module.exports = app => {
    const controller = require('../controllers/chat.controller.js');
    const auth = require('../middlewares/auth.middleware.js');

    app.get('/chat/messages', auth.verifyToken, controller.getMessages);
    app.get('/chat/stream', controller.stream);
    app.post('/chat/messages', auth.verifyToken, controller.create);
};
