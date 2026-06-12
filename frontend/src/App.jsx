import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/auth/RouteGuards.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Students from './pages/Students.jsx'
import StudentDetail from './pages/StudentDetail.jsx'
import Courses from './pages/Courses.jsx'
import Enrollments from './pages/Enrollments.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '8px', fontFamily: 'inherit', fontSize: '14px' },
            success: { iconTheme: { primary: '#198754', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc3545', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses"   element={<ProtectedRoute><Courses /></ProtectedRoute>} />

          <Route path="/students"     element={<AdminRoute><Students /></AdminRoute>} />
          <Route path="/students/:id" element={<AdminRoute><StudentDetail /></AdminRoute>} />
          <Route path="/enrollments"  element={<AdminRoute><Enrollments /></AdminRoute>} />

          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
