// Database creation 

// Import modules
const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

// Create a connection pool to the database
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    operatorAliases: false,
    logging: false,
    pool: dbConfig.pool
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// carga models
db.video = require('./video.model.js')(sequelize, Sequelize);
db.User = require('./user.model.js')(sequelize, Sequelize);
db.Comment = require('./comment.model.js')(sequelize, Sequelize)

//Cada comentario pertence a un usuario, pero un usuario puede tener muchos comentarios
db.Comment.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Comment, { foreignKey: 'userId' });

module.exports = db;