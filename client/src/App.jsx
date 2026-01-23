import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddAudio from './pages/AddAudio'; // <--- Import this
import Categories from './pages/Categories';
import Users from './pages/Users';
import Goals from './pages/Goals';
import Journals from './pages/Journals';
import Profile from './pages/Profile';


function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-audio" element={<AddAudio />} /> {/* <--- Add this Route */}
        <Route path="/categories" element={<Categories />} />
        <Route path="/users" element={<Users />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/journals" element={<Journals />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}


export default App;