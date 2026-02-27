import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import AssignmentList from './pages/AssignmentList/AssignmentList';
import AssignmentAttempt from './pages/AssignmentAttempt/AssignmentAttempt';
import AuthPage from './pages/Auth/AuthPage';
import './styles/main.scss';

interface User {
  name: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Restore user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleAuth = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<AssignmentList />} />
        <Route path="/assignment/:id" element={<AssignmentAttempt />} />
        <Route
          path="/login"
          element={<AuthPage mode="login" onAuth={handleAuth} />}
        />
        <Route
          path="/register"
          element={<AuthPage mode="register" onAuth={handleAuth} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
