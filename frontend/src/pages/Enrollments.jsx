import React, { useEffect, useState, useCallback } from 'react';
import { enrollmentAPI, studentAPI, courseAPI } from '../services/api.js';
import Layout from '../components/layout/Layout.jsx';
import toast from 'react-hot-toast';

const GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I', 'W'];
const GRADE_COLOR = { A: 'success', 'B+': 'success', B: 'info', 'C+': 'info', C: 'primary', D: 'warning', F: 'danger', I: 'secondary', W: 'secondary' };

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollForm, setEnrollForm] = useState({ student: '', course: '', semester: 'First', academicYear: '2025/2026' });
  const [gradeForm, setGradeForm] = useState({ grade: '', score: '', status: 'Enrolled', remarks: '' });
  const [saving, setSaving] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await enrollmentAPI.getAll({ status: statusFilter, semester: semesterFilter, page, limit: 10 });
      setEnrollments(res.data.enrollments);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, semesterFilter, page]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const loadStudentsAndCourses = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        studentAPI.getAll({ limit: 200, status: 'Active' }),
        courseAPI.getAll({ limit: 200, status: 'Active' }),
      ]);
      setStudents(sRes.data.students);
      setCourses(cRes.data.courses);
    } catch { toast.error('Failed to load data'); }
  };

  const openEnroll = async () => {
    await loadStudentsAndCourses();
    setEnrollForm({ student: '', course: '', semester: 'First', academicYear: '2025/2026' });
    setShowEnrollModal(true);
  };

  const openGrade = (e) => {
    setSelectedEnrollment(e);
    setGradeForm({ grade: e.grade || '', score: e.score ?? '', status: e.status, remarks: e.remarks || '' });
    setShowGradeModal(true);
  };

  const handleEnroll = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await enrollmentAPI.create(enrollForm);
      toast.success('Student enrolled successfully');
      setShowEnrollModal(false);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSaving(false);
    }
  };

  const handleGrade = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await enrollmentAPI.update(selectedEnrollment._id, {
        ...gradeForm,
        score: gradeForm.score === '' ? null : Number(gradeForm.score),
      });
      toast.success('Grade updated successfully');
      setShowGradeModal(false);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this enrollment?')) return;
    try {
      await enrollmentAPI.delete(id);
      toast.success('Enrollment removed');
      fetchEnrollments();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="fw-bold mb-1">Enrollments</h4>
            <p className="text-muted mb-0">{total} total enrollments</p>
          </div>
          <button className="btn btn-primary" onClick={openEnroll}>
            <i className="bi bi-plus-lg me-1"></i> Enroll Student
          </button>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="row g-2">
              <div className="col-md-3">
                <select className="form-select" value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {['Enrolled', 'Completed', 'Dropped', 'Withdrawn'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select" value={semesterFilter}
                  onChange={e => { setSemesterFilter(e.target.value); setPage(1); }}>
                  <option value="">All Semesters</option>
                  <option>First</option><option>Second</option><option>Summer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th><th>Course</th><th>Semester</th>
                  <th>Year</th><th>Score</th><th>Grade</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
                ) : enrollments.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-journal-x fs-1 d-block mb-2"></i>No enrollments found
                  </td></tr>
                ) : enrollments.map(e => (
                  <tr key={e._id}>
                    <td>
                      <div className="fw-medium">{e.student?.firstName} {e.student?.lastName}</div>
                      <code className="text-muted" style={{ fontSize: 11 }}>{e.student?.studentId}</code>
                    </td>
                    <td>
                      <div>{e.course?.title}</div>
                      <code className="text-primary" style={{ fontSize: 11 }}>{e.course?.courseCode}</code>
                    </td>
                    <td>{e.semester}</td>
                    <td>{e.academicYear}</td>
                    <td>{e.score !== null && e.score !== undefined ? <strong>{e.score}</strong> : <span className="text-muted">—</span>}</td>
                    <td>
                      {e.grade
                        ? <span className={`badge bg-${GRADE_COLOR[e.grade]}`}>{e.grade}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={`badge bg-${
                        { Enrolled: 'primary', Completed: 'success', Dropped: 'warning', Withdrawn: 'secondary' }[e.status]
                      }-subtle text-${
                        { Enrolled: 'primary', Completed: 'success', Dropped: 'warning', Withdrawn: 'secondary' }[e.status]
                      }`}>{e.status}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-success" onClick={() => openGrade(e)} title="Grade">
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(e._id)} title="Remove">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <span className="text-muted small">Page {page} of {pages}</span>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <i className="bi bi-chevron-left"></i>
                </button>
                {[...Array(Math.min(pages, 5))].map((_, i) => (
                  <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="btn btn-sm btn-outline-secondary" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enroll Modal */}
        {showEnrollModal && (
          <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold">Enroll Student in Course</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEnrollModal(false)} />
                </div>
                <form onSubmit={handleEnroll}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-medium">Student *</label>
                        <select className="form-select" value={enrollForm.student}
                          onChange={e => setEnrollForm({ ...enrollForm, student: e.target.value })} required>
                          <option value="">Select a student</option>
                          {students.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.studentId} — {s.firstName} {s.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium">Course *</label>
                        <select className="form-select" value={enrollForm.course}
                          onChange={e => setEnrollForm({ ...enrollForm, course: e.target.value })} required>
                          <option value="">Select a course</option>
                          {courses.map(c => (
                            <option key={c._id} value={c._id}>
                              {c.courseCode} — {c.title} ({c.enrolledCount}/{c.maxCapacity} enrolled)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Semester *</label>
                        <select className="form-select" value={enrollForm.semester}
                          onChange={e => setEnrollForm({ ...enrollForm, semester: e.target.value })}>
                          <option>First</option><option>Second</option><option>Summer</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Academic Year *</label>
                        <input className="form-control" value={enrollForm.academicYear}
                          onChange={e => setEnrollForm({ ...enrollForm, academicYear: e.target.value })}
                          placeholder="2025/2026" required />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEnrollModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <><span className="spinner-border spinner-border-sm me-1" />Enrolling...</> : 'Enroll'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Grade Modal */}
        {showGradeModal && selectedEnrollment && (
          <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold">Update Grade & Status</h5>
                  <button type="button" className="btn-close" onClick={() => setShowGradeModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="alert alert-light mb-3 py-2">
                    <strong>{selectedEnrollment.student?.firstName} {selectedEnrollment.student?.lastName}</strong>
                    <span className="text-muted ms-2">→</span>
                    <span className="ms-2">{selectedEnrollment.course?.title}</span>
                  </div>
                  <form id="grade-form" onSubmit={handleGrade}>
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Score (0–100)</label>
                        <input type="number" className="form-control" value={gradeForm.score}
                          onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })}
                          min={0} max={100} placeholder="e.g. 85" />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Grade</label>
                        <select className="form-select" value={gradeForm.grade}
                          onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })}>
                          <option value="">No grade yet</option>
                          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium">Status</label>
                        <select className="form-select" value={gradeForm.status}
                          onChange={e => setGradeForm({ ...gradeForm, status: e.target.value })}>
                          {['Enrolled', 'Completed', 'Dropped', 'Withdrawn'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium">Remarks</label>
                        <textarea className="form-control" rows={2} value={gradeForm.remarks}
                          onChange={e => setGradeForm({ ...gradeForm, remarks: e.target.value })}
                          placeholder="Optional remarks..." />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowGradeModal(false)}>Cancel</button>
                  <button type="submit" form="grade-form" className="btn btn-success" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Grade'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Enrollments;
