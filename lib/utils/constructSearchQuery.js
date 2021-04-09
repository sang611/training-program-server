const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = (queryObject) => {
  let searchQuery = {};
  for (const property in queryObject) {
    if (property !== 'page' && property !== 'pageSize') {
      searchQuery[property] = {[Op.like] : '%' + queryObject[property].trim().toLowerCase() + '%'};
    }
  }
  return searchQuery;
};