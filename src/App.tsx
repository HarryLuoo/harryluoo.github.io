import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import RecoveryState from './components/content/RecoveryState';
import Sidebar from './components/layout/Sidebar';
import SiteMetadata from './components/layout/SiteMetadata';
import About from './pages/About';
import { GardenDetail, GardenList } from './pages/Garden';
import Home from './pages/Home';
import { ProjectDetail, ProjectsList } from './pages/Projects';
import { ResearchDetail, ResearchList } from './pages/Research';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PublicRoutes = () => (
  <div className="flex flex-col md:flex-row min-h-screen bg-academic-cream text-academic-black overflow-x-clip">
    <Sidebar />
    <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 pt-16 md:pt-0 md:ml-80">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/research" element={<ResearchList />} />
        <Route path="/research/:slug" element={<ResearchDetail />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/garden" element={<GardenList />} />
        <Route path="/garden/:slug" element={<GardenDetail />} />
        <Route path="*" element={<RecoveryState />} />
      </Routes>
    </main>
  </div>
);

const App = () => (
  <HashRouter>
    <ScrollToTop />
    <SiteMetadata />
    <PublicRoutes />
  </HashRouter>
);

export default App;
