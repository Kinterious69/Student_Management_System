import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';

const GRADE_COLOR = { A: 'success', 'B+': 'success', B: 'info', 'C+': 'info', C: 'primary', D: 'warning', F: 'danger' };

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, eRes] = await Promise.all([
          studentAPI.getOne(id),
          studentAPI.getEnrollments(id),
        ]);
        setStudent(sRes.data.student);
        setEnrollments(eRes.data.enrollments);
      } catch {
        toast.error('Failed to load student');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  if (loading) return (
    <Layout>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" />
      </div>
    </Layout>
  );

  const totalCredits = enrollments
    .filter(e => e.status === 'Completed')
    .reduce((sum, e) => sum + (e.course?.credits || 0), 0);

  return (
    <Layout>
      <div className="p-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/students')}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
          <h4 className="fw-bold mb-0 ms-1">Student Profile</h4>
        </div>

        <div className="row g-3">
          {/* Profile Card */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 80, height: 80 }}>
                  <i className="bi bi-person-fill text-primary" style={{ fontSize: 36 }}></i>
                </div>
                <h5 className="fw-bold">{student.firstName} {student.lastName}</h5>
                <code className="text-primary">{student.studentId}</code>
                <div className="mt-2">
                  <span className={`badge bg-${
                    { Active: 'success', Inactive: 'secondary', Graduated: 'info', Suspended: 'danger' }[student.status]
                  }`}>{student.status}</span>
                </div>

                <hr />
                <div className="text-start">
                  {[
                    { icon: 'bi-envelope', label: 'Email', val: student.email },
                    { icon: 'bi-telephone', label: 'Phone', val: student.phone || '—' },
                    { icon: 'bi-mortarboard', label: 'Program', val: student.program },
                    { icon: 'bi-calendar', label: 'Year', val: `Year ${student.yearOfStudy}` },
                    { icon: 'bi-gender-ambiguous', label: 'Gender', val: student.gender || '—' },
                    { icon: 'bi-geo-alt', label: 'Address', val: student.address || '—' },
                  ].map(({ icon, label, val }) => (
                    <div key={label} className="d-flex align-items-start gap-2 mb-2">
                      <i className={`bi ${icon} text-muted mt-1`}></i>
                      <div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
                        <div style={{ fontSize: 14 }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enrollments */}
          <div className="col-md-8">
            <div className="row g-3 mb-3">
              {[
                { label: 'Total Enrollments', val: enrollments.length, color: '#0d6efd' },
                { label: 'Completed Courses', val: enrollments.filter(e => e.status === 'Completed').length, color: '#198754' },
                { label: 'Credits Earned', val: totalCredits, color: '#6f42c1' },
              ].map(({ label, val, color }) => (
                <div key={label} className="col-4">
                  <div className="card border-0 shadow-sm text-center p-3">
                    <h3 className="fw-bold mb-0" style={{ color }}>{val}</h3>
                    <div className="text-muted small">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-semibold">Enrolled Courses</div>
              {enrollments.length === 0 ? (
                <div className="card-body text-center text-muted py-4">
                  <i className="bi bi-journal-x fs-1 d-block mb-2"></i>
                  No enrollments yet
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th><th>Course</th><th>Credits</th>
                        <th>Semester</th><th>Grade</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map(e => (
                        <tr key={e._id}>
                          <td><code>{e.course?.courseCode}</code></td>
                          <td>{e.course?.title}</td>
                          <td className="text-center">{e.course?.credits}</td>
                          <td>{e.semester}</td>
                          <td>
                            {e.grade ? (
                              <span className={`badge bg-${GRADE_COLOR[e.grade] || 'secondary'}`}>{e.grade}</span>
                            ) : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            <span className={`badge bg-${
                              { Enrolled: 'primary', Completed: 'success', Dropped: 'warning', Withdrawn: 'secondary' }[e.status]
                            }-subtle text-${
                              { Enrolled: 'primary', Completed: 'success', Dropped: 'warning', Withdrawn: 'secondary' }[e.status]
                            }`}>{e.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDetail;
