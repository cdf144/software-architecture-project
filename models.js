const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    {
        dialect: 'sqlite',
        storage: 'db/app.db'
    }
);

const UrlShortener = sequelize.define('UrlShortener', {
    id: {
        type: DataTypes.STRING(5),
        primaryKey: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }

});

sequelize.sync()
    .then(() => {
        console.log('Database & table created!');
    })
    .catch(err => {
        console.error('Error creating database:', err);
    });

module.exports = {
    UrlShortener
};