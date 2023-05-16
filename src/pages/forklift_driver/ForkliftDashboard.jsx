import React from 'react'
import AppLayout from '../../components/Layouts/AppLayout'
import { useAuth } from '../../hooks/auth'
import { useNavigate } from 'react-router-dom'

const ForkliftDashboard = () => {

    const navigate = useNavigate()
    const { user } = useAuth({ middleware: 'guest' })
    const choosesite = localStorage.getItem('site')

    if (choosesite) {
        if (user?.role == "forklift_driver") {
            return (
                <AppLayout>
                    <div>Daily board - forklift</div>
                </AppLayout>
            )
        } else {
            navigate('/')
        }
    }
    else {
        navigate('/choosesite')
    }
}

export default ForkliftDashboard
