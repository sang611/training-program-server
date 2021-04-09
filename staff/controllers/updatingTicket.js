const UpdatingTicket = require("../../models/UpdatingTicket");
const messages = require("../../lib/constants/messages");
const constants = require("../../lib/constants/constants");
const Employee = require("../../models/Employee");
const Outline = require("../../models/Outline");
const Course = require("../../models/Course");
const LearningOutcome = require("../../models/LearningOutcome");

exports.getAllUpdatingTicket = async (req, res) => {
    try {
        const tickets = await UpdatingTicket.findAll({
            include: [
                {
                    model: Employee,
                },
                {
                    model: Outline,
                    include: [
                        {
                            model: Course
                        },
                        {
                            model: LearningOutcome
                        }
                    ]
                },
            ],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        return res.status(200).json({
            tickets
        })
    }  catch (e) {
        res.status(500).json({
            message: messages.MSG_CANNOT_GET + constants.MAJORS
        });
    }
}