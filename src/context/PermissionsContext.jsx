import { createContext, useContext, useEffect, useState } from "react";

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  // permissions.map((perm) => {
  //   if(perm === "Y"){
  //     console.log(perm);
  //   }
  // })

  // console.log(permissions.can_access_employees)

  return (
    <PermissionsContext.Provider value={{ permissions, setPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};
