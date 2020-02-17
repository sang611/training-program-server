const Sequelize = require('sequelize');
const connection = {};
const env = 'dev';
const config = require('./config.json')[env];

const sequelize = new Sequelize(
  config.database, 
  config.user,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    pool: config.pool
  } 
);

sequelize.sync({  
  force: false
});

connection.sequelize = sequelize;

module.exports = connection;