import React from 'react'
import AppLayout from '../../components/Layouts/AppLayout'
import { useAuth } from '../../hooks/auth'
import { useNavigate } from 'react-router-dom'

const ClientDashboard = () => {

    const navigate = useNavigate()
    const { user } = useAuth({ middleware: 'guest' })
    const choosesite = localStorage.getItem('site')

    if (choosesite) {
        if (user?.role == "client") {
            return (
                <AppLayout>
                    <div>Daily board - client</div>
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

export default ClientDashboard
