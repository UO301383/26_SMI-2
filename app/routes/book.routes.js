// Book routes

module.exports = app => {
    const controller = require("../controllers/book.controller");
    const validator = require('../middlewares/validators/book.validator');
    const baseRoute = '/books'
    
    // Retrieve all books
    app.get(`${baseRoute}`, controller.getAll);								
    // Create a new book
    app.post(`${baseRoute}`, validator.validateBook, controller.create);	
    // Get an existing book by id
    app.get(`${baseRoute}/:id`, controller.get);							
};