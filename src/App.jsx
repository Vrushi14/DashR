import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SampleReports from './pages/SampleReports';
import Blog from './pages/Blog';
import GrowthReport from './pages/GrowthReport';
import Legal from './pages/Legal';
import './index.css';

function Layout({ children }) {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/$/, '').toLowerCase();
  const hideNavAndFooter = ['/login', '/signup', '/dashboard'].includes(normalizedPath);

  return (
    <div className="app">
      {!hideNavAndFooter && <Navbar />}
      <main>
        {children}
      </main>
      {!hideNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sample-reports" element={<SampleReports />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/growth-report" element={<GrowthReport />} />
          <Route path="/legal/privacy-policy" element={<Legal />} />
          <Route path="/legal/terms-of-service" element={<Legal />} />
          <Route path="/legal/cookie-policy" element={<Legal />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
