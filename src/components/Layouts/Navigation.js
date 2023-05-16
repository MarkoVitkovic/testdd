import React from 'react'
import Dropdown from '../Dropdown'
import ResponsiveNavLink, {
    ResponsiveNavButton,
} from '../ResponsiveNavLink'
import { DropdownButton } from '../DropdownLink'
import { useAuth } from '../../hooks/auth'
import { useState, useEffect } from 'react'
import i18next, { t } from 'i18next'
import DropdownLink from '../DropdownLink'
import Swal from 'sweetalert2'
import { useStateContext } from '../../context/ContextProvider'
import { useHref, useNavigate } from 'react-router-dom'
import NavLink from '../NavLink'

const Navigation = ({ user }) => {
    const navigate = useNavigate()
    const router = useHref()

    const { logout, logoutImpersonate } = useAuth()
    const { allSites, setChoosesite, company_id, setCompany_id } = useStateContext()

    const [open, setOpen] = useState(false)
    const [flag, setFlag] = useState(i18next.resolvedLanguage)
    const [selectedSite, setSelectedSite] = useState(localStorage.getItem('site'))
    const [show, setShow] = useState(false)

    const [status, setStatus] = useState([])
    const [errors, setErrors] = useState([])

    const deimpersonateUser = async () => {
        logoutImpersonate({
          setErrors,
          setStatus,
        })
        .then((data) => {
            setChoosesite(localStorage.getItem("helper_site"));
            setSelectedSite(localStorage.getItem("helper_site"));
            localStorage.removeItem('impersonate');
            localStorage.removeItem('impersonatee_id');
            localStorage.removeItem('impersonator_id');
            localStorage.setItem("site", localStorage.getItem("helper_site"));
            Swal.fire({
                icon: "success",
                text: data.success.message,
            });
            navigate("/");
        })
        .catch(({ response }) => {
        if (response.data.status === 422) {
            setErrors(response.data.error.message);
            Swal.fire({
            text: response.data.error.message,
            icon: "error",
            });
        } else {
            Swal.fire({
            text: response.data.error.message,
            icon: "error",
            });
        }
        });
    };


    const DropdownLogoutButton = () => {
        if (localStorage.getItem('impersonate') === null) {
            return (
                <DropdownButton onClick={() => logoutUser()}><i className="fa-solid fa-right-from-bracket"></i> {t('logout')}</DropdownButton>
            )
        } else {
            return (
                <DropdownButton onClick={() => deimpersonateUser(user.id)}>
                    {t('leave_impersonation')}
                </DropdownButton>
            )
        }
    }

    const logoutUser = () => {
        logout()
    }

    const setSiteStore = (e) => {
        localStorage.setItem('site', e.target.value)
        localStorage.setItem('company_id', e.target.selectedOptions[0].attributes.company.value)
        setSelectedSite(e.target.value)
        setCompany_id(e.target.selectedOptions[0].attributes.company.value)
        setChoosesite(e.target.value)
    }


    useEffect(() => {
        checkUserSite()
    }, [allSites, company_id])


    const checkUserSite = () => {

        if (localStorage.getItem('impersonate') !== null) {
        /* nastaviti s ovime */

            localStorage.setItem('site', allSites[0]?.id)
            localStorage.setItem('company_id', allSites[0]?.company_id)
            setChoosesite(localStorage.getItem('site'))
            setSelectedSite(localStorage.getItem('site'))
            setCompany_id(localStorage.getItem('company_id'))

        }

    }

    function renderSiteHeaderInfo() {
        const siteId = Number(localStorage.getItem('site'))
        const site = allSites.find((target) => target.id === siteId)

        return (
            <div className='flex flex-col xl:flex-row xl:gap-2 xl:items-center'>
                <span className='font-black roboto text-sky-700 text-2xl line-clamp-1'>{site?.name}</span>
                <div className='text-gray-500 font-light roboto'>
                    <span className='text-xl xl:text-2xl'>{site?.company?.name[0]}</span>
                    <span className='text-xl'>{site?.company?.name.slice(1)}</span>
                </div>
            </div>
        )
    }


    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm">
            {/* Primary Navigation Menu */}
            <div className="mx-auto flex justify-between px-4 sm:px-6 lg:px-8">
                <div className='flex items-center gap-5 sm:gap-10 grow'>
                    <div className='flex items-center gap-2'>
                        <img className='min-w-[66px]' src="../assets/images/logo_small.png" alt="logo" />
                        <div className='hidden sm:flex gap-2'>
                            <span className='font-black roboto text-2xl text-sky-700'>Pallet</span><p className='text-2xl text-gray-500 font-light roboto'>Insights</p>
                        </div>
                    </div>
                    <div className='grow'>
                        {user?.role !== 'master_admin' &&
                            user?.role !== 'office_manager' &&
                            user?.role !== 'salesperson' &&
                            user?.role !== 'client' ? (
                            renderSiteHeaderInfo()
                        ) : (
                            <select className='w-full border-gray-300 border-l-0 border-t-0 border-r-0' name="choosesite" id="choosesite" value={selectedSite} onChange={(e) => setSiteStore(e)}>
                                {allSites.map((item, index) => <option key={index} value={item.id} company={item.company_id}>{/* {item?.company?.name} - */} {item.name}</option>)}
                            </select>
                        )}
                    </div>
                </div>
                <div className="flex justify-end h-16">
                    {/* Navigation Links */}

                    {user?.role !== 'master_admin' &&
                        user?.role !== 'office_manager' &&
                        user?.role !== 'dispatcher' &&
                        user?.role !== 'salesperson' ? (
                        ''
                    ) : (
                        <div className="hidden sm:flex sm:items-center sm:ml-6 gap-8" style={{ background: "#f5f5f5" }}>
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="roboto flex items-center font-medium text-sm text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out px-4" style={{ height: '64px', textTransform: 'uppercase' }}>
                                        {t('daily_board')}
                                    </button>
                                }>
                                    <DropdownLink to="/sales-order">
                                        <div className="flex items-center justify-start gap-3">
                                            <span style={{ width: '20px', transform: 'rotate(45deg)', color: '#336195' }} className="flex items-center justify-center">
                                                <i className="fa-solid fa-arrow-up-long"></i>
                                            </span>
                                            {t('sales_order')}
                                        </div>
                                    </DropdownLink>

                                    <DropdownLink to="/purchase-order">
                                        <div className="flex items-center justify-start gap-3">
                                            <span style={{ width: '20px', transform: 'rotate(225deg)', color: '#B7472A' }} className="flex items-center justify-center">
                                                <i className="fa-solid fa-arrow-up-long"></i>
                                            </span>
                                            {t('purchase_orders')}
                                        </div>
                                    </DropdownLink>
                            </Dropdown>
                        </div>
                    )}

                    {user?.role !== 'master_admin' &&
                        user?.role !== 'office_manager' &&
                        user?.role !== 'dispatcher' ? (
                        ''
                    ) : (
                        <div className="hidden sm:flex sm:items-center gap-8 px-4">
                            <NavLink
                                    to="/dispatch"
                                    active={router.pathname === '/dispatch'}>
                                    {t('dispatch')}
                            </NavLink>
                        </div>
                    )}

                    {user?.role !== 'driver' ? (
                        ''
                    ) : (
                        <div className="hidden sm:flex sm:items-center gap-8 px-4">
                            <NavLink
                                to="/available-loads"
                                active={router.pathname === '/available-loads'}>
                                {t('available_loads')}
                            </NavLink>
                        </div>
                    )}

                    {/* Settings Dropdown */}
                    <div className="hidden sm:flex sm:items-center sm:ml-6 gap-8">

                        {user?.role !== 'master_admin' &&
                            user?.role !== 'office_manager' ? (
                            ''
                        ) : (
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                        <div className="ml-1 text-lg">
                                            <i className="fa-solid fa-ellipsis-vertical"></i>
                                        </div>
                                    </button>
                                }>

                                {/* SHIPMENTS */}
                                {user?.role !== 'master_admin' ? (
                                    ''
                                ) : (
                                    <DropdownLink to="/shipments">
                                        <div className="flex items-center justify-start gap-3">
                                            <span style={{ width: '20px', transform: 'rotate(45deg)' }} className="flex items-center justify-center">
                                                <i className="fa-solid fa-arrow-up-long"></i>
                                            </span>
                                            {t('shipments')}
                                        </div>
                                    </DropdownLink>
                                )}

                                {/* COLLECTIONS */}
                                {user?.role !== 'master_admin' ? (
                                    ''
                                ) : (
                                    <DropdownLink to="/collections">
                                        <div className="flex items-center justify-start gap-3">
                                            <span style={{ width: '20px', transform: 'rotate(225deg)' }} className="flex items-center justify-center">
                                                <i className="fa-solid fa-arrow-up-long"></i>
                                            </span>
                                            {t('collections')}
                                        </div>
                                    </DropdownLink>
                                )}

                                {/* COMPANIES */}
                                {user?.role !== 'master_admin' ? (
                                    ''
                                ) : (
                                    <DropdownLink to="/companies">
                                        <div className="flex items-center justify-start gap-3">
                                            <span
                                                style={{ width: '20px' }}
                                                className="flex items-center justify-center">
                                                <i className="fa-solid fa-grip-vertical"></i>
                                            </span>
                                            {t('companies')}
                                        </div>
                                    </DropdownLink>
                                )}

                                {/* SITES */}
                                {user?.role !== 'master_admin' &&
                                    user?.role !== 'office_manager' ? (
                                    ''
                                ) : (
                                    <DropdownLink to="/sites">
                                        <div className="flex items-center justify-start gap-3">
                                            <span
                                                style={{ width: '20px' }}
                                                className="flex items-center justify-center">
                                                <i className="fa-solid fa-grip-vertical"></i>
                                            </span>
                                            {t('sites')}
                                        </div>
                                    </DropdownLink>
                                )}



                                {/* ITEMS */}
                                <DropdownButton onClick={e => {e.preventDefault(); setShow(!show)}}>
                                    <div className="flex items-center justify-between">
                                        <div className='flex items-center justify-start gap-3'>
                                        <span
                                            style={{ width: '20px' }}
                                            className="flex items-center justify-center">
                                            <i className="fa-solid fa-list"></i>
                                        </span>
                                        {t('items')}
                                        </div>
                                        <div>{show ? <i className="fa-solid fa-angle-down"></i> : <i className="fa-solid fa-angle-right"></i>}</div>
                                    </div>
                                </DropdownButton>
                                {
                                    show ?
                                    <>
                                        <DropdownLink to="/items">
                                            <div className="flex items-center justify-start gap-3 pl-3">
                                                <span
                                                    style={{ width: '20px' }}
                                                    className="flex items-center justify-center">
                                                    <i className="fa-solid fa-list"></i>
                                                </span>
                                                {t('list')}
                                            </div>
                                        </DropdownLink>
                                        <DropdownLink to="/grade-codes">
                                            <div className="flex items-center justify-start gap-3 pl-3" >
                                                <span
                                                    style={{ width: '20px' }}
                                                    className="flex items-center justify-center">
                                                    <i className="fa-solid fa-graduation-cap"></i>
                                                </span>
                                                {t('grade_codes')}
                                            </div>
                                        </DropdownLink>
                                        <DropdownLink to="/units-of-measure">
                                            <div className="flex items-center justify-start gap-3 pl-3">
                                                <span
                                                    style={{ width: '20px' }}
                                                    className="flex items-center justify-center">
                                                    <i className="fa-solid fa-ruler"></i>
                                                </span>
                                                {t('units_of_measure')}
                                            </div>
                                        </DropdownLink>
                                    </>
                                    : ''
                                }

                                {/* IMPORT */}
                                {user?.role !== 'master_admin' ? ('') : (
                                    <DropdownLink to="/import">
                                        <div className="flex items-center justify-start gap-3">
                                            <span
                                                style={{ width: '20px' }}
                                                className="flex items-center justify-center">
                                                <i className="fa-solid fa-wrench"></i>
                                            </span>
                                            {t('import')}
                                        </div>
                                    </DropdownLink>
                                )}

                            </Dropdown>
                        )}


                        {user?.role !== 'master_admin' &&
                            user?.role !== 'office_manager' ? (
                            ''
                        ) : (
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                        <div className="ml-1 text-lg">
                                            <i className="fa-solid fa-users-gear"></i>
                                        </div>
                                    </button>
                                }>

                                {/* USERS */}
                                <DropdownLink to="/users">
                                    <div className="flex items-center justify-start gap-3">
                                        <span
                                            style={{ width: '20px' }}
                                            className="flex items-center justify-center">
                                            <i className="fa-solid fa-users"></i>
                                        </span>
                                        {t('users')}
                                    </div>
                                </DropdownLink>

                                {/* CUSTOMERS */}
                                <DropdownLink to="/customers">
                                    <div className="flex items-center justify-start gap-3">
                                        <span
                                            style={{ width: '20px' }}
                                            className="flex items-center justify-center">
                                            <i className="fa-solid fa-users"></i>
                                        </span>
                                        {t('customers')}
                                    </div>
                                </DropdownLink>

                                {/* VENDORS */}
                                <DropdownLink to="/vendors">
                                    <div className="flex items-center justify-start gap-3">
                                        <span
                                            style={{ width: '20px' }}
                                            className="flex items-center justify-center">
                                            <i className="fa-solid fa-users"></i>
                                        </span>
                                        {t('vendors')}
                                    </div>
                                </DropdownLink>



                            </Dropdown>
                        )}


                        <Dropdown
                            align="right"
                            width="48"
                            trigger={
                                <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                    <div className='flex gap-2 items-center'>
                                        <div className='text-white bg-gray-500 rounded-full' style={{ fontSize: '10px', padding: '1px 8px'}}>
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                        {user?.name}
                                    </div>
                                    <div className="ml-1">
                                        <i className="fa-solid fa-chevron-down"></i>
                                    </div>
                                </button>
                            }>
                            {/* Authentication */}
                            {DropdownLogoutButton}
                        </Dropdown>

                        <Dropdown
                            align="right"
                            width="48"
                            trigger={
                                <div>
                                    <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                        {flag === 'en' ? (
                                            <img src="../assets/images/flags/us.png" alt="us" />
                                        ) : (
                                            <img src="../assets/images/flags/de.png" alt="de" />
                                        )}
                                        <div className="ml-3">
                                            <i className="fa-solid fa-chevron-down"></i>
                                        </div>
                                    </button>
                                </div>
                            }>
                            {/* Authentication */}
                            <DropdownButton
                                onClick={() => {
                                    i18next.changeLanguage('en')
                                    setFlag('en')
                                }}>
                                <div className="flex gap-2 justify-start items-center">
                                    <img src="../assets/images/flags/us.png" alt='us' />
                                    {t('english')}
                                </div>
                            </DropdownButton>
                            <DropdownButton
                                onClick={() => {
                                    i18next.changeLanguage('de')
                                    setFlag('de')
                                }}>
                                <div className="flex gap-2 justify-start items-center">
                                    <img src="../assets/images/flags/de.png" alt='de' />
                                    {t('germany')}
                                </div>
                            </DropdownButton>
                        </Dropdown>
                    </div>



                    {/* Hamburger */}
                    <div className="-mr-2 ml-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setOpen(open => !open)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24">
                                {open ? (
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive Navigation Menu */}
            {open && (
                <div className="block sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink
                            to="/"
                            active={router.pathname === '/'}>
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    {/* Responsive Settings Options */}
                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-10 w-10 fill-current text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>

                            <div className="ml-3">
                                <div className="font-medium text-base text-gray-800">
                                    {user?.name}
                                </div>
                                <div className="font-medium text-sm text-gray-500">
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            {/* Authentication */}
                            <ResponsiveNavButton onClick={logout}>
                                Logout
                            </ResponsiveNavButton>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navigation
