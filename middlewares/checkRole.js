const messages = require('../lib/constants/messages');
const Employee = require("../models/Employee");
const TrainingProgram = require("../models/TrainingProgram");
const Student = require("../models/Student");

module.exports = (role_) => {
    return async (req, res, next) => {
        let {role, department, uuid} = req;
        if (role > role_) {
            return res.status(403).json({
                message: messages.MSG_FORBIDDEN
            });
        }


        next();
    }
}
