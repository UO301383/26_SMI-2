// Comment model

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('comment', {
        id: {
            type:          Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey:    true
        },
        text: {
            type:      Sequelize.STRING,
            allowNull: false
        },
        userId: {
            type:      Sequelize.INTEGER,
            allowNull: false
        },
        videoId: {
            type:      Sequelize.INTEGER,
            allowNull: false
        }
    });
};
