const express = require('express');
const { body } = require('express-validator');
const {
  getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentEnrollments,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const studentValidation = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('program').notEmpty().withMessage('Program is required'),
  body('yearOfStudy').isInt({ min: 1, max: 6 }).withMessage('Year of study must be between 1 and 6'),
];

router.use(protect);

router.route('/')
  .get(authorize('admin'), getStudents)
  .post(authorize('admin'), studentValidation, createStudent);

router.route('/:id')
  .get(getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

router.get('/:id/enrollments', getStudentEnrollments);

module.exports = router;
