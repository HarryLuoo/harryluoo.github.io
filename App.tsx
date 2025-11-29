import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Research from './pages/Research';
import Projects from './pages/Projects';
import Garden from './pages/Garden';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col md:flex-row min-h-screen bg-academic-cream text-academic-black">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area 
            Added pt-16 to account for the fixed 4rem (16) header on mobile.
            md:pt-0 removes this padding on desktop where the header is in the sidebar.
            md:ml-80 shifts content right to accommodate fixed sidebar on desktop.
        */}
        <main className="flex-1 pt-16 md:pt-0 md:ml-80 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/research" element={<Research />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/garden" element={<Garden />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;