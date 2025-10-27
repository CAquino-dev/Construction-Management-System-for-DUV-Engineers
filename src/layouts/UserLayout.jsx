import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import UserNavbar from "../components/userComponents/UserNavbar";

const UserLayout = () => {
  const location = useLocation();

  // Check if current page is login
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {/* Show Navbar only if NOT login — OR if login but screen is desktop */}
      <div className={`${isLoginPage ? "hidden md:block" : ""}`}>
        <UserNavbar />
      </div>

      <Outlet />
    </>
  );
};

export default UserLayout;
