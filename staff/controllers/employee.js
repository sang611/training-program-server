const Employee = require("../../models/Employee");
const Account = require("../../models/Account");
const bcrypt = require("bcrypt");
const saltRounds = require("../../lib/constants/constants").SALT_ROUND;
const connection = require("../../database/connection");
const uuid = require("uuid/v4");
const messages = require("../../lib/constants/messages");
const constants = require("../../lib/constants/constants");
const paginate = require("../../lib/utils/paginate");
const constructSearchQuery = require("../../lib/utils/constructSearchQuery");

exports.createEmployee = async (req, res) => {
  //encrypt password
  const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
  if (hashPassword) {
    const accountUuid = uuid();
    let transaction;
    try {
      //check if username exists
      const account = await Account.findOne({
        where: {
          username: req.body.username,
        },
      });
      if (account) {
        return res.status(409).json({
          message: messages.MSG_USERNAME_EXISTS,
        });
      }
      transaction = await connection.sequelize.transaction();
      await Account.create(
        {
          username: req.body.username,
          password: hashPassword,
          uuid: accountUuid,
          role: req.body.role,
        },
        { transaction }
      );
      await Employee.create(
        {
          uuid: uuid(),
          fullname: req.body.fullname,
          academic_rank: req.body.academic_rank,
          academic_degree: req.body.academic_degree,
          email: req.body.email,
          vnu_mail: req.body.vnu_mail,
          phone_number: req.body.phone_number,
          note: req.body.note,
          accountUuid: accountUuid,
          institutionUuid: req.body.institutionUuid,
        },
        { transaction }
      );
      await transaction.commit();
      res.status(200).json({
        message: messages.MSG_SUCCESS,
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      res.status(500).json({
        message: messages.MSG_CANNOT_CREATE + constants.EMPLOYEE + err,
      });
    }
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const searchQuery = constructSearchQuery(req.query);
    const employeeSearchQuery = {};
    const accountSearchQuery = {};
    for (const property in searchQuery) {
      if (property !== constants.USERNAME) {
        employeeSearchQuery[property] = searchQuery[property];
      } else {
        accountSearchQuery[property] = searchQuery[property];
      }
    }
    const total = await Employee.count({
      where: employeeSearchQuery,
      include: [
        {
          model: Account,
          where: accountSearchQuery,
        },
      ],
    });
    const page = req.query.page || constants.DEFAULT_PAGE_VALUE;
    const pageSize = req.query.pageSize || total;
    const totalPages = Math.ceil(total / pageSize);
    const employees = await Employee.findAll({
      where: employeeSearchQuery,
      include: [
        {
          model: Account,
          attributes: [constants.UUID, constants.USERNAME, constants.ROLE],
          where: accountSearchQuery,
        },
      ],
      ...paginate({ page, pageSize }),
    });
    res.status(200).json({
      employees: employees,
      totalResults: total,
      totalPages: totalPages,
    });
  } catch (error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_GET + constants.EMPLOYEES,
    });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: {
        uuid: req.params.uuid,
      },
      include: [
        {
          model: Account,
          attributes: [constants.UUID, constants.USERNAME, constants.ROLE],
        },
      ],
    });
    if (employee) {
      return res.status(200).json({
        employee: employee,
      });
    } else {
      return res.status(404).json({
        message: constants.EMPLOYEE + messages.MSG_NOT_FOUND,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: messages.MSG_CANNOT_GET + constants.EMPLOYEE,
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  let transaction;
  try {
    transaction = await connection.sequelize.transaction();
    const employee = await Employee.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (employee) {
      await Account.destroy({
        where: {
          uuid: employee.accountUuid,
        },
        transaction,
      });
      await Employee.destroy({
        where: {
          uuid: req.params.uuid,
        },
        transaction,
      });
      await transaction.commit();

      return res.status(200).json({
        messages: messages.MSG_SUCCESS,
      });
    } else {
      return res.status(404).json({
        message: constants.EMPLOYEE + messages.MSG_NOT_FOUND,
      });
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    return res.status(500).json({
      message: messages.MSG_CANNOT_DELETE + constants.EMPLOYEE,
    });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (!employee) {
      return res.status(404).json({
        message: messages.MSG_NOT_FOUND,
      });
    }
    await Employee.update(
      { ...req.body },
      {
        where: {
          uuid: req.params.uuid,
        },
      }
    );
    res.status(200).json({
      message: messages.MSG_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_UPDATE + constants.INSTITUTION,
    });
  }
};
