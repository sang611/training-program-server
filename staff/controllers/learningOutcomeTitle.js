const LearningOutcomeTitle = require('../../models/LearningOutcomeTitle');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const Op = require('sequelize').Op

exports.createLearningOutcomeTitle = async (req, res) => {
    const {contents, parent_uuid, order, category} = req.body;
    try {
        if (parent_uuid) {
            const parent = await LearningOutcomeTitle.findOne({
                where: {
                    uuid: parent_uuid

                }
            });
            if (!parent) {
                return res.status(404).json({
                    message: constants.PARENT + messages.MSG_NOT_FOUND
                });
            }
        }

        await Promise.all(
            contents.map(async (content) => {
                await LearningOutcomeTitle.create({
                    uuid: uuid(),
                    parent_uuid: parent_uuid,
                    content: content,
                    order: order,
                    category: category
                })
            })
        );

        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch(error) {
        res.status(500).json({
            message: "Không thể thêm mới danh mục chuẩn đầu ra"
        });
    }
}

exports.getAllLearningOutcomeTitles = async (req, res) => {
    try {
        const learningOutcomeTitles = await LearningOutcomeTitle.findAll({
            include: [
                {
                    model: LearningOutcomeTitle,
                    as: 'children',
                    nested: true
                }
            ],
            where: {
                category: req.params.category
            }
            //order: [[constants.ORDER, constants.ASC]]
        });
        res.status(200).json({
            learningOutcomeTitles
        });
    } catch(error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra"
        });
    }
}

exports.deleteLearningOutcomeTitle = async (req, res) => {
    try {

        const learningOutcomeTitle = await LearningOutcomeTitle.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!learningOutcomeTitle) {
            return res.status(404).json({
                message: constants.LEARNING_OUTCOME + messages.MSG_NOT_FOUND
            });
        }
        //delete all children as well
        /*await LearningOutcome.destroy({
          where: {
            [Op.or]: [
              {
                uuid: req.params.uuid
              },
              {
                parent_uuid: req.params.uuid
              }
            ]
          }
        });*/

        await LearningOutcomeTitle.destroy({
            where: {
                parent_uuid: req.params.uuid
            }
        })
        await LearningOutcomeTitle.destroy({
            where: {
                uuid: req.params.uuid
            }
        })

        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch(error) {
        res.status(500).json({
            message: "Không thể xóa danh mục này. Đã có lỗi xảy ra"
        });
    }
}

exports.updateLearningOutcomeTitle = async (req, res) => {
    try {
        const learningOutcomeTitle = await LearningOutcomeTitle.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!learningOutcomeTitle) {
            return res.status(404).json({
                message: constants.LEARNING_OUTCOME + messages.MSG_NOT_FOUND
            });
        }
        if (req.body.parent_uuid) {
            const parent = await LearningOutcomeTitle.findOne({
                where: {
                    uuid: req.body.parent_uuid
                }
            });
            if (!parent) {
                return res.status(404).json({
                    message: constants.PARENT + messages.MSG_NOT_FOUND
                });
            }
        }
        await LearningOutcomeTitle.update(
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
    } catch(error) {
        res.status(500).json({
            message: "Không thể cập nhật danh mục này. Đã có lỗi xảy ra"
        });
    }
}