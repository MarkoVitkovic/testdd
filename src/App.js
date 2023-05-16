import './App.css'
import 'tailwindcss/tailwind.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import Choosesite from './pages/Choosesite'
import Users from './pages/admin/Users'
import Import from './pages/admin/Import'
import Companies from './pages/admin/Companies'
import Sites from './pages/admin/Sites'
import Error from './pages/404'
import RequireAuth from './components/RequireAuth'
import RequireChoosesite from './components/RequireChoosesite'
import Customers from './pages/admin/Customers'
import Vendors from './pages/admin/Vendors'
import Items from './pages/admin/Items'
import GradeCodes from './pages/admin/GradeCodes'
import UnitsOfMeasure from './pages/admin/UnitsOfMeasure'
import SalesOrder from './pages/admin/SalesOrder'
import PurchaseOrder from './pages/admin/PurchaseOrder'
import Shipments from './components/sales_purchase_orders/Shipments'
import Collections from './components/sales_purchase_orders/Collections'
import EditSalesOrder from './components/sales_purchase_orders/EditSalesOrder'
import EditPurchaseOrder from './components/sales_purchase_orders/EditPurchaseOrder'
import UpdateUnitOfMeasure from './pages/UpdatePages/UpdateUnitOfMeasure'
import UpdateGradeCodes from './pages/UpdatePages/UpdateGradeCodes'
import Dispach from './pages/admin/Dispach'
import AvailableLoads from './pages/driver/AvailableLoads'
import ForkliftDashboard from './pages/forklift_driver/ForkliftDashboard'
import ClientDashboard from './pages/client/ClientDashboard'
import Dashboard from './pages/Dashboard'

function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />} >
                        <Route path="/choosesite" element={<Choosesite />} />
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="/" element={<Navigate replace={true} to='sales-order' />} />
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="users" element={<Users />} />
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="import" element={<Import />} />
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="sites" element={<Sites />} />
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="companies" element={<Companies />} />
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="customers" element={<Customers />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="vendors" element={<Vendors />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="items" element={<Items />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="grade-codes" element={<GradeCodes />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="grade-codes/:id" element={<UpdateGradeCodes />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="units-of-measure" element={<UnitsOfMeasure />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="units-of-measure/:id" element={<UpdateUnitOfMeasure />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="sales-order" element={<SalesOrder />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="purchase-order" element={<PurchaseOrder />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="shipments" element={<Shipments />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="sales-order/:id" element={<EditSalesOrder />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="collections" element={<Collections />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="purchase-order/:id" element={<EditPurchaseOrder />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'dispatcher']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="dispatch" element={<Dispach />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'driver']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="driver-portal" element={<Navigate replace={true} to='available-loads' />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'forklift_driver']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="forklifter-portal" element={<ForkliftDashboard />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="client-portal" element={<ClientDashboard />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'office_manager', 'production_supervisor', 'driver', 'forklift_driver', 'dispatcher', 'salesperson', 'client']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="default-portal" element={<Dashboard />}></Route>
                        </Route>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['master_admin', 'driver']} />}>
                        <Route element={<RequireChoosesite />} >
                            <Route path="available-loads" element={<AvailableLoads />}></Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<Error />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
