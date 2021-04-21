const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = (queryObject) => {
  let searchQuery = {};
  for (const property in queryObject) {
    if (property !== 'page' && property !== 'pageSize' && property !== 'class') {
      searchQuery[property] = {[Op.like] : '%' + queryObject[property].trim() + '%'};
    }
    if(property === 'class') {
      searchQuery[property] = queryObject[property] === "" ? {[Op.like] : '%%'} : queryObject[property];
    }
  }
  return searchQuery;
};