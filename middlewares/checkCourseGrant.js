const Employee = require("../models/Employee");
const EmployeeCourse = require("../models/EmployeeCourse");
const messages = require("../lib/constants/messages");

module.exports = async (req, res, next) => {
    try {


        if (req.role === 2) {
            const employeeUuid = await Employee.findOne({
                where: {
                    accountUuid: req.uuid
                },
                attributes: ["uuid"],
                raw: true
            })
            const isModerator = await EmployeeCourse.findOne({
                where: {
                    employeeUuid: employeeUuid.uuid,
                    courseUuid: req.params.courseUuid
                },
                attributes: ["isModerator"],
                raw: true
            })

            if ((isModerator && !isModerator.isModerator) || !isModerator) {
                return res.status(403).json({
                    message: messages.MSG_FORBIDDEN
                })
            } else {
                next();
            }
        } else next();
    } catch (e) {
        return res.status(500).json({
            message: "Đã có lỗi xảy ra"
        })
    }
}