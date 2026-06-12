const express = require('express');
const { body } = require('express-validator');
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse, getCourseEnrollments,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const courseValidation = [
  body('courseCode').notEmpty().withMessage('Course code is required'),
  body('title').notEmpty().withMessage('Course title is required'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('instructor').notEmpty().withMessage('Instructor is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('semester').isIn(['First', 'Second', 'Summer']).withMessage('Invalid semester'),
  body('academicYear').matches(/^\d{4}\/\d{4}$/).withMessage('Academic year format must be YYYY/YYYY'),
  body('maxCapacity').isInt({ min: 1 }).withMessage('Max capacity must be at least 1'),
];

router.use(protect);

router.route('/')
  .get(getCourses)
  .post(authorize('admin'), courseValidation, createCourse);

router.route('/:id')
  .get(getCourse)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

router.get('/:id/enrollments', authorize('admin'), getCourseEnrollments);

module.exports = router;
