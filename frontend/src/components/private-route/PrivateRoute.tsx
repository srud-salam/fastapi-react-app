import React from "react";
import useAuth from "../../hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const PrivateRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth && auth.access_token && auth.username) {
    return <Outlet />;
  }

  return <Navigate to="/" state={{ from: location }} />;
};
