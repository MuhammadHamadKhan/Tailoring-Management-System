import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authStore from "../store/store";

const Protectedroute = ({ children }) => {
  const { isLogin, isChecking } = authStore();

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F3EC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C89550] border-t-transparent" />
          <p className="text-sm font-medium text-[#221F1A]/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default Protectedroute;
