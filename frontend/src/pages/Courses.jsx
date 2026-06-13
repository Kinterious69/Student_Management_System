import React, { useEffect, useState, useCallback } from 'react';
import { courseAPI } from '../services/api.js';
import Layout from '../components/layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEPTS = ['Computer Science', 'Information Systems', 'Business', 'Engineering',
  'Mathematics', 'Physics', 'Law', 'Other'];

const initialForm = {
  courseCode: '', title: '', description: '', credits: 3, instructor: '',
  department: '', semester: 'First', academicYear: '2026/2027',
  maxCapacity: 30, status: 'Active',
  schedule: { days: [], time: '', room: '' },
};

const Courses = () => {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getAll({ search, semester: semesterFilter, page, limit: 9 });
      setCourses(res.data.courses);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [search, semesterFilter, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const openCreate = () => { setEditing(null); setForm(initialForm); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      courseCode: c.courseCode, title: c.title, description: c.description || '',
      credits: c.credits, instructor: c.instructor, department: c.department,
      semester: c.semester, academicYear: c.academicYear,
      maxCapacity: c.maxCapacity, status: c.status,
      schedule: c.schedule || { days: [], time: '', room: '' },
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleScheduleChange = (e) => setForm({ ...form, schedule: { ...form.schedule, [e.target.name]: e.target.value } });
  const toggleDay = (day) => {
    const days = form.schedule.days.includes(day)
      ? form.schedule.days.filter(d => d !== day)
      : [...form.schedule.days, day];
    setForm({ ...form, schedule: { ...form.schedule, days } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await courseAPI.update(editing._id, form);
        toast.success('Course updated successfully');
      } else {
        await courseAPI.create(form);
        toast.success('Course created successfully');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course and all its enrollments?')) return;
    try {
      await courseAPI.delete(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Delete failed');
    }
  };

  const semesterColor = { First: 'primary', Second: 'success', Summer: 'warning' };

  return (
    <Layout>
      <div className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="fw-bold mb-1">Courses</h4>
            <p className="text-muted mb-0">{total} total courses</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreate}>
              <i className="bi bi-plus-lg me-1"></i> Add Course
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="row g-2">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                  <input type="text" className="form-control border-start-0"
                    placeholder="Search by code, title, or instructor..."
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
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

        {/* Course Cards */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : courses.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-book fs-1 d-block mb-2"></i>No courses found
          </div>
        ) : (
          <div className="row g-3">
            {courses.map(c => (
              <div key={c._id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body" style={{backgroundColor:"#EEEEEE"}}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <code className="text-primary fw-bold">{c.courseCode}</code>
                      <span className={`badge bg-${semesterColor[c.semester]}-subtle text-${semesterColor[c.semester]}`}>
                        {c.semester}
                      </span>
                    </div>
                    <h6 className="fw-semibold mb-1">{c.title}</h6>
                    <p className="text-muted small mb-2">{c.description || 'No description available.'}</p>
                    <div className="d-flex flex-wrap gap-2 mb-3 small text-muted">
                      <span><i className="bi bi-person me-1"></i>{c.instructor}</span>
                      <span><i className="bi bi-star me-1"></i>{c.credits} credits</span>
                      <span><i className="bi bi-people me-1"></i>{c.enrolledCount}/{c.maxCapacity}</span>
                    </div>
                    <div className="progress mb-2" style={{ height: 6 }}>
                      <div className="progress-bar bg-primary" style={{ width: `${Math.min((c.enrolledCount / c.maxCapacity) * 100, 100)}%` }} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">{c.academicYear}</span>
                      {isAdmin && (
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(c)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="d-flex justify-content-center gap-1 mt-4">
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <i className="bi bi-chevron-left"></i>
            </button>
            {[...Array(pages)].map((_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="btn btn-sm btn-outline-secondary" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
     {/* Create/Edit Modal */}
{showModal && isAdmin && (
  <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
    {/* FIX: Form now wraps the modal structures safely */}
    <form onSubmit={handleSubmit} className="h-100">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">{editing ? 'Edit Course' : 'Add New Course'}</h5>
            <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
          </div>
          
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-medium">Course Code</label>
                <input className="form-control" name="courseCode" value={form.courseCode}
                  onChange={handleChange} placeholder="e.g. CS101" required />
              </div>
              <div className="col-md-8">
                <label className="form-label fw-medium">Course Title</label>
                <input className="form-control" name="title" value={form.title}
                  onChange={handleChange} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-medium">Description</label>
                <textarea className="form-control" name="description" value={form.description}
                  onChange={handleChange} rows={2} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Credits *</label>
                <input type="number" className="form-control" name="credits" value={form.credits}
                  onChange={handleChange} min={1} max={6} required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Max Capacity</label>
                <input type="number" className="form-control" name="maxCapacity" value={form.maxCapacity}
                  onChange={handleChange} min={1} required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option>Active</option><option>Inactive</option><option>Completed</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Instructor</label>
                <input className="form-control" name="instructor" value={form.instructor}
                  onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Department</label>
                <select className="form-select" name="department" value={form.department}
                  onChange={handleChange} required>
                  <option value="">Select department</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Semester</label>
                <select className="form-select" name="semester" value={form.semester} onChange={handleChange}>
                  <option>First</option><option>Second</option><option>Summer</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Academic Year</label>
                <input className="form-control" name="academicYear" value={form.academicYear}
                  onChange={handleChange} placeholder="2025/2026" required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Time</label>
                <input className="form-control" name="time" value={form.schedule.time}
                  onChange={handleScheduleChange} placeholder="08:00 - 10:00" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Room</label>
                <input className="form-control" name="room" value={form.schedule.room}
                  onChange={handleScheduleChange}  />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Days</label>
                <div className="d-flex gap-2 flex-wrap mt-1">
                  {DAYS.map(d => (
                    <button key={d} type="button"
                      className={`btn btn-sm ${form.schedule.days.includes(d) ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => toggleDay(d)}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Course'}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
)}

      </div>
    </Layout>
  );
};

export default Courses;
