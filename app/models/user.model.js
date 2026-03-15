module.exports = (sequelize, Sequelize) => {
    return sequelize.define('user', {
        id: {
            type:          Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey:    true
        },
        name: {
            type:      Sequelize.STRING,
            allowNull: true
        },
        email: {
            type:      Sequelize.STRING,
            allowNull: true,
            unique:    true
        },
        username: {
            type:      Sequelize.STRING,
            allowNull: false,
            unique:    true
        },
        password: {
            type:      Sequelize.STRING,
            allowNull: false
        },
        icon: {
            type:         Sequelize.STRING,
            allowNull:    true,
            defaultValue: ''
        }
    });
};