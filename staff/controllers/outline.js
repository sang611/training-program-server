const Outline = require("../../models/Outline");
const messages = require("../../lib/constants/messages");
const constants = require("../../lib/constants/constants");
const connection = require("../../database/connection");
const uuid = require("uuid");
const OutlineLearningOutcome = require("../../models/OutlineLearningOutcome");
const LearningOutcome = require("../../models/LearningOutcome");
const Course = require("../../models/Course");
const Institution = require("../../models/Institution");

exports.createOutline = async (req, res) => {
    let transaction;
    try {
        transaction = await connection.sequelize.transaction();

        const outlineUuid = await uuid();
        await Outline.create({
            uuid: outlineUuid,
            lecturers: JSON.stringify(req.body.lecturers) ,
            goal: req.body.goal,
            summary_content: req.body.summaryContent,
            detail_content: req.body.detailContent,
            documents: req.body.documents,
            teachingFormality: req.body.teachingFormality,
            coursePolicy: req.body.coursePolicy,
            examFormality: req.body.examFormality,
            courseUuid: req.body.courseUuid
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
            message: messages.MSG_CANNOT_CREATE + constants.OUTLINE + error
        });
    }
}

exports.getAllOutline = async (req, res) => {
    const courseUuid = req.params.courseUuid;
    try {
        //const searchQuery = constructSearchQuery(req.query);
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
