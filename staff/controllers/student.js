const Student = require("../../models/Student");
const Account = require("../../models/Account");
const StudentCourse = require("../../models/StudentCourse")
const bcrypt = require("bcrypt");
const saltRounds = require("../../lib/constants/constants").SALT_ROUND;
const connection = require("../../database/connection");
const uuid = require("uuid/v4");
const messages = require("../../lib/constants/messages");
const constants = require("../../lib/constants/constants");
const paginate = require("../../lib/utils/paginate");
const constructSearchQuery = require("../../lib/utils/constructSearchQuery");
const readXlsxFile = require("read-excel-file/node");
const Institution = require("../../models/Institution");
const StudentTrainingProgram = require("../../models/StudentTrainingProgram");
const TrainingProgram = require("../../models/TrainingProgram");
const {Op} = require("sequelize");
const uploadImageToStorage = require('../../lib/utils/uploadToFirebase')

const base64 = require('file-base64')
const path = require('path')

const Major = require("../../models/Major");
const Course = require("../../models/Course");


exports.createStudent = async (req, res) => {
    const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
    const accountUuid = uuid();
    let transaction;
    try {
        const account = await Account.findOne({
            where: {
                username: req.body.vnu_mail,
            },
        });
        if (account) {
            return res.status(409).json({
                message: messages.MSG_USERNAME_EXISTS,
            });
        }
        transaction = await connection.sequelize.transaction();

        await Account.create(
            {
                username: req.body.student_code,
                password: hashPassword,
                uuid: accountUuid,
                role: 3,
            },
            {transaction}
        );

        await Student.create(
            {
                uuid: uuid(),
                fullname: req.body.fullname,
                gender: req.body.gender,
                birthday: req.body.birthday,
                address: req.body.address,
                student_code: req.body.student_code,
                class: req.body.class,
                email: req.body.email,
                vnu_mail: req.body.vnu_mail,
                phone_number: req.body.phone_number,
                class: req.body.class,
                note: req.body.note,
                accountUuid: accountUuid,
                trainingProgramUuid: req.body.trainingProgramUuid,
                majorUuid: req.body.majorUuid
            },
            {transaction}
        );
        await transaction.commit();
        res.status(200).json({
            message: messages.MSG_SUCCESS,
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    error: e.toString(),
                });
            }
        }
        res.status(500).json({
            message: messages.MSG_CANNOT_CREATE + constants.STUDENT + error,
        });
    }
};

exports.createStudentsByFile = async (req, res) => {
    let filePath =
        "./public/uploads/" + req.file.filename;
    let listStudents = [];
    let listAccounts = [];
    let transaction;
    readXlsxFile(filePath)
        .then(async (rows) => {
            rows.shift();
            try {
                await Promise.all(
                    rows.map(async (row) => {
                    })
                );

                await Promise.all(
                    rows.map(async (row) => {

                        const account = await Account.findOne({
                            where: {
                                username: row[1],
                            },
                        });
                        if (!account) {


                            const accountUuid = uuid();

                            const hashPassword = await bcrypt.hash(
                                row[1].toString(),
                                saltRounds
                            );

                            const newAccount = {
                                username: row[1],
                                password: hashPassword,
                                uuid: accountUuid,
                                role: 3,
                            };

                            listAccounts.push(newAccount);

                            const classCode = row[6].split("CQ-")[1];

                            const trainingProgram = await TrainingProgram.findOne(
                                {
                                    where: {
                                        classes: {
                                            [Op.like]: '%' + classCode + '%'
                                        }
                                    }
                                }
                            );

                            const major = await Major.findOne({
                                where: {
                                    code: trainingProgram.training_program_code
                                }
                            })

                            const newStudent = {
                                uuid: uuid(),
                                fullname: row[2],
                                birthday: readXlsxFile.parseExcelDate(row[3]),
                                address: row[5],
                                student_code: row[1],
                                gender: row[4],
                                vnu_mail: row[1] + "@vnu.edu.vn",
                                note: "",
                                class: row[6],
                                accountUuid,
                                trainingProgramUuid: trainingProgram.uuid,
                                majorUuid: major.uuid
                            };
                            listStudents.push(newStudent);
                        }
                    })
                );

                transaction = await connection.sequelize.transaction();

                await Account.bulkCreate(listAccounts, {transaction});

                await Student.bulkCreate(listStudents, {transaction});
                await transaction.commit();
                res.status(200).json({
                    message: messages.MSG_SUCCESS,
                });
            } catch (e) {
                if (transaction) {
                    try {
                        await transaction.rollback();
                    } catch (e) {
                        res.status(500).json({
                            error: e.toString(),
                        });
                    }
                }
                res.status(500).json({
                    message: messages.MSG_CANNOT_CREATE + constants.STUDENTS + e,
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: err.toString()
            });
        });
};

exports.getAllStudents = async (req, res) => {
    try {
        const searchQuery = constructSearchQuery(req.query);
        const studentSearchQuery = {};
        const accountSearchQuery = {};
        for (const property in searchQuery) {
            if (property !== constants.USERNAME) {
                studentSearchQuery[property] = searchQuery[property];
            } else {
                accountSearchQuery[property] = searchQuery[property];
            }
        }

        const total = await Student.count({
            where: studentSearchQuery,
            include: [
                {
                    model: Account,
                    where: accountSearchQuery,
                },

            ],
        });
        const page = req.query.page || constants.DEFAULT_PAGE_VALUE;
        const pageSize = req.query.pageSize || total;
        const totalPages = Math.ceil(total / pageSize);
        const students = await Student.findAll({
            where: studentSearchQuery,
            include: [
                {
                    model: Account,
                    attributes: [constants.UUID, constants.USERNAME, constants.ROLE],
                    where: accountSearchQuery,
                },
                {
                    model: TrainingProgram
                },
                {
                    model: Major
                },
                {
                    model: Course
                }
            ],
            ...paginate({page, pageSize}),
        });
        res.status(200).json({
            accounts: students,
            totalResults: total,
            totalPages: totalPages,
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_GET + constants.STUDENTS + error,
        });
    }
};

exports.getAStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            where: {
                uuid: req.params.uuid,
            },
            include: [
                {
                    model: Account,
                    attributes: [constants.UUID, constants.USERNAME, constants.ROLE],
                },
                {
                    model: Institution
                }
            ],
        });
        if (student) {
            return res.status(200).json({
                student: student,
            });
        } else {
            return res.status(404).json({
                message: constants.STUDENT + messages.MSG_NOT_FOUND,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: messages.MSG_CANNOT_GET + constants.STUDENT,
        });
    }
};

exports.addCourseToPlan = async (req, res) => {
    const {studentUuid, courseUuid, semester, working, completed, improved, repeated, available} = req.body;
    let transaction;
    try {
        const student_course = await StudentCourse.findOne({
            where: {
                studentUuid: studentUuid,
                courseUuid: courseUuid
            }
        })
        transaction = await connection.sequelize.transaction();
        const studentCourse = {
            studentUuid: studentUuid,
            courseUuid: courseUuid,
            semester: semester,
            working: working ? working : null,
            improved: improved ? improved : null,
            completed: completed ? completed : null,
            repeated: repeated ? repeated : null
        }

        if (available) {
            await StudentCourse.destroy(
                {
                    where: {
                        studentUuid: studentUuid,
                        courseUuid: courseUuid
                    }
                }

                , {transaction})
        }

        if (student_course) {
            await StudentCourse.update(
                studentCourse,
                {
                    where: {
                        studentUuid: studentUuid,
                        courseUuid: courseUuid
                    }
                }

                , {transaction})
        } else {
            await StudentCourse.create(
                studentCourse
                , {transaction})
        }

        await transaction.commit();
        res.status(200).json({
            message: "Thành công",
        });

    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    error: e.toString(),
                });
            }
        }
        res.status(500).json({
            message: "Đã có lỗi xảy ra" + e,
        });
    }
}

exports.joinTrainingProgram = async (req, res) => {
    const {studentUuid, trainingProgramUuid} = req.body;
    let transaction;
    try {
        const studentTraining = await StudentTrainingProgram.findOne({
            studentUuid,
            trainingProgramUuid
        })

        if (studentTraining) {
            res.status(409).json({
                message: "Sinh viên đã theo chương trình đào tạo này"
            })
        }

        transaction = await connection.sequelize.transaction();
        await StudentTrainingProgram.create({
            studentUuid,
            trainingProgramUuid
        }, {transaction})

        await transaction.commit();
        res.status(201).json({
            message: "Sinh viên đã theo chương trình đào tạo này"
        })

    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    error: e.toString(),
                });
            }
        }
        res.status(500).json({
            message: "Đã có lỗi xảy ra" + e,
        });
    }

}

exports.getOutTrainingProgram = async (req, res) => {
    const {studentUuid, trainingProgramUuid} = req.body;
    let transaction;
    try {

        transaction = await connection.sequelize.transaction();
        await StudentTrainingProgram.destroy(
            {
                where: {
                    studentUuid,
                    trainingProgramUuid
                }
            }
            , {transaction})

        await transaction.commit();
        res.status(200).json({
            message: messages.MSG_SUCCESS
        })

    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    error: e.toString(),
                });
            }
        }
        res.status(500).json({
            message: "Đã có lỗi xảy ra" + e,
        });
    }
}

exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            where: {
                uuid: req.params.uuid,
            },
        });
        if (!student) {
            return res.status(404).json({
                message: messages.MSG_NOT_FOUND,
            });
        }
        await Student.update(
            {...req.body},
            {
                where: {
                    uuid: req.params.uuid,
                },
            }
        );


        const studentTraining = await StudentTrainingProgram.findOne({
            where: {
                studentUuid: req.params.uuid
            }

        })

        if (studentTraining) {

            await StudentTrainingProgram.update(
                {
                    trainingProgramUuid: req.body.trainingProgramUuid
                },
                {
                    where: {
                        studentUuid: req.params.uuid
                    }

                }
            )

        } else {
            await StudentTrainingProgram.create({
                studentUuid: req.params.uuid,
                trainingProgramUuid: req.body.trainingProgramUuid
            })

        }

        res.status(200).json({
            message: messages.MSG_SUCCESS,
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_UPDATE + constants.STUDENT + error,
        });
    }
};

exports.deleteStudent = async (req, res) => {
    let transaction;
    try {
        transaction = await connection.sequelize.transaction();
        const student = await Student.findOne({
            where: {
                uuid: req.params.uuid,
            },
        });
        if (student) {

            await Student.destroy({
                where: {
                    uuid: req.params.uuid,
                },
                transaction,
            });
            await Account.destroy({
                where: {
                    uuid: student.accountUuid,
                },
                transaction,
            });
            await transaction.commit();

            return res.status(200).json({
                message: messages.MSG_SUCCESS,
            });
        } else {
            return res.status(404).json({
                message: constants.STUDENT + messages.MSG_NOT_FOUND,
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(500).json({
            message: messages.MSG_CANNOT_DELETE + constants.STUDENT,
        });
    }
};

exports.updateAvatar = async (req, res) => {
    let avatarUrl = "";
    let avatarFile = req.file;

    try {
        avatarUrl = await uploadImageToStorage(avatarFile)
    } catch (e) {
        const DIR = path.join(__dirname, '../../public/uploads/');
        let filePath = DIR + avatarFile.filename;
        base64.encode(filePath, async function (err, base64String) {
                if(base64String) {
                    avatarUrl = base64String
                }
                else {
                    res.status(500).json({
                        message: err
                    })
                }
            }
        )
    }

    try {
        const student = await Student.findOne({
            where: {
                uuid: req.params.uuid,
            },
        });
        if (!student) {
            return res.status(404).json({
                message: messages.MSG_NOT_FOUND,
            });
        }

        await Student.update(
            {
                avatar: avatarUrl
            },
            {
                where: {
                    uuid: req.params.uuid,
                },
            }
        );
        res.status(200).json({
            message: messages.MSG_SUCCESS,
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_UPDATE + constants.STUDENT,
        });
    }
}
