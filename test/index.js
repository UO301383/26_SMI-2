// Node.js test application

// Import modules
const app = require('../app/app');
let server;

// Wait for Express to be running
before(done => {
    server = app.listen(4000, done);
});

require('./routes/book.routes.test');

// Shutdown server
after(done => {
    server.close(done);
});
