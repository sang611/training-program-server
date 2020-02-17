const Institution = require('../../models/Institution');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const paginate = require('../../lib/utils/paginate');
const constructSearchQuery = require('../../lib/utils/constructSearchQuery');

exports.createInstitution = async (req, res) => {
  try {
    await Institution.create({
      uuid: uuid(),
      vn_name: req.body.vn_name,
      en_name: req.body.en_name,
      abbreviation: req.body.abbreviation,
      address: req.body.address,
      description: req.body.description,
      parent_uuid: req.body.parent_uuid
    })
    res.status(200).json({
      message: messages.MSG_SUCCESS
    })
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_CREATE + constants.INSTITUTION
    });
  }
}

exports.getAllInstitutions =  async (req, res) => {
  try {
    const searchQuery = constructSearchQuery(req.query);
    const total = await Institution.count({
      where: searchQuery
    });
    const page = req.query.page || constants.DEFAULT_PAGE_VALUE;
    const pageSize = req.query.pageSize || total;
    const totalPages = Math.ceil(total / pageSize);
    const institutions = await Institution.findAll({
      where: searchQuery,
      ...paginate({ page, pageSize })
    });
    res.status(200).json({
      institutions: institutions,
      totalResults: total,
      totalPages: totalPages
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_GET + constants.INSTITUTIONS
    });
  }
}

exports.deleteInstitution = async (req, res) => {
  try {
    const institution = await Institution.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (!institution) {
      return res.status(404).json({
        message: constants.INSTITUTION + messages.MSG_NOT_FOUND
      });
    }
    await Institution.destroy({
      where: {
        uuid: req.params.uuid
      }
    })
    res.status(200).json({
      message: messages.MSG_SUCCESS
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_DELETE + constants.INSTITUTION
    });
  }
}

exports.updateInstitution = async (req, res) => {
  try {
    const institution = await Institution.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (!institution) {
      return res.status(404).json({
        message: constants.INSTITUTION + messages.MSG_NOT_FOUND
      });
    }
    await Institution.update(
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
      message: messages.MSG_CANNOT_UPDATE + constants.INSTITUTION
    });
  }
}