const Employee = require("../models/Employee");
const EmployeeCourse = require("../models/EmployeeCourse");
const messages = require("../lib/constants/messages");

module.exports = async (req, res, next) => {
    if (req.role === 2 || req.role === 1) {
        const employeeUuid = await Employee.findOne({
            where: {
                accountUuid: req.uuid
            },
            attributes: ["uuid"]
        })
        const isModerator = await EmployeeCourse.findOne({
            where: {
                employeeUuid: employeeUuid.dataValues.uuid,
                courseUuid: req.params.courseUuid
            },
            attributes: ["isModerator"]
        })

        if (!isModerator.dataValues.isModerator) {
            return res.status(403).json({
                message: messages.MSG_FORBIDDEN
            })
        } else {
            next();
        }
    }
    else next();
}