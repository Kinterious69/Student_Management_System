import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center " style={{backgroundColor:"#1a1a1a"}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="text-center mb-4">
              <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 60, height: 60 }}>
                <i className="bi bi-mortarboard-fill text-white fs-4"></i>
              </div>
              <h2 className="fw-bold text-white">USMS</h2>
              <p className="text-white">University Student Management System</p>
            </div>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4"  style={{backgroundColor:"#2b3035"}}>
                <h5 className="fw-semibold mb-4 text-center text-white">Sign in to your account</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-medium text-white">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="enter your email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium text-white">Password</label>
                    <input
                      type="password"
                      className="form-control "
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="enter your password"
                      autoComplete="current-password"
                      required
                    
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" />Signing in...</>
                    ) : 'Sign in'}
                  </button>
                </form>
                <p className="text-center  mt-3 mb-0 small text-white">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary fw-medium text-decoration-none">Register</Link>
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
