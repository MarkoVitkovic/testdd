import React from 'react'
import { useLocation, Navigate, Outlet } from "react-router-dom";

const RequireChoosesite = () => {

    const choosesite = localStorage.getItem('site')
    const location = useLocation()

    return (
        choosesite ? <Outlet /> : <Navigate to="/choosesite" state={{ from: location }} replace />
    );
}

export default RequireChoosesite
