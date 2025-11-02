import React from "react";
import { Outlet } from "react-router-dom";
import { UserSideNav } from "../components/userComponents/UserSideNav";

export const ClientLayout = () => {
  return (
    <>
      <div className="flex min-h-screen">
        <UserSideNav />
        <div className="flex-1 bg-gray-100 overflow-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};
