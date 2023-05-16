import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import React from 'react'
import Loading from "./Loading";

const RequireAuth = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth({ middleware: 'guest' });
    const location = useLocation()

    if (isLoading) return <Loading />
    const roles = [user?.role]

    return (
       roles?.find(role => allowedRoles?.includes(role)) ? <Outlet /> :
        user ? <Navigate to="/unauthorized" state={{ from: location }} replace />
            : <Navigate to="/login" state={{ from: location }} replace />
    )
}

export default RequireAuth;
