import { createContext, useContext, useEffect, useState } from "react";

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    console.log("Updated Permissions in Context:", permissions);
}, [permissions]);


  return (
    <PermissionsContext.Provider value={{ permissions, setPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};
