const { validationResult } = require('express-validator');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');

// @desc   Get all enrollments
// @route  GET /api/enrollments
// @access Private/Admin
const getEnrollments = async (req, res, next) => {
  try {
    const { status, semester, academicYear, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Enrollment.countDocuments(query);
    const enrollments = await Enrollment.find(query)
      .populate('student', 'studentId firstName lastName email program')
      .populate('course', 'courseCode title credits instructor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: enrollments.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single enrollment
// @route  GET /api/enrollments/:id
// @access Private
const getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'studentId firstName lastName email program yearOfStudy')
      .populate('course', 'courseCode title credits instructor department semester');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    res.json({ success: true, enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc   Enroll student in course
// @route  POST /api/enrollments
// @access Private/Admin
const createEnrollment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { student: studentId, course: courseId, semester, academicYear } = req.body;

    // Check student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check course exists and has capacity
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrolledCount = await Enrollment.countDocuments({ course: courseId, status: 'Enrolled' });
    if (enrolledCount >= course.maxCapacity) {
      return res.status(400).json({ success: false, message: 'Course has reached maximum capacity' });
    }

    const enrollment = await Enrollment.create({ student: studentId, course: courseId, semester, academicYear });
    const populated = await enrollment.populate([
      { path: 'student', select: 'studentId firstName lastName email' },
      { path: 'course', select: 'courseCode title credits' },
    ]);

    res.status(201).json({ success: true, enrollment: populated });
  } catch (error) {
    next(error);
  }
};

// @desc   Update enrollment (grade/status)
// @route  PUT /api/enrollments/:id
// @access Private/Admin
const updateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'studentId firstName lastName email')
      .populate('course', 'courseCode title');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    res.json({ success: true, enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete enrollment
// @route  DELETE /api/enrollments/:id
// @access Private/Admin
const deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    await enrollment.deleteOne();
    res.json({ success: true, message: 'Enrollment removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get dashboard stats
// @route  GET /api/enrollments/stats
// @access Private/Admin
const getStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'Active' });
    const totalCourses = await Course.countDocuments({ status: 'Active' });
    const totalEnrollments = await Enrollment.countDocuments({ status: 'Enrolled' });

    const gradeDistribution = await Enrollment.aggregate([
      { $match: { grade: { $ne: null } } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const recentEnrollments = await Enrollment.find()
      .populate('student', 'firstName lastName studentId')
      .populate('course', 'courseCode title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        gradeDistribution,
        recentEnrollments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEnrollments, getEnrollment, createEnrollment, updateEnrollment, deleteEnrollment, getStats };
