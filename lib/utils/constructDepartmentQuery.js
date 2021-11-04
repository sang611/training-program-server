const {Op} = require('sequelize')

module.exports = (department) => {
    return {
        [Op.substring]: department
    }
}