module.exports = app => {
    const controller = require("../controllers/book.controller");
    const validator = require('../middlewares/validators/book.validator');
    const baseRoute = '/books'

    app.get(`${baseRoute}`, controller.getAll);								// Retrieve all books
    app.post(`${baseRoute}`, validator.validateBook, controller.create);	// Create a new book
    app.get(`${baseRoute}/:id`, controller.get);							// Get an existing book by id
};