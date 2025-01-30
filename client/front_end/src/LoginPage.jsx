import './LoginPage.css';

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/homepage" />;
  }
  const handleLogin = () => {
    if (login(username, password)) {
      navigate('/homepage');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="form-container">
    <form className='LoginForm'>
      <label htmlFor="UserName">User Name</label>
      <input
        type="text"
        name="UserName"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <label htmlFor="Password">Password</label>
      <input
        type="password"
        name="Password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
    </div>
  );
};

export default LoginPage;
