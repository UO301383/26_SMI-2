const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();

// Avoid issues with CORS
app.use(cors());

// Parse requests of content-type: application/json
app.use(bodyParser.json());

// Parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('This is an API to a book store');
});

// Routes
require("./routes/book.routes.js")(app);

module.exports = app;
