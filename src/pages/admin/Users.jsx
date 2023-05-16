import React, { useState, useEffect } from 'react'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import Swal from 'sweetalert2';
import { Box, Modal, Tooltip, TextField } from '@mui/material'
import { useTranslation } from "react-i18next";
import Pusher from 'pusher-js'

import AppLayout from '../../components/Layouts/AppLayout'
import AddButton from '../../components/AddButton'
import Table from '../../components/Table'
import axios from '../../lib/axios'
import style from '../../styles/style'
import { useStateContext } from '../../context/ContextProvider'
import { useAuth } from '../../hooks/auth';
import Loading from '../../components/Loading';



const Users = () => {
    const { t } = useTranslation();
    const { companies, users, setUsers, getUsers, config, sites, getSites, roles } = useStateContext()
    const { user } = useAuth({ middleware: 'guest' })

    /* state */
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('')
    const [name, setName] = useState("")
    const [company, setCompany] = useState("")
    const [role, setRole] = useState("")
    const [email, setEmail] = useState("")
    const [site, setSite] = useState("")
    const [isLoading, setIsLoading] = useState(false)


    const [searchCompany, setSearchCompany] = useState("")
    const [searchRole, setSearchRole] = useState("")
    const [searchSite, setSearchSite] = useState("")



    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe('user-deleted')
        const channelcreate = pusher.subscribe('user-created')
        const channelupdate = pusher.subscribe('user-updated')


        channeldelete.bind('user-deleted-event', data => {
            getUsers()
        })

        channelcreate.bind('user-created-event', data => {
            getUser(data.id, "created")
        })

        channelupdate.bind('user-updated-event', data => {
            getUser(data.id, "updated")
        })
    }, [])

    const getUser = async (id, state) => {

        await axios.get(`/api/users/${id}`, config)
            .then(res => {
                const user = res.data
                if (state === 'created') setUsers((prev) => [...prev, user])

                if (state === 'updated') setUsers((prev) => {
                    const item = prev.find((i) => i.id === id)
                    const exItem = prev.filter((i) => i.id !== item.id)
                    const vab = [...exItem, user]
                    return vab
                })
            })

    }


    const handleChangeRole = (event) => {
        setSearchRole(event.target.value)
    }
    const handleClearRoleClick = () => {
        setSearchRole('')
    }
    const handleChangeCompany = (event) => {
        setSearchCompany(event.target.value);
        getSites(event.target.value)
    }
    const handleClearCompanyClick = () => {
        setSearchCompany('')
        getSites('')
    }
    const handleChangeSite = (event) => {
        setSearchSite(event.target.value)
    }
    const handleClearSiteClick = () => {
        setSearchSite('')
    }

    useEffect(() => {
        getUsers(searchRole, searchCompany, searchSite)
    }, [searchCompany, searchRole, searchSite])


    /* methods */
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false)
        setCompany("")
        setEmail("")
        setName("")
        setSite("")
        setRole("")
    }

    const searchFunction = (event) => {
        let word = event.target.value;
        setSearch(word)
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

    const createUser = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const formData = new FormData()

        formData.append('name', name)
        formData.append('email', email)
        formData.append('role', role)
        formData.append('company_id', company)
        formData.append('site_id', site)

        await axios.post(`/api/users`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setName('')
            setEmail('')
            setCompany('')
            setRole('')
            setSite('')
            setIsLoading(false)
            handleClose()
        }).catch(({ response }) => {
            if (response.status === 422) {
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
            setIsLoading(false)
        })
    }

    const handleChangeCompanys = (event) => {
        setCompany(event.target.value)
        setSite('')
        getSites(event.target.value)
    }



    const handleClearRoles = () => {
        setRole('')
    }

    const handleClearCompanies = () => {
        setSite('')
        setCompany('')
    }

    const handleClearSites = () => {
        setSite('')
    }


    return (
        <>
            {isLoading ? <Loading /> : ''}
            <AppLayout>

                <div className='p-5'>
                    <div className='pb-5 shadow-md mb-2 rounded-md flex items-start flex-col'>
                        <div className='flex justify-start items-center gap-4 '>
                            <p className='font-bold roboto pl-5 color-fake'>{t('users')}</p>
                            <Tooltip title={t('create_user')} placement='right'>
                                <div>
                                    <AddButton onClick={handleOpen}><span style={{ paddingLeft: '2px' }}><i className="fa-solid fa-plus flex justify-center"></i></span></AddButton>

                                </div>
                            </Tooltip>
                            <Modal open={open} onClose={handleClose}>
                                <Box sx={style}>
                                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                                        <div className='flex gap-4 items-baseline'>
                                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                                            </div>
                                            <p className='text-xl roboto font-semibold text-white'>{t('create_user')}</p>
                                        </div>
                                        <button type="button" onClick={createUser} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                                            {t('create')}
                                        </button>
                                    </div>
                                    <div className='p-5'>
                                        <form onSubmit={createUser} className='flex justify-center flex-col items-start mt-2'>
                                            <TextField type="text" variant='standard' label={t('name')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="name" value={name} onChange={(e) => { setName(e.target.value) }} required />

                                            <TextField type="text" variant='standard' label={t('email')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="email" value={email} onChange={(e) => { setEmail(e.target.value) }} required />

                                            <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                                <InputLabel id="demo-simple-select-standard-label">{t('role')}*</InputLabel>
                                                <Select value={role} onChange={e => { setRole(e.target.value) }}
                                                    sx={{ ".MuiSelect-iconStandard": { display: role ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                                    endAdornment={role ? (<IconButton sx={{ visibility: role ? "visible" : "hidden", padding: '0' }} onClick={handleClearRoles}><ClearIcon /></IconButton>) : false}
                                                >

                                                    {
                                                        roles.map((item, index) => <MenuItem key={index} value={item.slug}>{item.name}</MenuItem>)
                                                    }
                                                </Select>
                                            </FormControl>
                                            {
                                                (user?.role !== "office_manager") ?
                                                    (role !== "master_admin") ?
                                                        <>
                                                            <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                                                <InputLabel id="demo-simple-select-standard-label">{t('company')}*</InputLabel>
                                                                <Select value={company} onChange={handleChangeCompanys}
                                                                    sx={{ ".MuiSelect-iconStandard": { display: company ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                                                    endAdornment={company ? (<IconButton sx={{ visibility: company ? "visible" : "hidden", padding: '0' }} onClick={handleClearCompanies}><ClearIcon /></IconButton>) : false}
                                                                >
                                                                    {
                                                                        companies.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)
                                                                    }
                                                                </Select>
                                                            </FormControl>
                                                        </> : ''
                                                    : ''
                                            }
                                            {
                                                (role !== "master_admin" && role !== "office_manager" && role !== "salesperson" && role !== "client") ?
                                                    <>
                                                        <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                                            <InputLabel id="demo-simple-select-standard-label">{t('site')}*</InputLabel>
                                                            <Select value={site} onChange={e => { setSite(e.target.value) }} sx={{ ".MuiSelect-iconStandard": { display: site ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                                                endAdornment={site ? (<IconButton sx={{ visibility: site ? "visible" : "hidden", padding: '0' }} onClick={handleClearSites}><ClearIcon /></IconButton>) : false}
                                                            >
                                                                {(company !== "" && company) ?
                                                                    sites.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)
                                                                    : ''}
                                                            </Select>
                                                        </FormControl>
                                                    </> : ''
                                            }
                                        </form>
                                    </div>
                                </Box>
                            </Modal>
                        </div>
                        <div className='flex justify-between items-end w-full'>
                            <div className='px-5 pt-5 w-full'>
                                <div className='flex justify-between items-center search'>
                                    <input type="text" placeholder={t('search_by_name')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => searchFunction(e)} />
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                </div>
                            </div>
                            <div className='px-5 pt-5 w-full'>
                                <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                    <InputLabel id="demo-simple-select-standard-label">{t('search_by_role')}</InputLabel>
                                    <Select
                                        value={searchRole}
                                        onChange={handleChangeRole}
                                        label="Search role"
                                        sx={{ ".MuiSelect-iconStandard": { display: searchRole ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                        endAdornment={searchRole ? (<IconButton sx={{ visibility: searchRole ? "visible" : "hidden", padding: '0' }} onClick={handleClearRoleClick}><ClearIcon /></IconButton>) : false}
                                    >
                                        {
                                            roles.map((item, index) => <MenuItem key={index} value={item.slug}>{item.name}</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='px-5 pt-5 w-full'>
                                <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                    <InputLabel id="demo-simple-select-standard-label">{t('search_by_company')}</InputLabel>
                                    <Select
                                        value={searchCompany}
                                        onChange={handleChangeCompany}
                                        label="Search company"
                                        sx={{ ".MuiSelect-iconStandard": { display: searchCompany ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                        endAdornment={searchCompany ? (<IconButton sx={{ visibility: searchCompany ? "visible" : "hidden", padding: '0' }} onClick={handleClearCompanyClick}><ClearIcon /></IconButton>) : false}
                                    >
                                        {
                                            companies.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='px-5 pt-5 w-full'>
                                <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                    <InputLabel id="demo-simple-select-standard-label">{t('search_by_site')}</InputLabel>
                                    <Select
                                        value={searchSite}
                                        onChange={handleChangeSite}
                                        label="Search site"
                                        sx={{ ".MuiSelect-iconStandard": { display: searchSite ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                        endAdornment={searchSite ? (<IconButton sx={{ visibility: searchSite ? "visible" : "hidden", padding: '0' }} onClick={handleClearSiteClick}><ClearIcon /></IconButton>) : false}
                                    >
                                        {
                                            sites.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Table search={search} users={users} getUsers={getUsers} isLoading={isLoading} setIsLoading={setIsLoading} />
                    </div>
                </div>

            </AppLayout>
        </>
    )

}

export default Users
