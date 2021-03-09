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

exports.createTrainingProgram = async (req, res) => {
    let transaction;
    try {

        transaction = await connection.sequelize.transaction();
        await TrainingProgram.create({
            uuid: uuid(),
            vn_name: req.body.vn_name,
            en_name: req.body.en_name,
            training_program_code: req.body.training_program_code,
            graduation_title: req.body.graduation_title,
            duration: req.body.training_duration,
            graduation_diploma_vi: req.body.graduation_diploma_vi,
            graduation_diploma_en: req.body.graduation_diploma_en,
            institutionUuid: req.body.institution,
            common_destination: req.body.common_destination,
            specific_destination: req.body.specific_destination,
            admission_method: req.body.admission_method,
            admission_scale: req.body.admission_scale
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
            where: searchQuery,
            include: [
                {
                    model: Institution,
                },
            ],
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
    const {courses, trainingUuid} = req.body;
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
        await Promise.all(
            courses.map(async (course) => {
                const {
                    course_uuid,
                    theory_time,
                    exercise_time,
                    practice_time,
                    course_type
                } = course;

                const newCourse = {
                    trainingProgramUuid: trainingUuid,
                    courseUuid: course_uuid,
                    theory_time,
                    practice_time,
                    exercise_time,
                    course_type
                };

                listCourses.push(newCourse);
            })
        );
        await TrainingProgramCourse.bulkCreate(listCourses, { transaction });
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
            message: "Không thể thêm mới danh sách học phần vào CTĐT" + e,
        });
    }
}

exports.updateCourseToTrainingProgram = async (req, res) => {
    try {
        await TrainingProgramCourse.update(
            {...req.body},
            {
                where: {
                    trainingProgramUuid: req.params.trainingProgramUuid,
                    courseUuid: req.params.courseUuid
                }
            }
        )
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (e) {
        res.status(500).json({
            message: "Không thể cập nhật học phần này"
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
                await TrainingProgramCourse.bulkCreate(listCourses, { transaction });
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
        await TrainingProgramLOC.destroy({where: {}}, {transaction})

        await Promise.all(
            locs.map(async (loc) => {
                const newLoc = {
                    trainingProgramUuid: trainingUuid,
                    learningOutcomeUuid: loc,
                };

                listLocs.push(newLoc);
            })
        );
        await TrainingProgramLOC.bulkCreate(listLocs, { transaction });
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