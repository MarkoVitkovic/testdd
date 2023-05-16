import AppLayout from '../components/Layouts/AppLayout'
import ClientDashboard from './client/ClientDashboard'
import DriverDashboard from './driver/DriverDashboard'
import ForkliftDashboard from './forklift_driver/ForkliftDashboard'
import { useAuth } from '../hooks/auth'

const Dashboard = () => {

    const { user } = useAuth({ middleware: 'guest' })


    if (user?.role === "client") {
        return <ClientDashboard />
    }
    if (user?.role === "driver") {
        return <DriverDashboard />
    }
    if (user?.role === "forklift_driver") {
        return <ForkliftDashboard />
    }
    else {
        return (
            <AppLayout>
                <div>Daily board</div>
            </AppLayout>
        )
    }

}

export default Dashboard
