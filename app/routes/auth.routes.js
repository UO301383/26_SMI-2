// Auth routes

module.exports = app => {
    const controller = require("../controllers/auth.controller");
    
    // Registrar un nuevo usuario (POST /signup)
    app.post('/signup', controller.signup);
    
    // Iniciar sesión (POST /login)
    app.post('/login', controller.login);
};