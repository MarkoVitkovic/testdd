import { Link } from "react-router-dom"

const AuthCard = ({ children }) => (
    <div className="min-h-screen flex flex-col items-center pt-6 sm:pt-0 bg-hero-pattern">
        <div className="flex flex-col justify-center items-center mt-12">
            <img src='assets/images/logo.png' className="w-2/5"/>
        </div>


        <div className="w-2/5 sm:max-w-2/5 mt-6 px-6 py-4 bg-transparent overflow-hidden sm:rounded-lg">
            {children}
        </div>

        <div className="fixed bottom-0 left-0 text-center flex w-full justify-center py-5 footer-bg">
            <div>
                <Link to="/" className="text-white">Pallet Insights</Link>
            </div>
        </div>
    </div>
)

export default AuthCard
