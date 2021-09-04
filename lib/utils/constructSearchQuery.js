const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = (queryObject) => {
  let searchQuery = {};
  for (const property in queryObject) {
    if(property !== "textSearch") {
      if (property !== 'page' && property !== 'pageSize') {
        /*if (queryObject[property] === "") {
          searchQuery[property] = {
            [Op.or]: {
              [Op.like]: "%%",
              [Op.eq]: null
            }
          };
        } else {
          searchQuery[property] = {[Op.like]: '%' + queryObject[property].trim() + '%'};
        }*/

        if(queryObject[property]) {
          searchQuery[property] = {[Op.like]: '%' + queryObject[property].trim() + '%'};
        } else {
          searchQuery[property] = {
            [Op.or]: {
              [Op.like]: "%%",
              [Op.eq]: null
            }
          }
        }

      }


    }
  }
  return searchQuery;
};