import React, { useState, useEffect } from 'react'
import axios from '../lib/axios'
import Swal from 'sweetalert2'
import style from '../styles/style'
import InputError from './InputError'
import { useAuth } from '../hooks/auth'
import { Box, Modal, Tooltip, TextField, InputLabel } from '@mui/material'
import { useTranslation } from "react-i18next"
import { useStateContext } from '../context/ContextProvider'
import { useNavigate } from 'react-router-dom'
import TableShared from './TableShared'
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


const RenderDetailsButton = (params) => {

    const { t } = useTranslation();
    const { roles, companies, sites, getSites, allSites, setChoosesite, setCompany_id } = useStateContext()
    const { user, loginImpersonate } = useAuth({ middleware: 'guest' })
    const navigate = useNavigate()

    /* state */
    const [open, setOpen] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false)
    const [name, setName] = useState(params.params.row.name)
    const [email, setEmail] = useState(params.params.row.email)
    const [company, setCompany] = useState(params.params.row.company_id || ' ')
    const [role, setRole] = useState(params.params.row.role_slug)
    const [site, setSite] = useState(params.params.row.site_id || ' ')
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)

    /* methods */
    const handleOpen = () => {
        setOpen(true)
        getSites(company)
    };
    const handleClose = () => {
        setOpen(false)
        setName(params.params.row.name)
        setSite(params.params.row.site_id || ' ')
        setCompany(params.params.row.company_id || ' ')
        setRole(params.params.row.role_slug || ' ')
    }
    const handleOpenPasswordModal = () => setOpenPasswordModal(true);
    const handleClosePasswordModal = () => {
        setOpenPasswordModal(false)
        setPassword("")
        setPasswordConfirmation("")
    }


    const impersonate = async (id) => {
        loginImpersonate({
          id: id,
          setErrors,
          setStatus,
        })
        .then((data) => {
            Swal.fire({
                icon: "success",
                text: data.success.message,
            });
            localStorage.setItem('impersonate', true);
            localStorage.setItem('impersonatee_id', data.success.data.impersonatee_id);
            localStorage.setItem('impersonator_id', data.success.data.impersonator_id);
            localStorage.setItem("helper_site", localStorage.getItem("site"));
            setChoosesite(localStorage.getItem("site"));
            navigate("/");
        })
        .catch(({ response }) => {
        if (response.status === 422) {
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
    }

    useEffect(() => {
        isOffice()
    }, [user])

    const isOffice = () => {
        if (user?.role === "office_manager") {
            setCompany(user?.company_id)
            getSites(user?.company_id)
        }
    }



    const changePassword = async (e) => {
        e.preventDefault();
        params.setIsLoading(true)
        const formData = {}
        formData['password'] = password
        formData['password_confirmation'] = passwordConfirmation

        await axios.put(`/api/users/${params.params.row.id}/change-password`, formData, params.config).then((data) => {
            Swal.fire({
                icon: "success",
                text: t('changed_password')
            })
            params.setIsLoading(false)
            handleClosePasswordModal()
        }).catch(({ response }) => {
            if (response.status === 422) {
                setErrors(response.data.error)
                Swal.fire({
                    text: response.data.message,
                    icon: "error"
                })
            } else {
                Swal.fire({
                    text: response.data.message,
                    icon: "error"
                })
            }
            params.setIsLoading(false)
        })
    }



    const editUser = async (e) => {
        e.preventDefault();

        params.setIsLoading(true)

        const formData = {}
        formData['name'] = name
        formData['role'] = role
        formData['company_id'] = company
        formData['site_id'] = site

        await axios.put(`/api/users/${params.params.row.id}`, formData, params.config).then((data) => {
            Swal.fire({
                icon: "success",
                text: t('updated_success')
            })
            params.setIsLoading(false)
            handleClose()
        }).catch(({ response }) => {

            if (response.status === 422) {
                setErrors(response.data.errors)
                Swal.fire({
                    text: response.data.message,
                    icon: "error"
                })
            } else {
                Swal.fire({
                    text: response.data.message,
                    icon: "error"
                })
            }
            params.setIsLoading(false)
        })


    }

  /* useEffect(() => {
        getSites(company)
    }, [company, site]) */

    const handleChangeCompany = (event) => {
        setCompany(event.target.value)
        setSite(' ')
        getSites(event.target.value)
    }

    const deleteUser = async (id) => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_user') + params.params.row.name + "?",
            text: t('text_delete'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t('confirmButtonText_delete'),
            cancelButtonText: t('cancel')
        }).then((result) => {
            return result.isConfirmed
        })

        if (!isConfirm) {
            return
        }
        await axios.delete(`/api/users/${id}`, params.config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
        }).catch(({ response: { data } }) => {
            Swal.fire({
                text: data.message,
                icon: "error"
            })
        })
    }

    return (
        <>
            <div className='flex justify-between'>
                {
                    (user?.role === "master_admin" || user?.role === "office_manager") && localStorage.getItem('impersonate') === null ?
                        <Tooltip title={t('impersonate')} placement='top'>
                            <div style={{ color: 'rgba(0,0,0,.54)' }}>
                                <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => impersonate(params.params.row.id)}><i className="fa-solid fa-user"></i></span>
                            </div>
                        </Tooltip> : ''
                }
                <Tooltip title={t('change_password')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={handleOpenPasswordModal}><i className="fa-solid fa-key"></i></span>
                    </div>
                </Tooltip>
                <Tooltip title={t('edit')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={handleOpen}><i className="fa-solid fa-pencil"></i></span>
                    </div>
                </Tooltip>
                <Tooltip title={t('delete')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => deleteUser(params.params.row.id)}><i className="fa-solid fa-trash"></i></span>
                    </div>
                </Tooltip>
            </div>



            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('edit_user')} - {params.params.row.name}</p>
                        </div>
                        <button type="button" onClick={editUser} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('update')}
                        </button>
                    </div>
                    <div>
                        <div className='p-5'>
                            <form method="PUT" className='flex justify-center flex-col items-start mt-2'>

                                <TextField type="text" variant='standard' label={t('name')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address" value={name} onChange={(e) => { setName(e.target.value) }} required />

                                <TextField type="email" variant='standard' label={t('email')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="email" value={email} disabled />

                                <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                    <InputLabel id="demo-simple-select-standard-label">{t('role')}*</InputLabel>
                                    <Select value={role} onChange={e => setRole(e.target.value)}>
                                        {
                                            roles.map((item, index) => <MenuItem key={index} value={item.slug}>{item.name}</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                                {
                                    user?.role !== 'office_manager' ?
                                        (role !== "master_admin") ?
                                            <>
                                                <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                                    <InputLabel id="demo-simple-select-standard-label">{t('company')}*</InputLabel>
                                                    <Select defaultValue=" " value={company} onChange={handleChangeCompany}>
                                                        <MenuItem value=" " className='italic' disabled>{t('select_company')}</MenuItem>
                                                        {
                                                            companies.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)
                                                        }
                                                    </Select>
                                                </FormControl>
                                            </> : ''
                                        : ''
                                }
                                {
                                    company ? (role !== "master_admin" && role !== "office_manager" && role !== "salesperson" && role !== "client") ?
                                    <>
                                        <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                            <InputLabel id="demo-simple-select-standard-label">{t('site')}*</InputLabel>
                                            <Select defaultValue=" " value={site} onChange={e => {setSite(e.target.value)}}>
                                                <MenuItem value=" " disabled className='italic'>{t('select_site')}</MenuItem>
                                                {
                                                    sites?.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)
                                                }
                                            </Select>
                                        </FormControl>
                                    </> : '' : ''
                                }
                            </form>
                        </div>
                    </div>
                </Box>
            </Modal>

            <Modal open={openPasswordModal} onClose={handleClosePasswordModal}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClosePasswordModal}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('change_password')}</p>
                        </div>
                        <button type="button" onClick={changePassword} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('change_password')}
                        </button>
                    </div>
                    <div>
                        <div className='p-5'>
                            <form className='flex justify-center flex-col items-start mt-2'>

                                <TextField type="password" variant='standard' label={t('password')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="password" value={password} onChange={(e) => { setPassword(e.target.value) }} required />

                                <TextField type="password" variant='standard' label={t('confirm_password')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="password_confirmation" value={passwordConfirmation} onChange={(e) => { setPasswordConfirmation(e.target.value) }} required />
                                <InputError messages={errors} className="mt-2" />
                            </form>
                        </div>
                    </div>
                </Box>
            </Modal>
        </>
    )
}


const Table = ({ search, users, getUsers, setIsLoading }) => {

    const { t } = useTranslation();
    const { user } = useAuth({ middleware: 'guest' })
    const config = {
        headers: { Authorization: `Bearer ${user?.plain_text_token}` }
    }

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90
        },
        {
            field: 'name',
            headerName: t('name'),
            flex: 1
        },
        {
            field: 'email',
            headerName: t('email'),
            flex: 1
        },
        {
            field: 'role_name',
            headerName: t('role'),
            flex: 1
        },
        {
            field: 'company_name',
            headerName: t('company'),
            flex: 1
        },
        {
            field: 'site_name',
            headerName: t('site'),
            flex: 1
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 1,
            renderCell: (params) => <RenderDetailsButton params={params} users={users} getUsers={getUsers} setIsLoading={setIsLoading} config={config} />,
        },

    ];



    const items = users.filter(data => {
        if (search === null)
            return data
        if (data.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
            return data
    })

    return (
        <>
            <TableShared items={items} columns={columns} />
        </>
    )
}

export default Table
