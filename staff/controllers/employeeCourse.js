const Employee = require("../../models/Employee");
const EmployeeCourse = require("../../models/EmployeeCourse");
const connection = require("../../database/connection");
const messages = require("../../lib/constants/messages");
const constants = require("../../lib/constants/constants");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.assignCourse = async (req, res) => {
    let transaction;
    try {
        const employee = await Employee.findOne({
            where: {
                uuid: req.body.employeeUuid
            }
        })

        if (employee) {
            let employeeCourses = [];
            transaction = await connection.sequelize.transaction();
            req.body.courses.forEach(courseUuid => {
                employeeCourses.push({
                    employeeUuid: req.body.employeeUuid,
                    courseUuid: courseUuid
                })
            })

            await EmployeeCourse.destroy({
                where:  {
                    [Op.and] :
                        {
                            employeeUuid: req.body.employeeUuid,
                            courseUuid: {
                                [Op.notIn]: req.body.courses
                            }
                        }
                }
            }, {transaction})

            await Promise.all(
                req.body.courses.map(async courseUuid => {

                    let employee_course = await EmployeeCourse.findOne({
                        where: {
                            employeeUuid: req.body.employeeUuid,
                            courseUuid: courseUuid
                        }
                    }, {transaction})


                    if(!employee_course) {
                        await EmployeeCourse.create({
                            employeeUuid: req.body.employeeUuid,
                            courseUuid: courseUuid
                        }, {transaction})
                    }
                    await transaction.commit()
                })
            )

            return res.status(201).json({
                message: messages.MSG_SUCCESS
            })
        } else {
            return res.status(404).json({
                message: messages.MSG_NOT_FOUND,
            });
        }
    } catch (e) {
        console.log(e)
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    message: e.toString(),
                });
            }
        }
        res.status(500).json({
            message: messages.MSG_CANNOT_ASSIGN + constants.COURSE + e,
        });
    }

}

exports.grantModerator = async (req, res) => {
    const employeeUuid = req.body.employeeUuid,
        courseUuid = req.body.courseUuid,
        isModerator = req.body.isModerator
    let transaction;
    try {
        transaction = await connection.sequelize.transaction()
        const employee_course = await EmployeeCourse.findOne({
            employeeUuid,
            courseUuid
        })
        if(employee_course) {
            await EmployeeCourse.update(
                {isModerator},
                {
                    where: {
                        employeeUuid,
                        courseUuid
                    }
                }, {transaction})

            await transaction.commit();
            res.status(200).json({
                message: messages.MSG_GRANT_SUCCESS + constants.COURSE
            })
        }
        else {
            res.status(409).json({
                message: messages.MSG_NOT_FOUND + constants.EMPLOYEE
            })
        }

    } catch (e) {
        console.log(e)
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    message: e.toString(),
                });
            }
        }
        res.status(500).json({
            message: messages.MSG_GRANT_FAIL + constants.COURSE + e,
        });
    }
}