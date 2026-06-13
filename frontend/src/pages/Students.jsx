import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../services/api.js';
import Layout from '../components/layout/Layout.jsx';
import toast from 'react-hot-toast';

const PROGRAMS = ['Computer Science', 'Information Systems', 'Business Administration',
  'Engineering', 'Mathematics', 'Physics', 'Economics', 'Law', 'Medicine', 'Other'];

const STATUS_BADGE = { Active: 'success', Inactive: 'secondary', Graduated: 'info', Suspended: 'danger' };

const initialForm = {
  studentId: '', firstName: '', lastName: '', email: '', phone: '',
  program: '', yearOfStudy: 1, gender: '', status: 'Active', address: '',
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll({ search, status: statusFilter, page, limit: 10 });
      setStudents(res.data.students);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openCreate = () => { setEditing(null); setForm(initialForm); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ studentId: s.studentId, firstName: s.firstName, lastName: s.lastName,
      email: s.email, phone: s.phone || '', program: s.program, yearOfStudy: s.yearOfStudy,
      gender: s.gender || '', status: s.status, address: s.address || '' });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await studentAPI.update(editing._id, form);
        toast.success('Student updated successfully');
      } else {
        await studentAPI.create(form);
        toast.success('Student created successfully');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student and all their enrollments?')) return;
    setDeleting(id);
    try {
      await studentAPI.delete(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="fw-bold mb-1">Students</h4>
            <p className="text-muted mb-0">{total} total students</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i> Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="row g-2 align-items-center">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                  <input type="text" className="form-control border-start-0" placeholder="Search by name, ID or email..."
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
              </div>
              <div className="col-md-3">
                <select className="form-select" value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {['Active', 'Inactive', 'Graduated', 'Suspended'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
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
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Program</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" />
                  </td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-2"></i>
                    No students found
                  </td></tr>
                ) : students.map(s => (
                  <tr key={s._id}>
                    <td><code className="text-primary">{s.studentId}</code></td>
                    <td className="fw-medium">{s.firstName} {s.lastName}</td>
                    <td className="text-muted small">{s.email}</td>
                    <td>{s.program}</td>
                    <td>Year {s.yearOfStudy}</td>
                    <td>
                      <span className={`badge bg-${STATUS_BADGE[s.status]}`}>{s.status}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/students/${s._id}`} className="btn btn-sm btn-outline-info" title="View">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(s)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" title="Delete"
                          disabled={deleting === s._id} onClick={() => handleDelete(s._id)}>
                          {deleting === s._id
                            ? <span className="spinner-border spinner-border-sm" />
                            : <i className="bi bi-trash"></i>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <span className="text-muted small">Page {page} of {pages}</span>
              <div className="d-flex gap-1">
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
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold">
                    {editing ? 'Edit Student' : 'Add New Student'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-medium">Student ID *</label>
                        <input className="form-control" name="studentId" value={form.studentId}
                          onChange={handleChange} placeholder="e.g. UTM2024001" required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-medium">First Name *</label>
                        <input className="form-control" name="firstName" value={form.firstName}
                          onChange={handleChange} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-medium">Last Name *</label>
                        <input className="form-control" name="lastName" value={form.lastName}
                          onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Email *</label>
                        <input type="email" className="form-control" name="email" value={form.email}
                          onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Phone </label>
                        <input className="form-control" name="phone" value={form.phone}
                          onChange={handleChange} placeholder="+220 xxx xxxx" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Program *</label>
                        <select className="form-select" name="program" value={form.program}
                          onChange={handleChange} required>
                          <option value="">Select program</option>
                          {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-medium">Year of Study *</label>
                        <select className="form-select" name="yearOfStudy" value={form.yearOfStudy}
                          onChange={handleChange} required>
                          {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-medium">Gender</label>
                        <select className="form-select" name="gender" value={form.gender}
                          onChange={handleChange}>
                          <option value="">Select</option>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-medium">Status</label>
                        <select className="form-select" name="status" value={form.status}
                          onChange={handleChange}>
                          {['Active', 'Inactive', 'Graduated', 'Suspended'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-8">
                        <label className="form-label fw-medium">Address</label>
                        <input className="form-control" name="address" value={form.address}
                          onChange={handleChange} placeholder="City, Country" />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Student'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Students;
