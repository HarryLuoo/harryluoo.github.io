import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

interface RecoveryStateProps {
  title?: string;
  description?: string;
  returnTo?: string;
  returnLabel?: string;
}

const RecoveryState = ({
  title = 'Page not found',
  description = 'The requested page is unavailable or may have moved.',
  returnTo = '/',
  returnLabel = 'Return Home',
}: RecoveryStateProps) => {
  useDocumentMeta(title, description, window.location.hash.slice(1) || '/');
  return (
    <section className="min-h-screen p-8 md:p-16 lg:p-24 max-w-4xl mx-auto flex items-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-academic-orange mb-4">404</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 break-words">{title}</h1>
        <p className="font-sans text-lg text-stone-600 max-w-xl mb-8">{description}</p>
        <Link to={returnTo} className="inline-flex border border-academic-black px-5 py-3 font-mono text-xs uppercase tracking-wider hover:bg-academic-black hover:text-white transition-colors">
          {returnLabel}
        </Link>
      </div>
    </section>
  );
};

export default RecoveryState;
