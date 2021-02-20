module.exports = app => {
    const controller = require("../controllers/book.controller");
    const validator = require('../middlewares/validators/book.validator');
    const baseRoute = '/books'

    app.get(`${baseRoute}`, controller.getAll);

    app.post(`${baseRoute}`, validator.validateBook, controller.create);

    app.get(`${baseRoute}/:id`, controller.get);
};