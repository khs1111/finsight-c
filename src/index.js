// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NavVisibilityProvider } from './components/navigation/NavVisibilityContext';
import { BrowserRouter } from 'react-router-dom';

// Use basename when hosted under GitHub Pages repo path
const getBaseName = () => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  // If on GitHub Pages for khs1111.github.io/finsight-c, set basename to '/finsight-c'
  if (host && /github\.io$/i.test(host)) return '/finsight-c';
  return undefined;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename={getBaseName()}>
    <NavVisibilityProvider>
      <App />
    </NavVisibilityProvider>
  </BrowserRouter>
);
