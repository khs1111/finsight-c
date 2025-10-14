import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function CategoryNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    
  ];

  return (
    <nav className="category-nav">
      {categories.map((cat) => (
        <button
          key={cat.name}
          className={`category-button ${location.pathname === cat.path ? 'active' : ''}`}
          onClick={() => navigate(cat.path)}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}

export default CategoryNav;


