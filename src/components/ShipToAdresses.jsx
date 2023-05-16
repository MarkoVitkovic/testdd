import React, { useState, useEffect } from 'react'

import axios from '../lib/axios'
import { Box, Modal, Tooltip, TextField } from '@mui/material'
import Swal from 'sweetalert2'
import Pusher from 'pusher-js'

import AddButton from './AddButton'
import TableShared from './TableShared'
import { useTranslation } from "react-i18next"
import { useStateContext } from '../context/ContextProvider'
import style from '../styles/style'



const ShipToAdresses = ({ no, id, setIsLoading }) => {


    const { t } = useTranslation()
    const { config } = useStateContext()

    /* ship to */
    const [shipTo, setShipTo] = useState([])
    const [open, setOpen] = useState(false)
    const [STname_search, setSTname_search] = useState('')
    const [STcode_search, setSTcode_search] = useState('')

    /* fields */
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [address2, setAddress2] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [zip, setZip] = useState('')
    const [contact, setContact] = useState('')
    const [phone, setPhone] = useState('')




    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe('shipaddress-deleted')
        const channelcreate = pusher.subscribe('shipaddress-created')
        const channelupdate = pusher.subscribe('shipaddress-updated')

        channeldelete.bind('shipaddress-deleted-event', data => {
            setShipTo((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })

        channelcreate.bind('shipaddress-created-event', data => {
            getShipToAddresses(id)
        })

        channelupdate.bind('shipaddress-updated-event', data => {
            getShipToAddresses(id)
        })
    }, [])

    useEffect(() => {
        getShipToAddresses(id)
    }, [id])


    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false)
        setCode('')
        setName('')
        setAddress2('')
        setAddress('')
        setZip('')
        setCity('')
        setState('')
        setPhone('')
        setContact('')
    }
    const getShipToAddresses = async (id) => {
        await axios.get(`/api/ship-addresses?customer_id=${id}`, config)
            .then(res => {
                const shipTo = res.data
                setShipTo(shipTo)
            })
    }

    const createShipTo = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const formData = {}

        formData['code'] = code
        formData['name'] = name
        formData['address'] = address
        formData['address2'] = address2
        formData['city'] = city
        formData['state'] = state
        formData['zip'] = zip
        formData['contact'] = contact
        formData['phone'] = phone
        formData['customer_id'] = id


        await axios.post(`/api/ship-addresses`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setCode('')
            setName('')
            setAddress('')
            setAddress2('')
            setZip('')
            setPhone('')
            setCity('')
            setState('')
            setContact('')
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


    const shipToColumns = [
        {
            field: 'code',
            headerName: t('code'),
            flex: 0.5
        },
        {
            field: 'name',
            headerName: t('name'),
            flex: 1
        },
        {
            field: 'address',
            headerName: t('address'),
            flex: 1
        },
        {
            field: 'city',
            headerName: t('city'),
            flex: 1
        },
        {
            field: 'state',
            headerName: t('state'),
            flex: 0.5
        },
        {
            field: 'zip',
            headerName: t('zip'),
            flex: 0.5
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 0.5,
            renderCell: (params) => <ShipToActions params={params} shipTo={shipTo} no={no} id={id} setIsLoading={setIsLoading} getShipToAddresses={getShipToAddresses} config={config} />
        }
    ]

    const items = shipTo.filter(data => {
        if (STname_search === null)
            return data
        if (data.name.toLocaleLowerCase().includes(STname_search.toLocaleLowerCase()))
            return data
    })

    const filtered = items.filter(data => {
        if (STcode_search === null)
            return data
        if (data.code.toLocaleLowerCase().includes(STcode_search.toLocaleLowerCase()))
            return data
    })



    return (
        <>

            <div className='pb-5 shadow-md mb-2 rounded-md'>
                <div className='flex justify-start items-center gap-4 '>
                    <p className='font-bold roboto color-fake ml-5'>{t('ship_to')}</p>
                    <Tooltip title={t('addShipTo')} placement='right'>
                        <div>
                            <AddButton onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                        </div>
                    </Tooltip>
                </div>
                <div className='flex justify-between items-end w-1/2'>
                    <div className='px-5 pt-5 w-full'>
                        <div className='flex justify-between items-center search'>
                            <input type="text" placeholder={t('search_by_STcode')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setSTcode_search(e.target.value)} />
                            <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                        </div>
                    </div>
                    <div className='px-5 pt-5 w-full'>
                        <div className='flex justify-between items-center search'>
                            <input type="text" placeholder={t('search_by_STname')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setSTname_search(e.target.value)} />
                            <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                        </div>
                    </div>

                </div>
            </div>
            <div>
                <TableShared items={filtered} columns={shipToColumns} />
            </div>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('addShipTo')}</p>
                        </div>
                        <button type="button" onClick={createShipTo} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('create')}
                        </button>
                    </div>
                    <div>
                        <div className='p-5'>
                            <form className='flex justify-center flex-col items-start mt-2'>
                                <TextField type="text" variant='standard' label={t('code')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="code" value={code} onChange={(e) => { setCode(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('name')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="name" value={name} onChange={(e) => { setName(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('address')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address" value={address} onChange={(e) => { setAddress(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('address2')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address2" value={address2} onChange={(e) => { setAddress2(e.target.value) }} />

                                <TextField type="text" variant='standard' label={t('city')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="city" value={city} onChange={(e) => { setCity(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('state')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="state" value={state} onChange={(e) => { setState(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('zip')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="zip" value={zip} onChange={(e) => { setZip(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('contact')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="contact" value={contact} onChange={(e) => { setContact(e.target.value) }} />

                                <TextField type="text" variant='standard' label={t('phone')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="phone" value={phone} onChange={(e) => { setPhone(e.target.value) }} />

                            </form>
                        </div>
                    </div>
                </Box>
            </Modal>
        </>
    )
}

export default ShipToAdresses


const ShipToActions = (params) => {

    const { t } = useTranslation();
    const { config } = useStateContext()
    const [open, setOpen] = useState(false)



    /* FORM FIELDS */
    /* general */
    const [code, setCode] = useState(params.params.row.code)
    const [name, setName] = useState(params.params.row.name)
    const [address, setAddress] = useState(params.params.row.address || "")
    const [address2, setAddress2] = useState(params.params.row.address2 || "")
    const [city, setCity] = useState(params.params.row.city || "")
    const [state, setState] = useState(params.params.row.state || "")
    const [zip, setZip] = useState(params.params.row.zip || "")
    const [phone, setPhone] = useState(params.params.row.phone || "")
    const [contact, setContact] = useState(params.params.row.contact || "")

    const handleOpen = () => setOpen(true)
    const handleClose = () => {
        setOpen(false)
        setCode(params.params.row.code)
        setName(params.params.row.name)
        setAddress2(params.params.row.address2 || '')
        setAddress(params.params.row.address || '')
        setZip(params.params.row.zip || '')
        setCity(params.params.row.city || '')
        setState(params.params.row.state || '')
        setPhone(params.params.row.phone || '')
        setContact(params.params.row.contact || '')
    }

    const updateShipTo = async (e) => {
        e.preventDefault();
        params.setIsLoading(true)
        const formData = {}

        formData['code'] = code
        formData['name'] = name
        formData['address2'] = address2
        formData['address'] = address
        formData['phone'] = phone
        formData['city'] = city
        formData['state'] = state
        formData['zip'] = zip
        formData['contact'] = contact
        formData['customer_id'] = params.id

        await axios.put(`/api/ship-addresses/${params.params.row.id}`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            params.setIsLoading(false)
            setOpen(false)
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


    const deleteShipTo = async (id) => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_sa') + params.params.row.code + "?",
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
        await axios.delete(`/api/ship-addresses/${id}`, params.config).then(({ data }) => {
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
                <Tooltip title={t('edit')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={handleOpen}><i className="fa-solid fa-pencil"></i></span>
                    </div>
                </Tooltip>
                <Tooltip title={t('delete')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => deleteShipTo(params.params.row.id)}><i className="fa-solid fa-trash"></i></span>
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
                            <p className='text-xl roboto font-semibold text-white'>{t('update_shipto')} - {params.params.row.code}</p>
                        </div>
                        <button type="button" onClick={updateShipTo} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('edit')}
                        </button>
                    </div>
                    <div>
                        <div className='p-5'>
                            <form className='flex justify-center flex-col items-start mt-2'>
                                <TextField type="text" variant='standard' label={t('code')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="code" value={code} onChange={(e) => { setCode(e.target.value) }} required disabled />

                                <TextField type="text" variant='standard' label={t('name')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="name" value={name} onChange={(e) => { setName(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('address')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address" value={address} onChange={(e) => { setAddress(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('address2')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="address2" value={address2} onChange={(e) => { setAddress2(e.target.value) }} />

                                <TextField type="text" variant='standard' label={t('city')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="city" value={city} onChange={(e) => { setCity(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('state')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="state" value={state} onChange={(e) => { setState(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('zip')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="zip" value={zip} onChange={(e) => { setZip(e.target.value) }} required />

                                <TextField type="text" variant='standard' label={t('contact')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="contact" value={contact} onChange={(e) => { setContact(e.target.value) }} />

                                <TextField type="text" variant='standard' label={t('phone')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="phone" value={phone} onChange={(e) => { setPhone(e.target.value) }} />

                            </form>
                        </div>
                    </div>
                </Box>
            </Modal>
        </>
    )
}
