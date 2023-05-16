import React, { useState, useEffect } from 'react'

import axios from '../lib/axios'
import { Box, Modal, Tooltip } from '@mui/material'
import Swal from 'sweetalert2'
import Pusher from 'pusher-js'

import AddButton from './AddButton'
import TableShared from './TableShared'
import { useTranslation } from "react-i18next"
import { useStateContext } from '../context/ContextProvider'
import style from '../styles/style'
import CustomerInfo from './CustomerInfo'
import CustomerInfoUpdate from './CustomerInfoUpdate'
import SalesContractItems from './SalesContractItems'
import SalesContractItemsUpdate from './SalesContractItemsUpdate'

const SalesContracts = ({ no, id, setIsLoading, name }) => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    const [salesContract, setSalesContract] = useState([])
    const [shipToAddresses, setShipToAddresses] = useState([])
    const [open, setOpen] = useState(false)

    const [ship_to_address_id, setShip_to_address_id] = useState('')
    const [itemsSend, setItemsSend] = useState([])




    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe('salescontract-deleted')
        const channelcreate = pusher.subscribe('salescontract-created')
        const channelupdate = pusher.subscribe('salescontract-updated')

        channeldelete.bind('salescontract-deleted-event', data => {
            setSalesContract((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })

        channelcreate.bind('salescontract-created-event', data => {
            getSalesContract(id)
        })

        channelupdate.bind('salescontract-updated-event', data => {
            getSalesContract(id)
        })
    }, [])

    useEffect(() => {
        getSalesContract(id)
        getShipToAddresses(id)
    }, [id])

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false)
        setItemsSend([])
    };
    const getSalesContract = async (id) => {
        await axios.get(`/api/sales-contracts?customer_id=${id}`, config)
            .then(res => {
                const salesContract = res.data
                setSalesContract(salesContract)
            })
    }

    const getShipToAddresses = async (id) => {
        await axios.get(`/api/ship-addresses?customer_id=${id}`, config)
            .then(res => {
                const shipTo = res.data
                setShipToAddresses(shipTo)
            })
    }



    const createSalesContract = async (e) => {
        e.preventDefault();

        setIsLoading(true)
        const formData = {}

        formData['customer_id'] = id
        formData['ship_address_id'] = ship_to_address_id
        formData['sales_contract_items'] = itemsSend


        await axios.post(`/api/sales-contracts`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })

            setIsLoading(false)

            setItemsSend([])

            handleClose()
        }).catch(({ response }) => {
            if (response.status === 422) {
                Swal.fire({
                    text: response.data.error.description,
                    icon: "error"
                })
            } else {
                Swal.fire({
                    text: response.data.error.description,
                    icon: "error"
                })
            }
            setIsLoading(false)
        })
    }



    const salesColumns = [
        {
            field: 'id',
            headerName: t('no'),
            flex: 0.5
        },
        {
            field: 'ship_to_code',
            headerName: t('shipToCode'),
            flex: 0.5
        },
        {
            field: 'ship_to_name',
            headerName: t('ship_to_name'),
            flex: 0.5
        },
        {
            field: 'ship_address',
            headerName: t('shipToAdd'),
            flex: 1
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 0.5,
            renderCell: (params) => <CustomerActions params={params} setIsLoading={setIsLoading} name={name} id={id} shipToAddresses={shipToAddresses} config={config} getSalesContract={getSalesContract}/>
        }
    ]


    return (
        <>
            <div className='pb-5 shadow-md mb-2 rounded-md'>
                <div className='flex justify-start items-center gap-4 '>
                    <p className='font-bold roboto color-fake ml-5'>{t('sales_contracts')}</p>
                    <Tooltip title={t('addSalesContract')} placement='right'>
                        <div>
                            <AddButton onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                        </div>
                    </Tooltip>
                </div>
            </div>
            <div>
                <TableShared items={salesContract} columns={salesColumns} />
            </div>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('addSalesContract')}</p>
                        </div>
                        <button type="button" onClick={createSalesContract} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('create')}
                        </button>
                    </div>
                    <div className='flex gap-1'>
                        <CustomerInfo name={name} id={id} setIsLoading={setIsLoading} shipToAddresses={shipToAddresses} setShip_to_address_id={setShip_to_address_id} ship_to_address_id={ship_to_address_id} handleClose={handleClose} />
                        <SalesContractItems setIsLoading={setIsLoading} setItemsSend={setItemsSend} itemsSend={itemsSend} />
                    </div>

                </Box>
            </Modal>
        </>
    )
}

export default SalesContracts

const CustomerActions = (params) => {

    const { t } = useTranslation()

    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const [ship_to_address_id, setShip_to_address_id] = useState(params.params.row.ship_address_id)
    const [itemsSend, setItemsSend] = useState(params.params.row.sales_contract_items)

    const updateSalesContract = async (e) => {
        e.preventDefault();
        params.setIsLoading(true)
        const formData = {}

        formData['customer_id'] = params.params.row.customer_id
        formData['ship_address_id'] = ship_to_address_id
        formData['sales_contract_items'] = itemsSend

        await axios.put(`/api/sales-contracts/${params.params.row.id}`, formData, params.config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            params.setIsLoading(false)
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
            params.setIsLoading(false)
        })
    }


    const deleteSalesContract = async (id) => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_so') + id + "?",
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
        await axios.delete(`/api/sales-contracts/${id}`, params.config).then(({ data }) => {
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
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => deleteSalesContract(params.params.row.id)}><i className="fa-solid fa-trash"></i></span>
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
                            <p className='text-xl roboto font-semibold text-white'>{t('editSalesContract')} - {params.params.row.id}</p>
                        </div>
                        <button type="button" onClick={updateSalesContract} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('edit')}
                        </button>
                    </div>
                    <div className='flex gap-1'>
                        <CustomerInfoUpdate name={params.name} id={params.id} shipToAddresses={params.shipToAddresses} setShip_to_address_id={setShip_to_address_id} ship_to_address_id={ship_to_address_id}/>
                        <SalesContractItemsUpdate setIsLoading={params.setIsLoading} id={params.params.row.id} itemsSend={itemsSend} setItemsSend={setItemsSend} />
                    </div>

                </Box>
            </Modal>
        </>
    )
}
