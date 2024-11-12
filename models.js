require('dotenv').config();
const { PostgresDialect } = require('@sequelize/postgres');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.PGDATABASE, 
    process.env.PGUSER, 
    process.env.PGPASSWORD, 
    {
        host: process.env.PGHOST,
        dialect: 'postgres',
        port: process.env.PGPORT,
    },
);

// const sequelize = new Sequelize(
//     {
//         dialect: 'sqlite',
//         storage: 'db/app.db',
//     }
// )

// const sequelize = new Sequelize({
//     dialect: 'postgres',
//     username: process.env.PGUSER,
//     host: process.env.PGHOST,
//     port: 5432,
//     password: process.env.PGPASSWORD,
//     database: process.env.POSTGRES_DB,
// });


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