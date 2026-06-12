const { validationResult } = require('express-validator');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

// @desc   Get all students (with search, filter, pagination)
// @route  GET /api/students
// @access Private/Admin
const getStudents = async (req, res, next) => {
  try {
    const { search, status, program, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (program) query.program = { $regex: program, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: students.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single student
// @route  GET /api/students/:id
// @access Private
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc   Create student
// @route  POST /api/students
// @access Private/Admin
const createStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const student = await Student.create(req.body);
    res.status(201).json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc   Update student
// @route  PUT /api/students/:id
// @access Private/Admin
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete student
// @route  DELETE /api/students/:id
// @access Private/Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    // Also remove all enrollments
    await Enrollment.deleteMany({ student: req.params.id });
    await student.deleteOne();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get student enrollments
// @route  GET /api/students/:id/enrollments
// @access Private
const getStudentEnrollments = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const enrollments = await Enrollment.find({ student: req.params.id })
      .populate('course', 'courseCode title credits instructor semester')
      .sort({ createdAt: -1 });
    res.json({ success: true, enrollments });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentEnrollments };
