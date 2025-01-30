import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginPage from './LoginPage';
import AddUser from './adduser';
import Home from './homepage';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/homepage"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adduser"
            element={
              <ProtectedRoute>
                <AddUser />
              </ProtectedRoute>
            }
          />
    
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
