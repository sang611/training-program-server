const Course = require("../../models/Course");
const Institution = require("../../models/Institution")
const uuid = require("uuid/v4");
const messages = require("../../lib/constants/messages");
const constants = require("../../lib/constants/constants");
const readXlsxFile = require("read-excel-file/node");
const paginate = require("../../lib/utils/paginate");
const constructSearchQuery = require("../../lib/utils/constructSearchQuery");
const connection = require("../../database/connection");
const Outline = require("../../models/Outline");
const EmployeeCourse = require("../../models/EmployeeCourse");
const Employee = require("../../models/Employee");
const departmentQuery = require("../../lib/utils/constructDepartmentQuery");

exports.createCourse = async (req, res) => {
    let transaction;
    try {

        const course = await Course.findOne({
            where: {
                course_code: req.body.course_code,
            },
        });

        if (course) {
            return res.status(409).json({
                message: "Học phần đã tồn tại trong hệ thống",
            });
        }

        const newUuid = uuid();
        transaction = await connection.sequelize.transaction();

        await Course.create({
            uuid: newUuid,
            course_name_vi: req.body.course_name_vi,
            course_name_en: req.body.course_name_en,
            course_code: req.body.course_code,
            credits: req.body.credits,
            institutionUuid: req.body.institutionUuid,
            document_url: req.body.document_url,
            description: req.body.description
        }, {transaction})

        let employeeCourses = [];
        req.body.lecturers.forEach((lec) => {
            employeeCourses.push({
                employeeUuid: lec.uuid,
                courseUuid: newUuid
            })
        })

        await EmployeeCourse.bulkCreate(employeeCourses, {transaction})
        await transaction.commit();
        res.status(201).json({
            message: "Tạo mới học phần thành công"
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
            message: "Không thể tạo mới học phần. Đã có lỗi xảy ra"
        });
    }
}

exports.getAllCourses = async (req, res) => {
    try {
        const searchQuery = constructSearchQuery(req.query);
        const insitutionUuid =  req.query.institutionUuid;
        let department = req.department || "";
        if(insitutionUuid && insitutionUuid !== "") {
            department = insitutionUuid;
        }
        if (req.query.depAll) department = "";

        const total = await Course.count({
            where: {
                ...searchQuery,
                institutionUuid: departmentQuery(department)
            },
        });
        const page = req.query.page || constants.DEFAULT_PAGE_VALUE;
        const pageSize = req.query.pageSize || total;
        const totalPages = Math.ceil(total / pageSize);
        const courses = await Course.findAll({
            where: {
                ...searchQuery,
                institutionUuid: departmentQuery(department)
            },
            include: [
                {
                    model: Institution
                },
                {
                    model: Outline
                },
                {
                    model: Employee
                }
            ],
            order: [
                ['course_code', 'ASC'],
            ],
            ...paginate({page, pageSize}),
        });

        return res.status(200).json({
            courses: courses,
            totalResults: total,
            totalPages: totalPages,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Đã có lỗi xảy ra",
        });
    }
}

exports.getACourse = async (req, res) => {
    try {
        let course = await Course.findOne({
            where: {
                uuid: req.params.uuid,

            },
            include: [
                {
                    model: Institution
                },
                {
                    model: Employee
                }
            ]
        });

        if (course) {
            return res.status(200).json({
                course: course,
            });
        } else {
            return res.status(404).json({
                message: "Học phần không tồn tại.",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Đã có lỗi xảy ra" + error,
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!course) {
            return res.status(404).json({
                message: "Không tìm thấy học phần"
            });
        }
        await Course.destroy({
            where: {
                uuid: req.params.uuid
            }
        })

        await EmployeeCourse.destroy({
            where: {
                courseUuid: req.params.uuid
            }
        })

        res.status(200).json({
            message: "Xóa học phần thành công"
        });
    } catch (error) {
        res.status(500).json({
            message: "Không thể xóa học phần. Đã có lỗi xảy ra"
        });
    }
}

exports.updateCourse = async (req, res) => {
    let transaction;
    try {
        const course = await Course.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!course) {
            return res.status(404).json({
                message: "Không tìm thấy học phần"
            });
        }
        transaction = await connection.sequelize.transaction();
        await Course.update(
            {...req.body},
            {
                where: {
                    uuid: req.params.uuid
                }
            },
            {transaction}
        )
        await EmployeeCourse.destroy({
            where: {
                courseUuid: req.params.uuid
            },
        }, {transaction})

        let employeeCourses = [];
        req.body.lecturers.forEach((lec) => {
            employeeCourses.push({
                employeeUuid: lec.uuid,
                courseUuid: req.params.uuid
            })
        })

        await EmployeeCourse.bulkCreate(employeeCourses, {transaction})
        await transaction.commit();
        res.status(200).json({
            message: "Cập nhật học phần thành công"
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
            message: "Không thể cập nhật học phần. Đã có lỗi xảy ra"
        });
    }
}

exports.createDocument = async (req, res) => {
    try {
        await Course.create({
            uuid: uuid(),
            name: req.body.name,
            created_date: req.body.created_date,
            modified_date: req.body.modified_date,
            document_url: req.body.document_url,
            category: req.body.category,
        });
        res.status(200).json({
            message: messages.MSG_SUCCESS,
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_CREATE + constants.MAJOR,
        });
    }
};

exports.createCoursesByFile = async (req, res) => {
    let filePath =
        "/Web/KLTN/training-scheme-backend/uploads/" + req.file.filename;
    let listCourses = [];
    let transaction;
    readXlsxFile(filePath)
        .then(async (rows) => {
            rows.shift();
            try {

                await Promise.all(
                    rows.map(async (row) => {

                        const newCourse = {
                            uuid: uuid(),
                            course_name_vi: row[1],
                            course_name_en: row[2],
                            course_code: row[3],
                            credits: row[4]
                        };
                        listCourses.push(newCourse);
                    })
                );

                transaction = await connection.sequelize.transaction();

                await Course.bulkCreate(listCourses, {transaction});
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
                    message: "Không thể thêm mới danh sách học phần" + e,
                });
            }
        })
        .catch((err) => {
            res.status(500).json(err);
        });
};
