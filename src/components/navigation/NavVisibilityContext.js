import React, { createContext, useContext, useState, useCallback } from 'react';

const NavVisibilityContext = createContext({ hide:false, setHide: () => {} });

export const NavVisibilityProvider = ({ children }) => {
  const [hide, setHide] = useState(false);
  const setHidden = useCallback((val) => setHide(val), []);
  return (
    <NavVisibilityContext.Provider value={{ hide, setHide: setHidden }}>
      {children}
    </NavVisibilityContext.Provider>
  );
};

export const useNavVisibility = () => useContext(NavVisibilityContext);

export default NavVisibilityContext;