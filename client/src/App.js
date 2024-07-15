// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard'; 
import LoginForm from './components/LoginForm'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

axios.defaults.withCredentials = true;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    axios.get('/protected')
      .then(response => {
        setLoggedIn(true);
        setUsername(response.data.user);
      })
      .catch(error => {
        console.error('Error fetching protected route:', error);
        setLoggedIn(false);
      });
  }, []);

  const handleLogin = (user) => {
    setLoggedIn(true);
    setUsername(user);
  };

  const handleLogout = () => {
    axios.get('/logout')
      .then(() => {
        setLoggedIn(false);
        setUsername('');
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={loggedIn ? <Navigate to="/dashboard" /> : <LoginForm onLogin={handleLogin} />} />
          <Route path="/dashboard" element={loggedIn ? <Dashboard username={username} onLogout={handleLogout} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
