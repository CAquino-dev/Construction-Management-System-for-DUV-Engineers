import { createContext, useContext, useEffect, useState } from "react";

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    try {
      const storedPermissions = localStorage.getItem('permissions');
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
    } catch (error) {
      console.error('Failed to parse permissions:', error);
      setPermissions(null);
    }
  }, []);
  
  return (
    <PermissionsContext.Provider value={{ permissions, setPermissions, }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};


