// Test utils

// Import modules
const Book = require('../../app/models/book.model');

module.exports.populateBooks = async () => {
    await Book.create( { title: 'El guardián entre el centeno', author: 'J.D. Salinger' } );
    await Book.create( { title: 'La vida es sueño', author: 'Calderón de la Barca' } );
}

module.exports.dropBooks = async () => {
    await Book.drop();
}