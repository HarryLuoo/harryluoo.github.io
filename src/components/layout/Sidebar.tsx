import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Github, GraduationCap, Linkedin, Mail, Menu, Twitter, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { site } from '../../content/loader';
import { visibleSorted } from '../../content/selectors';

const icons = {
  github: Github,
  linkedin: Linkedin,
  scholar: GraduationCap,
  twitter: Twitter,
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const routeFromMenuRef = useRef(false);
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const profile = site.shell.profile;
  const navigation = visibleSorted(site.shell.navigation);
  const socials = visibleSorted(site.shell.socials);

  const closeMenu = (restoreFocus: boolean) => {
    setIsOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    if (location.pathname === previousPath.current) return;
    previousPath.current = location.pathname;
    setIsOpen(false);
    if (routeFromMenuRef.current) {
      routeFromMenuRef.current = false;
      requestAnimationFrame(() => document.getElementById('main-content')?.focus());
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const main = document.getElementById('main-content');
    const priorOverflow = document.body.style.overflow;
    main?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';

    const focusables = () => [
      menuButtonRef.current,
      ...Array.from(asideRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []),
    ].filter((element): element is HTMLElement => Boolean(element));

    const firstMenuLink = asideRef.current?.querySelector<HTMLElement>('a[href]');
    requestAnimationFrame(() => firstMenuLink?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      main?.removeAttribute('inert');
      document.body.style.overflow = priorOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 w-full h-16 bg-academic-black z-50 flex items-center justify-between px-6 border-b border-stone-800">
        <span className="text-academic-cream font-serif font-bold text-xl tracking-wider min-w-0 break-words">
          {profile.name.toUpperCase()}
        </span>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => isOpen ? closeMenu(true) : setIsOpen(true)}
          className="text-academic-cream p-2 flex-shrink-0"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="primary-sidebar"
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>

      <aside
        ref={asideRef}
        id="primary-sidebar"
        aria-label="Site navigation"
        className={`fixed top-0 left-0 h-full bg-academic-black text-academic-cream z-40 transition-transform duration-300 ease-in-out w-full md:w-80 md:translate-x-0 md:visible pt-20 md:pt-0 ${isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}
      >
        <div className="h-full flex flex-col p-8 md:p-12 justify-between overflow-y-auto">
          <div>
            <div className="mb-12 hidden md:block">
              <div className="w-12 h-1 bg-academic-orange mb-8" />
              <h1 className="font-serif text-4xl leading-tight mb-4">
                {profile.name.split(' ').map((word) => <span key={word} className="block">{word.toUpperCase()}</span>)}
              </h1>
              <p className="font-sans text-stone-400 italic text-sm mb-4">{profile.role}</p>
              <div className="text-stone-500 text-xs font-sans max-w-[200px] leading-relaxed">
                <p className="mb-2">{profile.affiliation}</p>
                {profile.showBio && <p>{profile.bio}</p>}
              </div>
            </div>

            <nav aria-label="Primary" className="flex flex-col space-y-6">
              {navigation.map((item) => {
                const className = 'font-serif font-bold tracking-widest text-sm transition-colors flex items-center focus-visible:text-white';
                if (item.kind === 'internal') {
                  return (
                    <NavLink key={item.id} to={item.route} onClick={() => { routeFromMenuRef.current = isOpen; setIsOpen(false); }} className={({ isActive }) => `${className} ${isActive ? 'text-academic-orange' : 'text-stone-300 hover:text-white'}`}>
                      {({ isActive }) => <><span aria-hidden="true" className={`mr-2 transition-opacity text-academic-orange ${isActive ? 'opacity-100' : 'opacity-0'}`}>●</span>{item.label}</>}
                    </NavLink>
                  );
                }
                const href = item.kind === 'cv' ? site.shell.cvUpload : item.href;
                return (
                  <a key={item.id} href={href} target="_blank" rel="noreferrer" className={`${className} group hover:text-academic-orange`}>
                    <span aria-hidden="true" className="mr-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity text-academic-orange">●</span>
                    {item.label}<ArrowUpRight aria-hidden="true" size={12} className="ml-1 opacity-50" />
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="mt-12 md:mt-0">
            <div className="flex space-x-6 text-stone-500">
              {socials.map((social) => {
                const Icon = icons[social.platform];
                return <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" aria-label={social.platform} className="hover:text-academic-orange transition-colors"><Icon aria-hidden="true" size={18} /></a>;
              })}
              <a href={`mailto:${profile.email}`} aria-label="email" className="hover:text-academic-orange transition-colors"><Mail aria-hidden="true" size={18} /></a>
            </div>
            <div className="mt-8 text-[10px] text-stone-700 font-mono">&copy; {new Date().getFullYear()} {profile.name}</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
