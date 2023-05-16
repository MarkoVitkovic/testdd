import React, { useState, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { Tooltip, Modal, Box, TextField } from '@mui/material'
import Swal from 'sweetalert2'
import Pusher from 'pusher-js'
import { Link } from 'react-router-dom'

import { useStateContext } from '../../context/ContextProvider'
import axios from '../../lib/axios'
import AppLayout from '../../components/Layouts/AppLayout'
import TableShared from '../../components/TableShared'
import Loading from '../../components/Loading'
import AddButton from '../../components/AddButton'
import style from '../../styles/style'

const UnitsOfMeasure = () => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    const [codes, setCodes] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [searchCode, setSearchCode] = useState('')




    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe('unitofmeasure-deleted')
        const channelcreate = pusher.subscribe('unitofmeasure-created')
        const channelupdate = pusher.subscribe('unitofmeasure-updated')

        channeldelete.bind('unitofmeasure-deleted-event', data => {
            setCodes((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })

        channelcreate.bind('unitofmeasure-created-event', data => {
            getItem(data.id, 'created')
        })

        channelupdate.bind('unitofmeasure-updated-event', data => {
            getItem(data.id, 'updated')
        })
    }, [])

    const getItem = async (id, state) => {

        await axios.get(`/api/units-of-measure/${id}`, config)
            .then(res => {
                const item = res.data
                if (state === 'created') setCodes((prev) => [...prev, item])

                if (state === 'updated') setCodes((prev) => {
                    const item = prev.find((i) => i.id === id)
                    const exItem = prev.filter((i) => i.id !== item.id)
                    const vab = [...exItem, item]
                    return vab
                })
            })

    }

    useEffect(() => {
        getCodes()
    }, [])

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const getCodes = async () => {
        await axios.get(`/api/units-of-measure`, config)
            .then(res => {
                const codes = res.data
                setCodes(codes)
            })
    }

    const createGradeCode = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const formData = {}

        formData['code'] = code
        formData['description'] = description

        await axios.post(`/api/units-of-measure`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setCode('')
            setDescription('')
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
            field: 'code',
            headerName: t('code'),
            flex: 1
        },
        {
            field: 'description',
            headerName: t('description'),
            flex: 1
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 0.5,
            renderCell: (params) => <UnitsOfMeasureActions params={params} config={config} setIsLoading={setIsLoading}/>
        }
    ]

    const filtered = codes.filter(data => {
        if (searchCode === null)
            return data
        if (data.code.toLocaleLowerCase().includes(searchCode.toLocaleLowerCase()))
            return data
    })


    return (
        <>
            {isLoading ? <Loading /> : ''}
            <AppLayout>
                <div className='p-5'>
                    <div className='pb-5 shadow-md mb-2 rounded-md'>
                        <div className='flex justify-start items-center gap-4 '>
                            <p className='font-bold roboto pl-5 color-fake'>{t('units_of_measure')}</p>
                            <Tooltip title={t('create_units_of_measure')} placement='right'>
                                <div>
                                    <AddButton onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                                </div>
                            </Tooltip>
                        </div>
                        <div className='flex justify-between items-end w-1/2'>
                            <div className='px-5 pt-5 w-full'>
                                <div className='flex justify-between items-center search'>
                                    <input type="text" placeholder={t('searchUOM')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setSearchCode(e.target.value)} />
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                </div>
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
                            <p className='text-xl roboto font-semibold text-white'>{t('create_units_of_measure')}</p>
                        </div>
                        <button type="button" onClick={createGradeCode} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('create')}
                        </button>
                    </div>

                    <div className='p-5'>
                        <form className='flex justify-center flex-col items-start mt-2'>
                            <TextField type="text" variant='standard' label={t('code')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="code" value={code} onChange={(e) => { setCode(e.target.value) }} required />

                            <TextField type="text" variant='standard' label={t('description')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="description" value={description} onChange={(e) => { setDescription(e.target.value) }} required />
                        </form>
                    </div>
                </Box>
            </Modal>
        </>
    )
}

export default UnitsOfMeasure

const UnitsOfMeasureActions = (params) => {

    const { t } = useTranslation()

    const deleteItems = async (id) => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_uom') + params.params.row.code + "?",
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
        await axios.delete(`/api/units-of-measure/${id}`, params.config).then(({ data }) => {
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
                        <Link to={`${params.params.row.id}`}><span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200"><i className="fa-solid fa-pencil"></i></span></Link>
                    </div>
                </Tooltip>
                <Tooltip title={t('delete')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => deleteItems(params.params.row.id)}><i className="fa-solid fa-trash"></i></span>
                    </div>
                </Tooltip>
            </div>
        </>
    )
}

