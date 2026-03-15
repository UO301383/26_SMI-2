// Express application

// Import modules
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const db = require('./models/db.js');

const app = express();

// Avoid issues with CORS
app.use(cors());

// Parse requests of content-type: application/json
app.use(bodyParser.json());

// Parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/videos', express.static('S:/videos'));
app.use('/users', express.static('S:/users'));

db.sequelize.sync()
  .then(() => console.log('Base de datos sincronizada'))
  .catch(err => console.log('Error al sincronizar la base de datos: ' + err));

// Mensaje de bienvenida de la API
app.get('/', (req, res) => {
  res.send('This is the API for the Video Streaming Platform');
});

// Routes
require("./routes/video.routes.js")(app);
require("./routes/user.routes.js")(app);
require("./routes/auth.routes.js")(app);

module.exports = app;