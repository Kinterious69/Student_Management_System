const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc   Get all courses (with search, filter, pagination)
// @route  GET /api/courses
// @access Private
const getCourses = async (req, res, next) => {
  try {
    const { search, status, department, semester, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (department) query.department = { $regex: department, $options: 'i' };
    if (semester) query.semester = semester;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get enrollment count per course
    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const enrolledCount = await Enrollment.countDocuments({
          course: course._id,
          status: 'Enrolled',
        });
        return { ...course.toJSON(), enrolledCount };
      })
    );

    res.json({
      success: true,
      count: courses.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      courses: coursesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single course
// @route  GET /api/courses/:id
// @access Private
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const enrolledCount = await Enrollment.countDocuments({ course: course._id, status: 'Enrolled' });
    res.json({ success: true, course: { ...course.toJSON(), enrolledCount } });
  } catch (error) {
    next(error);
  }
};

// @desc   Create course
// @route  POST /api/courses
// @access Private/Admin
const createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc   Update course
// @route  PUT /api/courses/:id
// @access Private/Admin
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete course
// @route  DELETE /api/courses/:id
// @access Private/Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    await Enrollment.deleteMany({ course: req.params.id });
    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get course enrollments
// @route  GET /api/courses/:id/enrollments
// @access Private/Admin
const getCourseEnrollments = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const enrollments = await Enrollment.find({ course: req.params.id })
      .populate('student', 'studentId firstName lastName email program yearOfStudy')
      .sort({ createdAt: -1 });
    res.json({ success: true, enrollments });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getCourseEnrollments };
