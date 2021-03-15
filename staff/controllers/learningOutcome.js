const LearningOutcome = require('../../models/LearningOutcome');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const connection = require("../../database/connection");
const LearningOutcomePLO_CLO = require("../../models/LearningOutcomePLO_CLO");
const constructSearchQuery = require("../../lib/utils/constructSearchQuery");
const Op = require('sequelize').Op

exports.createLearningOutcome = async (req, res) => {
    const {contents, parent_uuid, order, category, plos} = req.body;
    let transaction;
    try {
        if (parent_uuid) {
            const parent = await LearningOutcome.findOne({
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
        transaction = await connection.sequelize.transaction();
        await Promise.all(
            contents.map(async (content) => {
                let id = await uuid();
                await LearningOutcome.create({
                    uuid: id,
                    parent_uuid: parent_uuid,
                    content: content,
                    order: order,
                    category: category,
                    isLink: plos.length > 0
                }, {transaction})

                if (category === 2) {
                    await Promise.all(
                        plos.map(async plo => {
                            await LearningOutcomePLO_CLO.create({
                                uuid: uuid(),
                                learningOutcomeUuid: plo,
                                cloUuid: id
                            }, {transaction})
                        })
                    )
                }
            })
        );
        await transaction.commit();

        res.status(200).json({
            message: messages.MSG_SUCCESS
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
            message: messages.MSG_CANNOT_CREATE + constants.LEARNING_OUTCOME + error
        });
    }
}

exports.getAllLearningOutcomes = async (req, res) => {
    const searchQuery = constructSearchQuery(req.query);
    const locSearchQuery = {};
    const category=req.params.category;
    for (const property in searchQuery) {
        locSearchQuery[property] = searchQuery[property];

    }
    try {
        const learningOutcomes = await LearningOutcome.findAll({
           /* where: {
                [Op.and]:  [
                    {
                        category: req.params.category,
                    },
                    {
                        locSearchQuery
                    }
                ]
            }*/
            where: category > 0 ? {
                category: category,
                ...locSearchQuery
            } : {
                ...locSearchQuery
            },
            include: [
                {
                    model: LearningOutcome,
                    as: "clos"
                },

            ]

            //order: [[constants.ORDER, constants.ASC]]
        });
        res.status(200).json({
            learningOutcomes: learningOutcomes
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_GET + constants.LEARNING_OUTCOMES + error
        });
    }
}

exports.deleteLearningOutcome = async (req, res) => {
    let transaction;
    try {

        const learningOutcome = await LearningOutcome.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!learningOutcome) {
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
        transaction = await connection.sequelize.transaction();
        await LearningOutcome.destroy({
            where: {
                uuid: req.params.uuid
            }
        }, {transaction})

        if (learningOutcome.category === 2) {
            await LearningOutcomePLO_CLO.destroy({
                where: {
                    cloUuid: req.params.uuid
                }
            }, {transaction})
        }

        await transaction.commit();

        res.status(200).json({
            message: messages.MSG_SUCCESS
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
            message: messages.MSG_CANNOT_DELETE + constants.LEARNING_OUTCOME + error
        });
    }
}

exports.updateLearningOutcome = async (req, res) => {
    try {
        const learningOutcome = await LearningOutcome.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!learningOutcome) {
            return res.status(404).json({
                message: constants.LEARNING_OUTCOME + messages.MSG_NOT_FOUND
            });
        }
        if (req.body.parent_uuid) {
            const parent = await LearningOutcome.findOne({
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
        await learningOutcome.update(
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
            message: messages.MSG_CANNOT_UPDATE + constants.LEARNING_OUTCOME
        });
    }
}