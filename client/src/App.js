import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// App Content (after authentication check)
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/ideas" 
        element={
          <ProtectedRoute>
            <Layout>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">ไอเดียทั้งหมด</h1>
                <p>หน้านี้กำลังพัฒนา...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/ideas/create" 
        element={
          <ProtectedRoute>
            <Layout>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">สร้างไอเดียใหม่</h1>
                <p>หน้านี้กำลังพัฒนา...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">โปรไฟล์</h1>
                <p>หน้านี้กำลังพัฒนา...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">ไม่พบหน้าที่คุณต้องการ</p>
              <a href="/dashboard" className="btn btn-primary">กลับสู่หน้าหลัก</a>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
