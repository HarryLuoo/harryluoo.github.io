import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import RecoveryState from './components/content/RecoveryState';
import Sidebar from './components/layout/Sidebar';
import SiteMetadata from './components/layout/SiteMetadata';
import About, { AboutNews } from './pages/About';
import { NoteDetail, NotesList } from './pages/Notes';
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

const LegacyNoteRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/notes/${slug ?? ''}`} replace />;
};

const PublicRoutes = () => (
  <div className="flex flex-col md:flex-row min-h-screen bg-academic-cream text-academic-black overflow-x-clip">
    <Sidebar />
    <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 pt-16 md:pt-0 md:ml-80">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/news" element={<AboutNews />} />
        <Route path="/research" element={<ResearchList />} />
        <Route path="/research/:slug" element={<ResearchDetail />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/notes" element={<NotesList />} />
        <Route path="/notes/:slug" element={<NoteDetail />} />
        <Route path="/garden" element={<Navigate to="/notes" replace />} />
        <Route path="/garden/:slug" element={<LegacyNoteRedirect />} />
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
