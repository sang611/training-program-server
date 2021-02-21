const Institution = require('../../models/Institution');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const paginate = require('../../lib/utils/paginate');
const constructSearchQuery = require('../../lib/utils/constructSearchQuery');
const multer = require('multer');
const uploadImageToStorage = require('../../lib/utils/uploadToFirebase')

exports.createInstitution = async (req, res) => {
  try {
    let logoFile = req.file;
    let logoFilePath = "https://i.pinimg.com/originals/33/b8/69/33b869f90619e81763dbf1fccc896d8d.jpg";
    if(logoFile) {
      await uploadImageToStorage(logoFile).then((success) => {
        logoFilePath = success;
      }).catch((error) => {
        console.error(error);
      });
    }
    
    await Institution.create({
      uuid: uuid(),
      vn_name: req.body.vn_name,
      en_name: req.body.en_name,
      abbreviation: req.body.abbreviation !== "undefined" ? req.body.abbreviation : "",
      address: req.body.address !== "undefined" ? req.body.address : "",
      description: req.body.description !== "undefined" ? req.body.description : "",
      logo: logoFilePath,
      parent_uuid: req.body.parent_uuid,
    })
  
    res.status(201).json({
      message: messages.MSG_SUCCESS
    })
  } catch(error) {
    console.log(error);
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