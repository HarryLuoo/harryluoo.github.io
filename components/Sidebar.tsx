import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { MY_PROFILE, NAVIGATION_LINKS, SOCIAL_ICONS } from '../constants';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Close menu when route changes on mobile
  React.useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-academic-black z-50 flex items-center justify-between px-6 border-b border-stone-800">
        <span className="text-academic-cream font-serif font-bold text-xl tracking-wider">
          {MY_PROFILE.name.toUpperCase()}
        </span>
        <button onClick={toggleMenu} className="text-academic-cream p-2">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-academic-black text-academic-cream z-40 transition-transform duration-300 ease-in-out
          w-full md:w-80 md:translate-x-0 pt-20 md:pt-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col p-8 md:p-12 justify-between">
          
          {/* Top Section: Identity */}
          <div>
            <div className="mb-12 hidden md:block">
              {/* Decorative line */}
              <div className="w-12 h-1 bg-academic-orange mb-8"></div>
              
              <h1 className="font-serif text-4xl leading-tight mb-4">
                {MY_PROFILE.name.split(' ').map((word, i) => (
                  <span key={i} className="block">{word.toUpperCase()}</span>
                ))}
              </h1>
              <p className="font-sans text-stone-400 italic text-sm mb-4">
                {MY_PROFILE.role}
              </p>
              
              <div className="text-stone-500 text-xs font-sans max-w-[200px] leading-relaxed">
                <p className="mb-2">{MY_PROFILE.affiliation}</p>
                {/* Conditionally render bio based on config */}
                {MY_PROFILE.showBio && (
                  <p>{MY_PROFILE.bio}</p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col space-y-6">
              {NAVIGATION_LINKS.map((link) => (
                link.isExternal ? (
                  <a 
                    key={link.path}
                    href={link.path}
                    target="_blank"
                    rel="noreferrer"
                    className="font-serif font-bold tracking-widest text-sm hover:text-academic-orange transition-colors flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-academic-orange">●</span>
                    {link.name}
                    <ArrowUpRight size={12} className="ml-1 opacity-50" />
                  </a>
                ) : (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => `
                      font-serif font-bold tracking-widest text-sm transition-colors flex items-center
                      ${isActive ? 'text-academic-orange' : 'text-stone-300 hover:text-white'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`mr-2 transition-opacity text-academic-orange ${isActive ? 'opacity-100' : 'opacity-0'}`}>●</span>
                        {link.name}
                      </>
                    )}
                  </NavLink>
                )
              ))}
            </nav>
          </div>

          {/* Footer: Socials */}
          <div className="mt-12 md:mt-0">
            <div className="flex space-x-6 text-stone-500">
              {Object.entries(MY_PROFILE.socials).map(([key, url]) => (
                url && (
                  <a 
                    key={key} 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:text-academic-orange transition-colors"
                    aria-label={key}
                  >
                    {SOCIAL_ICONS[key]}
                  </a>
                )
              ))}
              <a href={`mailto:${MY_PROFILE.email}`} className="hover:text-academic-orange transition-colors">
                {SOCIAL_ICONS.email}
              </a>
            </div>
            <div className="mt-8 text-[10px] text-stone-700 font-mono">
              &copy; {new Date().getFullYear()} {MY_PROFILE.name}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
