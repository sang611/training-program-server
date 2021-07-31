const TrainingProgram = require('../../models/TrainingProgram')
const TrainingProgramCourse = require('../../models/TrainingProgramCourse')
const TrainingProgramLOC = require('../../models/TrainingProgramLearningOutcome')
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const uuid = require('uuid/v4');
const constructSearchQuery = require('../../lib/utils/constructSearchQuery');
const paginate = require('../../lib/utils/paginate');
const Institution = require("../../models/Institution");
const connection = require("../../database/connection");
const Course = require("../../models/Course");
const readXlsxFile = require("read-excel-file/node");
const LearningOutcome = require("../../models/LearningOutcome");
const LearningOutcomePLO_CLO = require("../../models/LearningOutcomePLO_CLO");
const Outline = require("../../models/Outline");

exports.createTrainingProgram = async (req, res) => {
    let transaction;
    try {

        transaction = await connection.sequelize.transaction();
        await TrainingProgram.create({
            uuid: uuid(),
            ...req.body

        }, {transaction})
        await transaction.commit();
        res.status(201).json({
            message: messages.MSG_SUCCESS
        })
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
            message: messages.MSG_CANNOT_CREATE + constants.TRAINING_PROGRAM
        });
    }
}

exports.getAllTrainingProgram = async (req, res) => {
    try {
        const searchQuery = constructSearchQuery(req.query);
        const trainingPrograms = await TrainingProgram.findAll({
            where: searchQuery
        });
        res.status(200).json({
            training_programs: trainingPrograms,
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_GET + constants.TRAINING_PROGRAM + error
        });
    }
}

exports.getTrainingProgram = async (req, res) => {
    try {
        let trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: req.params.uuid,
            },
            include: [
                {
                    model: Institution,
                },
                {
                    model: Course,
                    include: {
                        model: Outline,
                        separate: true,
                        order: [
                            ['createdAt', 'DESC'],
                        ],
                    },
                },
                {
                    model: LearningOutcome,
                }
            ]
        });

        if (trainingProgram) {
            return res.status(200).json({
                trainingProgram: trainingProgram,
            });
        } else {
            return res.status(404).json({
                message: "Chương trình đào tạo không tồn tại.",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Đã có lỗi xảy ra" + error,
        });
    }
};

exports.getLocsMatrixTraining = async (req, res) => {
    try {
        let trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: req.params.uuid,
            },
            include: [
                {
                    model: LearningOutcome,
                    include: [
                        {
                            model: LearningOutcome,
                            as: 'clos',
                            include: [
                                {
                                    model: Outline,
                                    include: [
                                        {
                                            model: Course
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                },
            ]
        })

        if (trainingProgram) {
            return res.status(200).json({
                trainingProgram: trainingProgram,
            });
        } else {
            return res.status(404).json({
                message: "Chương trình đào tạo không tồn tại.",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Đã có lỗi xảy ra" + error,
        });
    }
}

exports.getCoursesMatrixTraining = async (req, res) => {
    try {
        let trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: req.params.uuid,
            },
            include: [
                {
                    model: Course,
                    include: [
                        {
                            model: Outline,
                            include: [
                                {
                                    model: LearningOutcome
                                }
                            ],
                            separate: true,
                            order: [
                                ['createdAt', 'DESC'],
                            ],
                        },

                    ],
                },
            ]
        })

        if (trainingProgram) {
            return res.status(200).json({
                trainingProgram: trainingProgram,
            });
        } else {
            return res.status(404).json({
                message: "Chương trình đào tạo không tồn tại.",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Đã có lỗi xảy ra" + error,
        });
    }
}


exports.updateTrainingProgram = async (req, res) => {
    try {
        const trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!trainingProgram) {
            return res.status(404).json({
                message: constants.TRAINING_PROGRAM + messages.MSG_NOT_FOUND
            });
        }
        await TrainingProgram.update(
            {...req.body},
            {
                where: {
                    uuid: req.params.uuid
                }
            }
        )
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_UPDATE + constants.TRAINING_PROGRAM
        });
    }
}

exports.lockTrainingProgram = async (req, res) => {
    let {course_outlines} = req.body;
    const {uuid} = req.params;
    try {
        const trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: uuid
            }
        });
        if (!trainingProgram) {
            return res.status(404).json({
                message: constants.TRAINING_PROGRAM + messages.MSG_NOT_FOUND
            });
        }
        await TrainingProgram.update(
            {lock_edit: 1},
            {
                where: {
                    uuid: uuid
                }
            }
        )

        await Promise.all(
            course_outlines.map(async (course_outline) => {
                await TrainingProgramCourse.update(
                    {
                        outlineUuid: course_outline.outlineUuid
                    },
                    {
                        where: {
                            courseUuid: course_outline.courseUuid,
                            trainingProgramUuid: uuid
                        }
                    }
                )
            })
        )

        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_UPDATE + constants.TRAINING_PROGRAM + error
        });
    }
}

exports.unLockTrainingProgram = async (req, res) => {
    let {course_outlines} = req.body;
    const {uuid} = req.params;
    try {
        const trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: uuid
            }
        });
        if (!trainingProgram) {
            return res.status(404).json({
                message: constants.TRAINING_PROGRAM + messages.MSG_NOT_FOUND
            });
        }
        await TrainingProgram.update(
            {lock_edit: 0},
            {
                where: {
                    uuid: uuid
                }
            }
        )

        await Promise.all(
            course_outlines.map(async (course_outline) => {
                await TrainingProgramCourse.update(
                    {
                        outlineUuid: null
                    },
                    {
                        where: {
                            courseUuid: course_outline.courseUuid,
                            trainingProgramUuid: uuid
                        }
                    }
                )
            })
        )

        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_UPDATE + constants.TRAINING_PROGRAM + error
        });
    }
}

exports.deleteTrainingProgram = async (req, res) => {
    try {
        const trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!trainingProgram) {
            return res.status(404).json({
                message: constants.TRAINING_PROGRAM + messages.MSG_NOT_FOUND
            });
        }
        await TrainingProgram.destroy({
            where: {
                uuid: req.params.uuid
            }
        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_DELETE + constants.TRAINING_PROGRAM
        });
    }
}

exports.addCourseToTrainingProgram = async (req, res) => {
    const {courses, trainingUuid, course_type} = req.body;
    let listCourses = [];
    let transaction;
    try {
        await Promise.all(
            courses.map(async (course) => {
                const aCourse = await TrainingProgramCourse.findOne({
                    where: {
                        courseUuid: course.course_uuid,
                        trainingProgramUuid: trainingUuid
                    },
                });
                if (aCourse) {
                    return res.status(409).json({
                        message: "1 học phần đã tồn tại trong CTĐT này",
                    });
                }
            })
        );
        transaction = await connection.sequelize.transaction();

        courses.forEach((course) => {
            const {
                course_uuid,
                theory_time,
                exercise_time,
                practice_time,
                self_time
            } = course;

            const newCourse = {
                trainingProgramUuid: trainingUuid,
                courseUuid: course_uuid,
                theory_time,
                practice_time,
                exercise_time,
                self_time,
                course_type: req.body.course_type,
                knowledge_type: req.body.knowledge_type,
                outlineUuid: ""
            };

            listCourses.push(newCourse);
        })

        let newCourses = await TrainingProgramCourse.bulkCreate(listCourses, {transaction});
        let listNewCourse = [];
        await Promise.all(
            newCourses.map(async (newCourse) => {
                let course = await Course.findOne({
                    where: {
                        uuid: newCourse.courseUuid
                    }
                }, {transaction})

                listNewCourse.push({
                    ...course.dataValues,
                    ...newCourse.dataValues
                })
            })
        )

        await transaction.commit();
        res.status(200).json({
            message: messages.MSG_SUCCESS,
            newCourses: listNewCourse
        });
    } catch (e) {
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
            message: "Không thể thêm mới danh sách học phần vào CTĐT" + e,
        });
    }
}

exports.getCourseOfTrainingProgram = async (req, res) => {
    try {
        let courses = await TrainingProgramCourse.findAll(
            {
                where: {
                    trainingProgramUuid: req.params.trainingProgramUuid,
                },
                include: [
                    {
                        model: Course
                    }
                ]
            }
        )

        return res.status(200).json({
            trainingProgramCourses: courses,
        });
    } catch (e) {
        res.status(500).json({
            message: "Đã có lỗi truy vấn xảy ra" + e,
        });
    }
}

exports.updateCourseDocument = async (req, res) => {
    let transaction;
    try {
        transaction = await connection.sequelize.transaction();
        await TrainingProgramCourse.update(
            {...req.body},
            {
                where: {
                    trainingProgramUuid: req.params.trainingProgramUuid,
                    courseUuid: req.params.courseUuid
                }
            }, {transaction}
        )
        await transaction.commit();
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    message: "Đã có lỗi truy vấn xảy ra",
                });
            }
        }
        res.status(500).json({
            message: "Không thể cập nhật học phần này" + e
        });
    }
}

exports.addCourseLecturer = async (req, res) => {
    let transaction;
    const {lecturer} = req.body;

    try {

        const {lecturers} = await TrainingProgramCourse.findOne({
            where: {
                trainingProgramUuid: req.params.trainingProgramUuid,
                courseUuid: req.params.courseUuid
            }
        })

        transaction = await connection.sequelize.transaction();
        await TrainingProgramCourse.update(
            {
                lecturers: lecturers ? JSON.stringify(
                    [...JSON.parse(lecturers), lecturer]
                ) : JSON.stringify(
                    new Array(lecturer)
                )
            },
            {
                where: {
                    trainingProgramUuid: req.params.trainingProgramUuid,
                    courseUuid: req.params.courseUuid
                }
            }, {transaction}
        )
        await transaction.commit();
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    message: "Đã có lỗi truy vấn xảy ra",
                });
            }
        }
        res.status(500).json({
            message: "Không thể cập nhật học phần này" + e
        });
    }
}

exports.removeCourseLecturer = async (req, res) => {
    let transaction;
    const {lecturer} = req.body;

    try {

        const {lecturers} = await TrainingProgramCourse.findOne({
            where: {
                trainingProgramUuid: req.params.trainingProgramUuid,
                courseUuid: req.params.courseUuid
            }
        })

        transaction = await connection.sequelize.transaction();
        await TrainingProgramCourse.update(
            {
                lecturers: JSON.stringify(
                    JSON.parse(lecturers).filter(lec => lec.uuid !== lecturer.uuid)
                )
            },
            {
                where: {
                    trainingProgramUuid: req.params.trainingProgramUuid,
                    courseUuid: req.params.courseUuid
                }
            }, {transaction}
        )
        await transaction.commit();
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    message: "Đã có lỗi truy vấn xảy ra",
                });
            }
        }
        res.status(500).json({
            message: "Không thể cập nhật học phần này" + e
        });
    }
}

exports.cloneATraining = async (req, res) => {
    let transaction;
    try {
        transaction = await connection.sequelize.transaction();
        const newUuid = uuid();
        await TrainingProgram.create({
            uuid: newUuid,
            ...req.body.data
        }, {transaction})

        let trainingProgramCourses = await TrainingProgramCourse.findAll({
            where: {
                trainingProgramUuid: req.body.idClone
            }
        })

        await TrainingProgramCourse.bulkCreate(
            trainingProgramCourses.map((training) => {
                training.dataValues.trainingProgramUuid = newUuid;
                return training.dataValues;
            }),
            {transaction}
        )

        let trainingProgramLocs = await TrainingProgramLOC.findAll({
            where: {
                trainingProgramUuid: req.body.idClone
            }
        })

        await TrainingProgramLOC.bulkCreate(
            trainingProgramLocs.map((training) => {
                training.dataValues.trainingProgramUuid = newUuid;
                return training.dataValues;
            }),
            {transaction}
        )


        await transaction.commit();
        res.status(201).json({
            message: messages.MSG_SUCCESS
        })
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
            message: messages.MSG_CANNOT_CLONE + constants.TRAINING_PROGRAM
        });
    }
}





exports.updateTrainingSequence = async (req, res) => {
    const {trainingProgramUuid, coursesOfSemester, semester} = req.body;
    let transaction;
    try {
        transaction = await connection.sequelize.transaction();
        await TrainingProgramCourse.update(
            {semester},
            {
                where: {
                    trainingProgramUuid,
                    courseUuid: coursesOfSemester
                }
            }
        )
        await transaction.commit();
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    message: "Đã có lỗi truy vấn xảy ra",
                });
            }
        }
        res.status(500).json({
            message: "Không thể cập nhật học phần này" + e
        });
    }
}

exports.deleteCourseToTrainingProgram = async (req, res) => {
    let transaction;
    try {
        transaction = await connection.sequelize.transaction();
        await TrainingProgramCourse.destroy(
            {
                where: {
                    trainingProgramUuid: req.params.trainingProgramUuid,
                    courseUuid: req.params.courseUuid
                }
            }, {transaction}
        )
        await transaction.commit();
        res.status(200).json({
            message: "Đã xóa học phần khỏi khung đào tạo",
        });
    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (e) {
                res.status(500).json({
                    message: "Đã có lỗi truy vấn xảy ra",
                });
            }
        }
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        });
    }
}

exports.updateCourseToTrainingProgram = async (req, res) => {
    let transaction;
        try {
            transaction = await connection.sequelize.transaction();
            await TrainingProgramCourse.update(
                {...req.body},
                {
                where: {
                    trainingProgramUuid: req.params.trainingProgramUuid,
                    courseUuid: req.params.courseUuid
                }
            }, {transaction})
            await transaction.commit();
            res.status(200).json({
                message: messages.MSG_SUCCESS
            });
        } catch (e) {
            if (transaction) {
                try {
                    await transaction.rollback();
                } catch (e) {
                    res.status(500).json({
                        message: "Đã có lỗi truy vấn xảy ra",
                    });
                }
            }
            res.status(500).json({
                message: "Đã có lỗi xảy ra",
            });
        }
}

exports.addCourseToTrainingProgramByFile = async (req, res) => {
    let filePath =
        "/Web/KLTN/training-scheme-backend/uploads/" + req.file.filename;
    let listCourses = [];
    const {trainingUuid} = req.body;

    let transaction;
    readXlsxFile(filePath)
        .then(async (rows) => {
            rows.shift();
            try {

                await Promise.all(
                    rows.map(async (row) => {
                        const course_code = row[1];
                        const course_uuid = await Course.findOne(
                            {
                                where: {
                                    course_code: course_code
                                },
                                attributes: ['uuid']
                            }
                        )
                        const newCourse = {
                            trainingProgramUuid: trainingUuid,
                            courseUuid: course_uuid.dataValues.uuid,
                            theory_time: row[4],
                            practice_time: row[5],
                            exercise_time: row[6],
                            course_type: row[7]
                        };
                        listCourses.push(newCourse);
                    })
                );

                await Promise.all(
                    listCourses.map(async (course) => {
                        const aCourse = await TrainingProgramCourse.findOne({
                            where: {
                                courseUuid: course.courseUuid,
                                trainingProgramUuid: trainingUuid
                            },
                        });
                        if (aCourse) {
                            return res.status(409).json({
                                message: "1 học phần đã tồn tại trong CTĐT này",
                            });
                        }
                    })
                );

                transaction = await connection.sequelize.transaction();
                await TrainingProgramCourse.bulkCreate(listCourses, {transaction});
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
                    message: "Không thể thêm mới danh sách học phần" + e,
                });
            }
        })
        .catch((err) => {
            res.status(500).json(err);
        });
}

exports.addLocToTrainingProgram = async (req, res) => {
    const {locs, trainingUuid} = req.body;
    let transaction;
    const listLocs = [];
    try {
        /*await Promise.all(
            locs.map(async (loc) => {
                const aLoc = await TrainingProgramLOC.findOne({
                    where: {
                        learningOutcomeUuid: loc,
                        trainingProgramUuid: trainingUuid
                    },
                });
                if (aLoc) {
                    return res.status(409).json({
                        message: "1 chuẩn đầu ra đã tồn tại trong CTĐT này",
                    });
                }
            })
        );*/
        transaction = await connection.sequelize.transaction();
        await TrainingProgramLOC.destroy({
            where: {
                trainingProgramUuid: trainingUuid
            }
        }, {transaction})

        await Promise.all(
            locs.map(async (loc) => {
                const newLoc = {
                    trainingProgramUuid: trainingUuid,
                    learningOutcomeUuid: loc,
                };

                listLocs.push(newLoc);
            })
        );
        await TrainingProgramLOC.bulkCreate(listLocs, {transaction});
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
                    message: "Đã có lỗi truy vấn xảy ra",
                });
            }
        }
        res.status(500).json({
            message: "Không thể thêm mới chuẩn đầu ra vào CTĐT" + e,
        });
    }
}

exports.addClassesToTrainingProgram = async (req, res) => {
    const {classes} = req.body;
    let transaction;
    try {
        const trainingProgram = await TrainingProgram.findOne({
            uuid: req.params.uuid
        })
        if (!trainingProgram) {
            return res.status(404).json({
                message: constants.TRAINING_PROGRAM + messages.MSG_NOT_FOUND
            });
        }
        transaction = await connection.sequelize.transaction();
        await TrainingProgram.update(
            {
                classes: JSON.stringify(classes)
            },
            {
                where: {
                    uuid: req.params.uuid
                }
            }, {transaction})
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
                    message: "Đã có lỗi truy vấn xảy ra",
                });
            }
        }
        res.status(500).json({
            message: "Đã có lỗi truy vấn xảy ra" + e,
        });
    }


}