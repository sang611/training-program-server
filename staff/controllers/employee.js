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
const readXlsxFile = require("read-excel-file/node");

exports.createEmployee = async (req, res) => {
  const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
  const accountUuid = uuid();
  let transaction;
  try {
    const account = await Account.findOne({
      where: {
        username: req.body.vnu_mail,
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
        username: req.body.vnu_mail,
        password: hashPassword,
        uuid: accountUuid,
        role: 1,
      },
      { transaction }
    );
    await Employee.create(
      {
        uuid: uuid(),
        fullname: req.body.full_name,
        birthday: req.body.birth_date,
        gender: req.body.gender,
        academic_rank: req.body.academic_rank,
        academic_degree: req.body.academic_degree,
        email: req.body.email,
        vnu_mail: req.body.vnu_mail,
        phone_number: req.body.phone_number,
        note: req.body.note,
        accountUuid: accountUuid,
        institutionUuid: req.body.institution,
      },
      { transaction }
    );
    await transaction.commit();
    res.status(200).json({
      message: messages.MSG_SUCCESS,
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
      message: messages.MSG_CANNOT_CREATE + constants.EMPLOYEE + error,
    });
  }
};

exports.createEmployeesByFile = async (req, res) => {
  let filePath =
    "/Web/KLTN/training-scheme-backend/uploads/" + req.file.filename;
  let listEmployees = [];
  let listAccounts = [];
  let transaction;
  readXlsxFile(filePath)
    .then(async (rows) => {
      rows.shift();
      try {
        await Promise.all(
          rows.map(async (row) => {
            const account = await Account.findOne({
              where: {
                username: row[8],
              },
            });
            if (account) {
              return res.status(409).json({
                message: messages.MSG_USERNAME_EXISTS,
              });
            }
          })
        );

        await Promise.all(
          rows.map(async (row) => {
            const accountUuid = uuid();
            const hashPassword = await bcrypt.hash(
              row[9].toString(),
              saltRounds
            );

            const account = {
              username: row[8],
              password: hashPassword,
              uuid: accountUuid,
              role: 1,
            };
            listAccounts.push(account);

            const newEmployee = {
              uuid: uuid(),
              fullname: row[1],
              academic_rank: row[6],
              academic_degree: row[7],
              email: row[4],
              vnu_mail: row[8],
              phone_number: row[5],
              note: "",
              birthday: row[2],
              gender: row[3],
              accountUuid,
              institutionUuid: "3f8d5b1b-33f2-4334-8624-18a6ad47e839",
            };
            listEmployees.push(newEmployee);
          })
        );

        transaction = await connection.sequelize.transaction();

        await Account.bulkCreate(listAccounts, { transaction });

        await Employee.bulkCreate(listEmployees, { transaction });
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
          message: messages.MSG_CANNOT_CREATE + constants.EMPLOYEE + e,
        });
      }
    })
    .catch((err) => {
      res.status(500).json(err);
    });
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
      accounts: employees,
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
