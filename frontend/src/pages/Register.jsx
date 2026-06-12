import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="text-center mb-4">
              <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 60, height: 60 }}>
                <i className="bi bi-mortarboard-fill text-white fs-4"></i>
              </div>
              <h2 className="fw-bold">UniSMS</h2>
              <p className="text-muted">Create your student account</p>
            </div>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="fw-semibold mb-4">Create an account</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Full name</label>
                    <input type="text" className="form-control" name="name"
                      value={form.name} onChange={handleChange} placeholder="John Doe" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Email address</label>
                    <input type="email" className="form-control" name="email"
                      value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Password</label>
                    <input type="password" className="form-control" name="password"
                      value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Confirm password</label>
                    <input type="password" className="form-control" name="confirmPassword"
                      value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-medium" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
                    ) : 'Create account'}
                  </button>
                </form>
                <p className="text-center text-muted mt-3 mb-0 small">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-medium text-decoration-none">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
