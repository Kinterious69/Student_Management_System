const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: ['First', 'Second', 'Summer'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}\/\d{4}$/, 'Academic year format must be YYYY/YYYY'],
    },
    grade: {
      type: String,
      enum: ['A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I', 'W', null],
      default: null,
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: null,
    },
    status: {
      type: String,
      enum: ['Enrolled', 'Dropped', 'Completed', 'Withdrawn'],
      default: 'Enrolled',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, 'Remarks cannot exceed 300 characters'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment
enrollmentSchema.index({ student: 1, course: 1, academicYear: 1, semester: 1 }, { unique: true });

// Virtual for letter grade from score
enrollmentSchema.virtual('calculatedGrade').get(function () {
  if (this.score === null || this.score === undefined) return null;
  if (this.score >= 90) return 'A';
  if (this.score >= 80) return 'B+';
  if (this.score >= 75) return 'B';
  if (this.score >= 70) return 'C+';
  if (this.score >= 65) return 'C';
  if (this.score >= 50) return 'D';
  return 'F';
});

enrollmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
