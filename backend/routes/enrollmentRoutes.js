const express = require('express');
const { body } = require('express-validator');
const {
  getEnrollments, getEnrollment, createEnrollment, updateEnrollment, deleteEnrollment, getStats,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const enrollmentValidation = [
  body('student').notEmpty().withMessage('Student is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('semester').isIn(['First', 'Second', 'Summer']).withMessage('Invalid semester'),
  body('academicYear').matches(/^\d{4}\/\d{4}$/).withMessage('Academic year format must be YYYY/YYYY'),
];

router.use(protect);

router.get('/stats', authorize('admin'), getStats);

router.route('/')
  .get(authorize('admin'), getEnrollments)
  .post(authorize('admin'), enrollmentValidation, createEnrollment);

router.route('/:id')
  .get(getEnrollment)
  .put(authorize('admin'), updateEnrollment)
  .delete(authorize('admin'), deleteEnrollment);

module.exports = router;
