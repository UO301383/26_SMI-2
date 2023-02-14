const Book = require('../models/book.model');


// Retrieve all books
module.exports.getAll = async (req, res, next) => {
    // We should query the database
    const books = await Book.findAll();
    res.status(200).json(books);
};

// Create a new book
module.exports.create = async (req, res, next) => {
    // No validation needed
    const book = await Book.create( { title: req.body.title, author: req.body.author } );
    res.status(201).json(book);
};

// Get an existing book by id
module.exports.get = async (req, res, next) => {
    // No validation needed
    const book = await Book.findById( req.params.id );
    if (book) {
        res.status(200).json(book);
    }
    else {
        res.status(404).end();
    }    
};
