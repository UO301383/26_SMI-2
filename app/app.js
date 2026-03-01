// Express application

// Import modules
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

app.use('/videos', express.static('S:/videos'));
app.use('/users', express.static('S:/users'));

// Mensaje de bienvenida de la API
app.get('/', (req, res) => {
  res.send('This is the API for the Video Streaming Platform');
});

// Routes
require("./routes/video.routes.js")(app);
require("./routes/user.routes.js")(app);
require("./routes/auth.routes.js")(app);

module.exports = app;