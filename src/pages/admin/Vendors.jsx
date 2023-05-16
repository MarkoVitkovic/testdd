import React, { useState, useEffect } from 'react'

import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import ClearIcon from "@mui/icons-material/Clear"
import IconButton from "@mui/material/IconButton"
import InputLabel from '@mui/material/InputLabel'
import { Box, Modal, Tooltip, Switch, Tab, TextField } from '@mui/material'
import { useTranslation } from "react-i18next"
import Swal from 'sweetalert2'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Pusher from 'pusher-js'

import axios from '../../lib/axios'
import AppLayout from '../../components/Layouts/AppLayout'
import AddButton from '../../components/AddButton'
import style from '../../styles/style'
import { useStateContext } from '../../context/ContextProvider'
import TableShared from '../../components/TableShared'
import Loading from '../../components/Loading'
import { useAuth } from '../../hooks/auth'
import PurchaseAddresses from '../../components/PurchaseAddresses'
import PurchaseContracts from '../../components/PurchaseContracts'



const Vendors = () => {
    const { t } = useTranslation()
    const { config, companies, company_id, getCompanies } = useStateContext()
    const { user } = useAuth({ middleware: 'guest' })

    /* state */
    const [open, setOpen] = useState(false)
    const [vendors, setVendors] = useState([])
    const [value, setValue] = useState('1')
    const [isLoading, setIsLoading] = useState(false)
    const [sites, setSites] = useState([])
    const [searchBlocked, setSearchBlocked] = useState('')
    const [customer_name_search, setCustomer_name_search] = useState('')
    const [search, setSearch] = useState('')


    /* FORM FIELDS */
    /* general */
    const [no, setNo] = useState("")
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [address2, setAddress2] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [zip, setZip] = useState("")
    const [company, setCompany] = useState(company_id)
    const [blocked, setBlocked] = useState(false)

    /* communication */
    const [phone, setPhone] = useState("")
    const [fax, setFax] = useState("")
    const [email, setEmail] = useState("")
    const [website, setWebsite] = useState("")

    /* shipping */
    const [site, setSite] = useState("")
    const [code, setCode] = useState("")


    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe('vendor-deleted')
        const channelcreate = pusher.subscribe('vendor-created')
        const channelupdate = pusher.subscribe('vendor-updated')

        channeldelete.bind('vendor-deleted-event', data => {
            setVendors((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })

        channelcreate.bind('vendor-created-event', data => {
            getVendor(data.id, 'created')
        })

        channelupdate.bind('vendor-updated-event', data => {
            getVendor(data.id, 'updated')
        })
    }, [])

    const getVendor = async (id, state) => {

        await axios.get(`/api/vendors/${id}`, config)
            .then(res => {
                const vendor = res.data
                if (state === 'created') setVendors((prev) => [...prev, vendor])

                if (state === 'updated') setVendors((prev) => {
                    const item = prev.find((i) => i.id === id)
                    const exItem = prev.filter((i) => i.id !== item.id)
                    const vab = [...exItem, vendor]
                    return vab
                })
            })

    }



    /* METHODS */
    const handleOpen = () => {
        isOffice()
        getSites(company)
        setOpen(true)
    }
    const handleClose = () =>  {
        setOpen(false)
        setValue('1')
        setNo("")
        setName("")
        setAddress("")
        setAddress2("")
        setCity("")
        setState("")
        setZip("")
        setCompany(1)
        setBlocked(false)

        setPhone("")
        setFax("")
        setEmail("")
        setWebsite("")

        setSite("")
        setCode("")
    }

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    const handleBlocked = (event) => {
        setBlocked(event.target.checked)
    }

    const isOffice = () => {
        if (user?.role === "office_manager") {
            setCompany(user?.company_id)
            getCompanies()
        }
    }


    useEffect(() => {
        getVendors()
    }, [])

    useEffect(() => {
        if (company_id === "") {
            setCompany(localStorage.getItem('company_id'))
        } else {
            setCompany(company_id)
        }
    }, [company_id])

    useEffect(() => {
        getSites(company)
    }, [company])

    useEffect(() => {
        setSite('')
    }, [sites])

    const handleChangeBlocked = (event) => {
        setSearchBlocked(event.target.value)
    }
    const handleClearBlocked = () => {
        setSearchBlocked('')
    }

    useEffect(() => {
        getVendors(searchBlocked)
    }, [searchBlocked])



    const getSites = async (id) => {
        await axios.get(`/api/sites?company_id=${id}`, config)
            .then(res => {
                const sites = res.data
                setSites(sites)
            })
    }

    const getVendors = async (id) => {
        await axios.get(`/api/vendors?blocked=${id}`, config)
            .then(res => {
                const vendors = res.data
                setVendors(vendors)
            })
    }

    const items = vendors?.filter(data => {
        if (search === null)
            return data
        if (data.vendor_no.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
            return data
    })

    const filtered = items?.filter(data => {
        if (customer_name_search === null)
            return data
        if (data.name.toLocaleLowerCase().includes(customer_name_search.toLocaleLowerCase()))
            return data
    })


    const createVendor = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = {}

        formData['vendor_no'] = no
        formData['name'] = name
        formData['address2'] = address2
        formData['address'] = address
        formData['company_id'] = company
        formData['location_id'] = site
        formData['fax'] = fax
        formData['phone'] = phone
        formData['website'] = website
        formData['email'] = email
        formData['blocked'] = blocked
        formData['shipping_code'] = code
        formData['city'] = city
        formData['state'] = state
        formData['zip'] = zip

        await axios.post(`/api/vendors`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setNo('')
            setName('')
            setAddress2('')
            setCompany(localStorage.getItem('company_id'))
            setAddress('')
            setZip('')
            setSite('')
            setFax('')
            setPhone('')
            setWebsite('')
            setEmail('')
            setBlocked(false)
            setCode(' ')
            setCity('')
            setState('')
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

    const columns = [
        {
            field: 'vendor_no',
            headerName: t('no'),
            flex: 0.5
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
            field: 'address',
            headerName: t('address'),
            flex: 1
        },
        {
            field: 'company_name',
            headerName: t('company'),
            flex: 1
        },
        {
            field: 'location_name',
            headerName: t('location'),
            flex: 1
        },
        {
            field: 'blocked_text',
            headerName: t('blocked'),
            flex: 0.5
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 0.5,
            renderCell: (params) => <VendorActions params={params} vendors={vendors} setIsLoading={setIsLoading} companies={companies} getCompanies={getCompanies} config={config} />
        }
    ]

    const handleClearSiteClick = () => {
        setSite('')
    }
    const handleClearCodeClick = () => {
        setCode('')
    }

    return (
        <>
            {isLoading ? <Loading /> : ''}
            <AppLayout>
                <div className='p-5'>
                    <div className='pb-5 shadow-md mb-2 rounded-md'>
                        <div className='flex justify-start items-center gap-4 '>
                            <p className='font-bold roboto pl-5 color-fake'>{t('vendors')}</p>
                            <Tooltip title={t('create_vendor')} placement='right'>
                                <div>
                                    <AddButton onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                                </div>
                            </Tooltip>
                        </div>
                        <div className='flex justify-between items-end w-full'>
                            <div className='px-5 pt-5 w-full'>
                                <div className='flex justify-between items-center search'>
                                    <input type="text" placeholder={t('search_by_vendor_no')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setSearch(e.target.value)} />
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                </div>
                            </div>
                            <div className='px-5 pt-5 w-full'>
                                <div className='flex justify-between items-center search'>
                                    <input type="text" placeholder={t('search_by_name')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setCustomer_name_search(e.target.value)} />
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                </div>
                            </div>
                            <div className='px-5 pt-5 w-full'>
                                <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                    <InputLabel id="demo-simple-select-standard-label">{t('search_by_blocked')}</InputLabel>
                                    <Select
                                        value={searchBlocked}
                                        onChange={handleChangeBlocked}
                                        label="Search role"
                                        sx={{ ".MuiSelect-iconStandard": { display: searchBlocked ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                        endAdornment={searchBlocked ? (<IconButton sx={{ visibility: searchBlocked ? "visible" : "hidden", padding: '0' }} onClick={handleClearBlocked}><ClearIcon /></IconButton>) : false}
                                    >
                                        <MenuItem value="1">{t('yes')}</MenuItem>
                                        <MenuItem value="0">{t('no')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </div>
                    <div>
                        <TableShared items={filtered} columns={columns} />
                    </div>
                </div>
            </AppLayout>


            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('create_vendor')}</p>
                        </div>
                        <button type="button" onClick={createVendor} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('create')}
                        </button>
                    </div>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab sx={{textTransform: 'none'}} value="1" label={t('general')} icon={<i className="fa-solid fa-circle-info"></i>} iconPosition='start' />
                                <Tab sx={{textTransform: 'none'}} value="2" label={t('communication')} icon={<i className="fa-solid fa-phone"></i>} iconPosition='start' />
                                <Tab sx={{textTransform: 'none'}} value="3" label={t('receiving')} icon={<i className="fa-solid fa-truck"></i>} iconPosition='start' />
                                <CloneProps>
                                    {tabProps => (
                                        <Tooltip title={true ? t('define_customer_pa') : ""} arrow>
                                            <div>
                                            <Tab sx={{textTransform: 'none'}} value="4" disabled label={t('purchase_addresses')} icon={<i className="fa-solid fa-address-book"></i>} iconPosition='start' />
                                            </div>
                                        </Tooltip>
                                    )}
                                </CloneProps>
                                <CloneProps>
                                    {tabProps => (
                                        <Tooltip title={true ? t('define_customer_pc') : ""} arrow>
                                            <div>
                                            <Tab sx={{textTransform: 'none'}} value="5" disabled label={t('purchase_contracts')} icon={<i className="fa-solid fa-money-check-dollar"></i>} iconPosition='start' />
                                            </div>
                                        </Tooltip>
                                    )}
                                </CloneProps>
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    <TextField type="text" variant='standard' label={t('no')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="no" value={no} onChange={(e) => { setNo(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('name')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="name" value={name} onChange={(e) => { setName(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('address')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address" value={address} onChange={(e) => { setAddress(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('address2')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address2" value={address2} onChange={(e) => { setAddress2(e.target.value) }} />

                                    <TextField type="text" variant='standard' label={t('city')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="city" value={city} onChange={(e) => { setCity(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('state')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="state" value={state} onChange={(e) => { setState(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('zip')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="zip" value={zip} onChange={(e) => { setZip(e.target.value) }} required />

                                    <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('company')}*</InputLabel>
                                        <Select value={company} onChange={(e) => { setCompany(e.target.value) }}>
                                            {companies.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <label htmlFor="blocked" className='text-sm'>{t('blocked')}</label>
                                    <Switch checked={blocked} onChange={handleBlocked} inputProps={{ 'aria-label': 'controlled' }} />

                                </form>
                            </div>
                        </TabPanel>
                        <TabPanel value="3">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('default_site')}</InputLabel>
                                        <Select defaultValue=" " value={site} onChange={(e) => { setSite(e.target.value) }}
                                        sx={{ ".MuiSelect-iconStandard": { display: site ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                        endAdornment={site ? (<IconButton sx={{ visibility: site ? "visible" : "hidden", padding: '0' }} onClick={handleClearSiteClick}><ClearIcon /></IconButton>) : false}>
                                            {sites?.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('shipping_code')}</InputLabel>
                                        <Select value={code} onChange={(e) => { setCode(e.target.value) }}
                                        sx={{ ".MuiSelect-iconStandard": { display: code ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                        endAdornment={code ? (<IconButton sx={{ visibility: code ? "visible" : "hidden", padding: '0' }} onClick={handleClearCodeClick}><ClearIcon /></IconButton>) : false}>
                                            <MenuItem value="LIVE-LOAD">LIVE LOAD</MenuItem>
                                            <MenuItem value="VPU">VENDOR PICK UP</MenuItem>
                                        </Select>
                                    </FormControl>
                                </form>
                            </div>
                        </TabPanel>
                        <TabPanel value="2">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    <TextField type="text" variant='standard' label={t('phone')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="phone" value={phone} onChange={(e) => { setPhone(e.target.value) }} />

                                    <TextField type="text" variant='standard' label={t('fax')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="fax" value={fax} onChange={(e) => { setFax(e.target.value) }} />

                                    <TextField type="text" variant='standard' label={t('email')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="email" value={email} onChange={(e) => { setEmail(e.target.value) }} />

                                    <TextField type="text" variant='standard' label={t('website')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="website" value={website} onChange={(e) => { setWebsite(e.target.value) }} />
                                </form>
                            </div>
                        </TabPanel>
                        <TabPanel value="4">
                        </TabPanel>
                        <TabPanel value="5">
                        </TabPanel>
                    </TabContext>
                </Box>
            </Modal>
        </>
    )
}

export default Vendors

const VendorActions = (params) => {

    const { t } = useTranslation()
    const { config } = useStateContext()
    const { user } = useAuth({ middleware: 'guest' })
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('1')
    const [sites, setSites] = useState([])



    /* FORM FIELDS */
    /* general */
    const [no, setNo] = useState(params.params.row.vendor_no)
    const [name, setName] = useState(params.params.row.name)
    const [address, setAddress] = useState(params.params.row.address)
    const [address2, setAddress2] = useState(params.params.row.address2 || "")
    const [city, setCity] = useState(params.params.row.city)
    const [state, setState] = useState(params.params.row.state)
    const [zip, setZip] = useState(params.params.row.zip)
    const [company, setCompany] = useState(params.params.row.company_id)
    const [blocked, setBlocked] = useState(params.params.row.blocked ? true : false)

    /* communication */
    const [phone, setPhone] = useState(params.params.row.phone || "")
    const [fax, setFax] = useState(params.params.row.fax || "")
    const [email, setEmail] = useState(params.params.row.email || "")
    const [website, setWebsite] = useState(params.params.row.website || "")

    /* shipping */
    const [site, setSite] = useState(params.params.row.location_id || "")
    const [code, setCode] = useState(params.params.row.shipping_code || "")


    const handleOpen = () => {
        isOffice()
        params.getCompanies()
        getSites(company)
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
        setValue('1')
        setNo(params.params.row.vendor_no)
        setName(params.params.row.name)
        setAddress(params.params.row.address)
        setAddress2(params.params.row.address2 || "")
        setCity(params.params.row.city)
        setState(params.params.row.state)
        setZip(params.params.row.zip)
        setCompany(params.params.row.company_id)
        setBlocked(params.params.row.blocked ? true : false)

        setPhone(params.params.row.phone || "")
        setFax(params.params.row.fax || "")
        setEmail(params.params.row.email || "")
        setWebsite(params.params.row.website || "")

        setSite(params.params.row.location_id || "")
        setCode(params.params.row.shipping_code || "")
    }

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const handleBlocked = (event) => {
        setBlocked(event.target.checked)
    }


    const isOffice = () => {
        if (user?.role === "office_manager") {
            setCompany(user?.company_id)
        }
    }

    const handleChangeCompany = (id) => {
        setCompany(id)
        getSites(id)
        setSite(' ')
    }


    const getSites = (id) => {
        axios.get(`/api/sites?company_id=${id}`, config)
            .then(res => {
                const sites = res.data
                setSites(sites)
            })
    }

    const updateVendor = async (e) => {
        e.preventDefault()
        params.setIsLoading(true)
        const formData = {}

        formData['vendor_no'] = no
        formData['name'] = name
        formData['address2'] = address2
        formData['address'] = address
        formData['company_id'] = company
        formData['location_id'] = site
        formData['fax'] = fax
        formData['phone'] = phone
        formData['website'] = website
        formData['email'] = email
        formData['blocked'] = blocked
        formData['shipping_code'] = code
        formData['city'] = city
        formData['state'] = state
        formData['zip'] = zip

        await axios.put(`/api/vendors/${params.params.row.id}`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            params.setIsLoading(false)
            setOpen(false)
            setValue('1')
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
            params.setIsLoading(false)
        })
    }


    const deleteVendor = async (id) => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_ven') + params.params.row.vendor_no + "?",
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
        await axios.delete(`/api/vendors/${id}`, params.config).then(({ data }) => {
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

    const handleClearSiteClick = () => {
        setSite('')
    }
    const handleClearCodeClick = () => {
        setCode('')
    }


    return (
        <>
            <div className='flex justify-between'>
                <Tooltip title={t('edit')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={handleOpen}><i className="fa-solid fa-pencil"></i></span>
                    </div>
                </Tooltip>
                <Tooltip title={t('delete')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => deleteVendor(params.params.row.id)}><i className="fa-solid fa-trash"></i></span>
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
                            <p className='text-xl roboto font-semibold text-white'>{t('update_vendor')} - {params.params.row.name}</p>
                        </div>
                        <button type="button" onClick={updateVendor} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('edit')}
                        </button>
                    </div>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab sx={{textTransform: 'none'}} value="1" label={t('general')} icon={<i className="fa-solid fa-circle-info"></i>} iconPosition='start' />
                                <Tab sx={{textTransform: 'none'}} value="2" label={t('communication')} icon={<i className="fa-solid fa-phone"></i>} iconPosition='start' />
                                <Tab sx={{textTransform: 'none'}} value="3" label={t('receiving')} icon={<i className="fa-solid fa-truck"></i>} iconPosition='start' />
                                <Tab sx={{textTransform: 'none'}} value="4" label={t('purchase_addresses')} icon={<i className="fa-solid fa-address-book"></i>} iconPosition='start' />
                                <Tab sx={{textTransform: 'none'}} value="5" label={t('purchase_contracts')} icon={<i className="fa-solid fa-money-check-dollar"></i>} iconPosition='start' />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <div>

                                <form className='flex justify-center flex-col items-start mt-2'>
                                    <TextField type="text" variant='standard' label={t('no')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="no" value={no} onChange={(e) => { setNo(e.target.value) }} required disabled/>

                                    <TextField type="text" variant='standard' label={t('name')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="name" value={name} onChange={(e) => { setName(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('address')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address" value={address} onChange={(e) => { setAddress(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('address2')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address2" value={address2} onChange={(e) => { setAddress2(e.target.value) }} />

                                    <TextField type="text" variant='standard' label={t('city')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="city" value={city} onChange={(e) => { setCity(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('state')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="state" value={state} onChange={(e) => { setState(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('zip')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="zip" value={zip} onChange={(e) => { setZip(e.target.value) }} required />

                                    <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('company')}*</InputLabel>
                                        <Select value={company} onChange={(e) => { handleChangeCompany(e.target.value) }}>
                                            {params?.companies.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <label htmlFor="blocked" className='text-sm'>{t('blocked')}</label>
                                    <Switch checked={blocked} onChange={handleBlocked} inputProps={{ 'aria-label': 'controlled' }} />

                                </form>
                            </div>
                        </TabPanel>
                        <TabPanel value="3">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('default_site')}</InputLabel>
                                        <Select value={site} onChange={(e) => { setSite(e.target.value) }}
                                        sx={{ ".MuiSelect-iconStandard": { display: site ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                        endAdornment={site ? (<IconButton sx={{ visibility: site ? "visible" : "hidden", padding: '0' }} onClick={handleClearSiteClick}><ClearIcon /></IconButton>) : false}>
                                            {sites?.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('shipping_code')}</InputLabel>
                                        <Select value={code} onChange={(e) => { setCode(e.target.value) }}
                                        sx={{ ".MuiSelect-iconStandard": { display: code ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                        endAdornment={code ? (<IconButton sx={{ visibility: code ? "visible" : "hidden", padding: '0' }} onClick={handleClearCodeClick}><ClearIcon /></IconButton>) : false}>
                                            <MenuItem value="LIVE-LOAD">LIVE LOAD</MenuItem>
                                            <MenuItem value="VPU">VENDOR PICK UP</MenuItem>
                                        </Select>
                                    </FormControl>
                                </form>
                            </div>
                        </TabPanel>
                        <TabPanel value="2">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    <TextField type="text" variant='standard' label={t('phone')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="phone" value={phone} onChange={(e) => { setPhone(e.target.value) }} />

                                    <TextField type="text" variant='standard' label={t('fax')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="fax" value={fax} onChange={(e) => { setFax(e.target.value) }} />

                                    <TextField type="text" variant='standard' label={t('email')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="email" value={email} onChange={(e) => { setEmail(e.target.value) }} />

                                    <TextField type="text" variant='standard' label={t('website')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="website" value={website} onChange={(e) => { setWebsite(e.target.value) }} />
                                </form>
                            </div>
                        </TabPanel>
                        <TabPanel value="4">
                            <PurchaseAddresses no={no} id={params.params.row.id} setIsLoading={params.setIsLoading}/>
                        </TabPanel>
                        <TabPanel value="5">
                            <PurchaseContracts no={no} id={params.params.row.id} setIsLoading={params.setIsLoading} name={params.params.row.name}/>
                        </TabPanel>
                    </TabContext>
                </Box>
            </Modal>
        </>
    )
}

function CloneProps(props) {
    const { children, ...other } = props
    return children(other)
}
