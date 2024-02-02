// Book model

// declare an array of book objects
const books = [];

// Operations to manage the book objects
module.exports.create = (data) => {
    const id = books.length + 1;
    const book = { id: id, title: data.title, author: data.author }; 
    books.push(book);
    return Promise.resolve(book);
};

module.exports.findAll = () => {
    return Promise.resolve(books);    
};

module.exports.findById = (id) => {
    const book = books.find(book => book.id == id);
    return Promise.resolve(book);
}

module.exports.drop = () => {
    books.length = 0;
    return Promise.resolve();
}