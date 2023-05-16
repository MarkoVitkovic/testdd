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
import VendorInfoUpdate from './VendorInfoUpdate'
import PurchaseContractsItems from './PurchaseContractsItems'
import VendorInfo from './VendorInfo'
import PurchaseContractsItemsUpdate from './PurchaseContractsItemsUpdate'

const PurchaseContracts = ({ no, id, setIsLoading, name }) => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    const [purchaseContract, setPurchaseContract] = useState([])
    const [purchaseAddresses, setPurchaseAddresses] = useState([])
    const [open, setOpen] = useState(false)

    const [purchase_address_id, setPurchase_address_id] = useState('')
    const [itemsSend, setItemsSend] = useState([])




    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe('purchasecontract-deleted')
        const channelcreate = pusher.subscribe('purchasecontract-created')
        const channelupdate = pusher.subscribe('purchasecontract-updated')

        channeldelete.bind('purchasecontract-deleted-event', data => {
            setPurchaseContract((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })

        channelcreate.bind('purchasecontract-created-event', data => {
            getPurchaseContract(id)
        })

        channelupdate.bind('purchasecontract-updated-event', data => {
            getPurchaseContract(id)
        })
    }, [])

    useEffect(() => {
        getPurchaseContract(id)
        getPurchaseAddresses(id)
    }, [id])

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false)
        setItemsSend([])
    }
    const getPurchaseContract = async (id) => {
        await axios.get(`/api/purchase-contracts?vendor_id=${id}`, config)
            .then(res => {
                const purchaseContract = res.data
                setPurchaseContract(purchaseContract)
            })
    }

    const getPurchaseAddresses = async (id) => {
        await axios.get(`/api/purchase-addresses?vendor_id=${id}`, config)
            .then(res => {
                const shipTo = res.data
                setPurchaseAddresses(shipTo)
            })
    }

    const createPurchaseContract = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const formData = {}

        formData['vendor_id'] = id
        formData['purchase_address_id'] = purchase_address_id
        formData['purchase_contract_items'] = itemsSend


        await axios.post(`/api/purchase-contracts`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
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



    const salesColumns = [
        {
            field: 'id',
            headerName: t('no'),
            flex: 0.5
        },
        {
            field: 'purchase_code',
            headerName: t('purchase_code'),
            flex: 0.5
        },
        {
            field: 'purchase_name',
            headerName: t('purchase_name'),
            flex: 0.5
        },
        {
            field: 'purchase_address',
            headerName: t('purchase_addresses'),
            flex: 1
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 0.5,
            renderCell: (params) => <CustomerActions params={params} setIsLoading={setIsLoading} name={name} id={id} purchaseAddresses={purchaseAddresses} config={config} getPurchaseContract={getPurchaseContract}/>
        }
    ]


    return (
        <>
            <div className='pb-5 shadow-md mb-2 rounded-md'>
                <div className='flex justify-start items-center gap-4 '>
                    <p className='font-bold roboto color-fake ml-5'>{t('purchase_contracts')}</p>
                    <Tooltip title={t('createNewPC')} placement='right'>
                        <div>
                            <AddButton onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                        </div>
                    </Tooltip>
                </div>
            </div>
            <div>
                <TableShared items={purchaseContract} columns={salesColumns} />
            </div>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('createNewPC')}</p>
                        </div>
                        <button type="button" onClick={createPurchaseContract} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('create')}
                        </button>
                    </div>
                    <div className='flex gap-1'>
                        <VendorInfo name={name} setIsLoading={setIsLoading} id={id} purchaseAddresses={purchaseAddresses} setPurchase_address_id={setPurchase_address_id} purchase_address_id={purchase_address_id} handleClose={handleClose} />
                        <PurchaseContractsItems setIsLoading={setIsLoading} setItemsSend={setItemsSend} itemsSend={itemsSend} />
                    </div>

                </Box>
            </Modal>
        </>
    )
}

export default PurchaseContracts

const CustomerActions = (params) => {

    const { t } = useTranslation()

    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const [purchase_address_id, setPurchase_address_id] = useState(params.params.row.purchase_address_id)
    const [itemsSend, setItemsSend] = useState(params.params.row.purchase_contract_items)

    const updatePurchaseContract = async (e) => {
        e.preventDefault()
        params.setIsLoading(true)
        const formData = {}

        formData['vendor_id'] = params.params.row.vendor_id
        formData['purchase_address_id'] = purchase_address_id
        formData['purchase_contract_items'] = itemsSend

        await axios.put(`/api/purchase-contracts/${params.params.row.id}`, formData, params.config).then(({ data }) => {
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



    const deletePurchaseContract = async (id) => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_po') + id + "?",
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
        await axios.delete(`/api/purchase-contracts/${id}`, params.config).then(({ data }) => {
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
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => deletePurchaseContract(params.params.row.id)}><i className="fa-solid fa-trash"></i></span>
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
                            <p className='text-xl roboto font-semibold text-white'>{t('editPurchaseContract')} - {params.params.row.id}</p>
                        </div>
                        <button type="button" onClick={updatePurchaseContract} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('edit')}
                        </button>
                    </div>
                    <div className='flex gap-1'>
                        <VendorInfoUpdate name={params.name} id={params.id} purchaseAddresses={params.purchaseAddresses} setPurchase_address_id={setPurchase_address_id} purchase_address_id={purchase_address_id}/>
                        <PurchaseContractsItemsUpdate setIsLoading={params.setIsLoading} id={params.params.row.id} itemsSend={itemsSend} setItemsSend={setItemsSend} />
                    </div>

                </Box>
            </Modal>
        </>
    )
}
