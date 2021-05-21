const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = (queryObject) => {
  let searchQuery = {};
  for (const property in queryObject) {
    if (property !== 'page' && property !== 'pageSize') {
      if(queryObject[property] === "") {
        searchQuery[property] = {
          [Op.or]: {
            [Op.like] : '%' + queryObject[property].trim() + '%',
            [Op.eq]: null
          }
        };
      }
      else {
        searchQuery[property] = {[Op.like] : '%' + queryObject[property].trim() + '%'};
      }
    }
    /*if(property === 'class') {
      searchQuery[property] = queryObject[property] === "" ? {[Op.like] : '%%'} : queryObject[property];
    }*/
  }
  return searchQuery;
};