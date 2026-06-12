import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { enrollmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';

const GRADE_COLORS = {
  A: '#198754', 'B+': '#20c997', B: '#0dcaf0', 'C+': '#0d6efd',
  C: '#6f42c1', D: '#ffc107', F: '#dc3545',
};

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to} className="text-decoration-none">
    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="text-muted mb-1 small fw-medium">{label}</p>
            <h2 className="fw-bold mb-0">{value ?? <span className="placeholder col-4"></span>}</h2>
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 52, height: 52, backgroundColor: color + '20' }}>
            <i className={`bi ${icon}`} style={{ fontSize: 22, color }}></i>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    enrollmentAPI.getStats()
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  return (
    <Layout>
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h4 className="fw-bold mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.name?.split(' ')[0]} 👋
          </h4>
          <p className="text-muted mb-0">
            {isAdmin ? "Here's what's happening in your institution today." : "Welcome to your student portal."}
          </p>
        </div>

        {isAdmin ? (
          <>
            {/* Stat Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <StatCard icon="bi-people-fill" label="Active Students" value={stats?.totalStudents}
                  color="#0d6efd" to="/students" />
              </div>
              <div className="col-md-4">
                <StatCard icon="bi-book-fill" label="Active Courses" value={stats?.totalCourses}
                  color="#198754" to="/courses" />
              </div>
              <div className="col-md-4">
                <StatCard icon="bi-journal-check" label="Total Enrollments" value={stats?.totalEnrollments}
                  color="#6f42c1" to="/enrollments" />
              </div>
            </div>

            <div className="row g-3">
              {/* Grade Distribution Chart */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Grade Distribution</h6>
                    {loading ? (
                      <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-primary" />
                      </div>
                    ) : stats?.gradeDistribution?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.gradeDistribution}>
                          <XAxis dataKey="_id" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {stats.gradeDistribution.map((entry) => (
                              <Cell key={entry._id} fill={GRADE_COLORS[entry._id] || '#6c757d'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted py-5">
                        <i className="bi bi-bar-chart fs-1 d-block mb-2"></i>
                        No grade data yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Enrollments */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-semibold mb-0">Recent Enrollments</h6>
                      <Link to="/enrollments" className="small text-primary text-decoration-none">View all</Link>
                    </div>
                    {loading ? (
                      <div className="d-flex justify-content-center py-4">
                        <div className="spinner-border text-primary" />
                      </div>
                    ) : stats?.recentEnrollments?.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {stats.recentEnrollments.map(e => (
                          <div key={e._id} className="list-group-item px-0 d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: 36, height: 36, minWidth: 36 }}>
                              <i className="bi bi-person text-primary"></i>
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="fw-medium text-truncate" style={{ fontSize: 14 }}>
                                {e.student?.firstName} {e.student?.lastName}
                              </div>
                              <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                                {e.course?.courseCode} – {e.course?.title}
                              </div>
                            </div>
                            <span className="badge bg-success-subtle text-success">{e.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted py-4">No recent enrollments</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Student dashboard */
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-book fs-1 text-primary d-block mb-3"></i>
                  <h5 className="fw-semibold">Browse Courses</h5>
                  <p className="text-muted">View available courses and their details</p>
                  <Link to="/courses" className="btn btn-primary">View Courses</Link>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-person-badge fs-1 text-success d-block mb-3"></i>
                  <h5 className="fw-semibold">Your Profile</h5>
                  <p className="text-muted">Logged in as <strong>{user?.email}</strong></p>
                  <span className="badge bg-info text-dark">Student</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
