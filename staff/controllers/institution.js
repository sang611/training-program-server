const Institution = require('../../models/Institution');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const paginate = require('../../lib/utils/paginate');
const constructSearchQuery = require('../../lib/utils/constructSearchQuery');
const uploadImageToStorage = require('../../lib/utils/uploadToFirebase')
const connection = require("../../database/connection");

exports.createInstitution = async (req, res) => {
  let transaction;
  try {
    let logoFile = req.file;
    let logoFilePath = "https://lh3.googleusercontent.com/proxy/i5989WXajzTbo1mWxbAnXYoLz1tfEB6In4zemy_8Fmwux0lySorGuk53uyXntRDmEDM5AHa8JGPumSWvTUGRBnM4Fpk";
    if(logoFile) {
      await uploadImageToStorage(logoFile).then((success) => {
        logoFilePath = success;
      }).catch((error) => {
        console.error(error);
      });
    }
    transaction = await connection.sequelize.transaction();
    await Institution.create({
      uuid: uuid(),
      vn_name: req.body.vn_name,
      en_name: req.body.en_name,
      abbreviation: req.body.abbreviation,
      address: req.body.address,
      description: req.body.description,
      logo: logoFilePath,
      parent_uuid: req.body.parent_uuid,
    }, {transaction})
    await transaction.commit();
    res.status(201).json({
      message: messages.MSG_SUCCESS
    })
  } catch(error) {
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
      include: [
        {
          model: Institution,
          as: 'children',
          nested: true
        }
      ],
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

    let logoFile = req.file;
    let logoFilePath = institution.logo;
    if(logoFile) {
      await uploadImageToStorage(logoFile).then((success) => {
        logoFilePath = success;
      }).catch((error) => {
        console.error(error);
      });
    }
    await Institution.update(
      {...req.body, logo: logoFilePath},
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
      message: messages.MSG_CANNOT_UPDATE + constants.INSTITUTION + error
    });
  }
}