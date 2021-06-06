const Outline = require("../../models/Outline");
const messages = require("../../lib/constants/messages");
const constants = require("../../lib/constants/constants");
const connection = require("../../database/connection");
const uuid = require("uuid");
const OutlineLearningOutcome = require("../../models/OutlineLearningOutcome");
const LearningOutcome = require("../../models/LearningOutcome");
const Course = require("../../models/Course");
const Institution = require("../../models/Institution");
const UpdatingTicket = require("../../models/UpdatingTicket");
const Employee = require("../../models/Employee");
const EmployeeCourse = require("../../models/EmployeeCourse");
const Account = require("../../models/Account");

exports.createOutline = async (req, res) => {
    const outlineUuid = await uuid();
    let newOutline = {
        uuid: outlineUuid,
        lecturers: req.body.lecturers,
        goal: req.body.goal,
        summary_content: req.body.summaryContent,
        detail_content: req.body.detailContent,
        documents: req.body.documents,
        teachingFormality: req.body.teachingFormality,
        coursePolicy: req.body.coursePolicy,
        examFormality: req.body.examFormality,
        courseUuid: req.body.courseUuid
    }

    try {
        if (req.body.userRole == 0 || req.body.userRole == undefined) {
            let transaction;

            transaction = await connection.sequelize.transaction();
            await Outline.create({
                ...newOutline,
                lecturers: JSON.stringify(req.body.lecturers)
            }, {transaction})

            await Promise.all(
                req.body.locs.map(async loc => {
                    await OutlineLearningOutcome.create({
                        outlineUuid: outlineUuid,
                        learningOutcomeUuid: loc.uuid,
                        level: loc.level || loc.outline_learning_outcome.level
                    }, {transaction})
                })
            )

            await transaction.commit();
            res.status(201).json({
                message: "Đã tạo thành công 1 version đề cương"
            })
        } else {
            let transaction;

            transaction = await connection.sequelize.transaction();
            let employeeUuid = req.body.userRequestId,
                outlineUuid = req.body.outlineUuid,
                description = req.body.description_edit;

            await UpdatingTicket.create({
                uuid: uuid(),
                employeeUuid,
                outlineUuid,
                description,
                edited_content: JSON.stringify({...newOutline, locs: req.body.locs})
            }, {transaction})

            await transaction.commit();



            let socket = req.app.get('socketIo');
            socket.emit('edit_outline', 'Có 1 yêu cầu chỉnh sửa đề cương!');
            res.status(201).json({
                message: "Đã gửi yêu cầu chỉnh sửa đề cương cho admin!"
            })

        }
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
            message: e.toString()
        });
    }

}

exports.getAllOutline = async (req, res) => {
    const courseUuid = req.params.courseUuid;

    try {
        const outlines = await Outline.findAll({
            where: {
                courseUuid: courseUuid,
            },
            include: [
                {
                    model: LearningOutcome
                }
            ],
            order: [
                ['createdAt', 'DESC'],
            ],
        });
        res.status(200).json({
            outlines: outlines,
            message: messages.MSG_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_GET + constants.OUTLINE + error
        });
    }
}
exports.getAnOutline = async (req, res) => {
    try {
        const {uuid, courseUuid} = req.params;
        let outline = await Outline.findOne({
            where: {
                uuid,
                courseUuid
            },
            include: [
                {
                    model: LearningOutcome,
                },
                {
                    model: Course,
                    include: [
                        {model: Institution}
                    ]
                }
            ]
        });

        if (outline) {
            return res.status(200).json({
                outline: outline,
            });
        } else {
            return res.status(404).json({
                message: "Đề cương học phần không tồn tại.",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Đã có lỗi xảy ra" + error,
        });
    }
};

exports.deleteOutline = async (req, res) => {
    try {
        const outline = await Outline.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!outline) {
            return res.status(404).json({
                message: constants.OUTLINE + messages.MSG_NOT_FOUND
            });
        }
        await Outline.destroy({
            where: {
                uuid: req.params.uuid
            }
        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch(error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_DELETE + constants.OUTLINE
        });
    }
}

exports.acceptUpdatedOutline = async (req, res) => {
    let transaction;
    let ticketUuid = req.body.ticketUuid;
    let employeeUuid = req.body.employeeUuid;
    let newOutlineContent = req.body.newOutlineContent;
    let isAccepted = req.body.isAccepted;
    let socket = req.app.get('socketIo');
    if (isAccepted) {
        const outlineUuid = await uuid();
        const lecturer = await Employee.findOne({
            where: {
                uuid: employeeUuid
            }
        })
        let newOutline = {
            uuid: outlineUuid,
            lecturers: JSON.stringify(newOutlineContent.lecturers),
            goal: newOutlineContent.goal,
            summary_content: newOutlineContent.summaryContent,
            detail_content: newOutlineContent.detailContent,
            documents: newOutlineContent.documents,
            teachingFormality: newOutlineContent.teachingFormality,
            coursePolicy: newOutlineContent.coursePolicy,
            examFormality: newOutlineContent.examFormality,
            courseUuid: newOutlineContent.courseUuid,
            createdBy: JSON.stringify(lecturer)
        }

        try {



            transaction = await connection.sequelize.transaction();
            await Outline.create({
                ...newOutline
            }, {transaction})

            await Promise.all(
                newOutlineContent.locs.map(async loc => {
                    await OutlineLearningOutcome.create({
                        outlineUuid: outlineUuid,
                        learningOutcomeUuid: loc.uuid,
                        level: loc.level || loc.outline_learning_outcome.level
                    }, {transaction})
                })
            )

            await UpdatingTicket.update(
                {is_accepted: true},
                {
                    where: {
                        uuid: ticketUuid
                    }
                },
                {transaction}
            )

            await transaction.commit();


            socket.emit(employeeUuid, {
                message: 'Yêu cầu chỉnh sửa đề cương của bạn đã được chấp nhận!',
                is_accepted: true
            });

            res.status(201).json({
                message: "Đã tạo thành công 1 version đề cương"
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
                message: e.toString()
            });
        }
    } else {
        transaction = await connection.sequelize.transaction();
        await UpdatingTicket.update(
            {is_accepted: false},
            {
                where: {
                    uuid: ticketUuid
                }
            },
            {transaction}
        )
        await transaction.commit();
        socket.emit(employeeUuid, {
            message: 'Yêu cầu chỉnh sửa đề cương của bạn đã bị từ chối!',
            is_accepted: false
        });
        res.status(201).json({
            message: "Đã reject yêu cầu này"
        })
    }


}
