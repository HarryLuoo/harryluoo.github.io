import React from 'react';
import ReactDOM from 'react-dom/client';
import StudioApp from './StudioApp';
import './studio.css';

const root = document.getElementById('studio-root');
if (!root) throw new Error('Studio root is missing');

ReactDOM.createRoot(root).render(<React.StrictMode><StudioApp /></React.StrictMode>);
