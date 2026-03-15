module.exports = (sequelize, Sequelize) => {
    return sequelize.define('video', {
        id: {
            type:          Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey:    true
        },
        title: {
            type:      Sequelize.STRING,
            allowNull: false
        },
        description: {
            type:      Sequelize.STRING,
            allowNull: true
        },
        userId: {
            type:      Sequelize.INTEGER,
            allowNull: false
        },
        thumbnail: {
            type:         Sequelize.STRING,
            allowNull:    true,
            defaultValue: ''
        },
        path: {
            type:         Sequelize.STRING,
            allowNull:    true,
            defaultValue: ''
        },
        dash: {
            type:         Sequelize.STRING,
            allowNull:    true,
            defaultValue: ''
        }
    });
};