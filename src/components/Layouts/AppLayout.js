import Navigation from './Navigation'
import { useAuth } from '../../hooks/auth'
import Footer from './Footer'

const AppLayout = ({ header, children }) => {
    const { user } = useAuth({ middleware: 'auth' })

    return (
        <div className="min-h-screen bg-white">
            <Navigation user={user}  />

            {/* Page Content */}
            <main style={{paddingBottom: '60px'}}>{children}</main>

            <Footer />
        </div>
    )
}

export default AppLayout
