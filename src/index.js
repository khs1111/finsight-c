// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NavVisibilityProvider } from './components/navigation/NavVisibilityContext';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <NavVisibilityProvider>
      <App />
    </NavVisibilityProvider>
  </BrowserRouter>
);
