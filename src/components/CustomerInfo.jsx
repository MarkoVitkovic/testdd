import React, { useState, useEffect } from 'react'

import { InputLabel, FormControl, Select, MenuItem, Modal, Box } from '@mui/material';

import axios from '../lib/axios';
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next';
import { useStateContext } from '../context/ContextProvider';
import CustomerExistUpdate from './CustomerExistUpdate'
import style from '../styles/style';
import SalesContractsItemExistUpdate from './SalesContractsItemExistUpdate'


const CustomerInfo = ({ id, name, shipToAddresses, setShip_to_address_id, setIsLoading, handleClose, clicked }) => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    const [shipToAddress, setShipToAddress] = useState('')
    const [address, setAddress] = useState()
    const [open, setOpen] = useState(false)
    const [addressToUpdateId, setAddressToUpdateId] = useState('')
    const [items, setItems] = useState([])
    const [contractId, setContractId] = useState('')

    const handleCloseModal = () =>{ setOpen(false); handleClose()}
    const handleOpenModal = () => setOpen(true)

    const getShipAddress = async (id) => {
        await axios.get(`/api/ship-addresses/${id}`, config)
            .then(res => {
                const shipTo = res.data
                setAddress(shipTo)
            })
    }

    useEffect(() => {
        setShip_to_address_id('')
    }, [])



    useEffect(() => {
        getShipAddress(shipToAddress)
    }, [shipToAddress])





    const handleShip = async (e) => {
        await axios.get(`/api/sales-contracts?ship_address_id=${e}&customer_id=${id}`, config)
            .then(res => {
                let shipTo = res.data

                setContractId(shipTo[0]?.id)
                setItems(shipTo[0]?.sales_contract_items)

                if (shipTo.length === 0) {
                    setShipToAddress(e)
                    setShip_to_address_id(e)
                } else {
                    Swal.fire({
                        title: t('sales_contract_exists'),
                        text: 'You will be transferred to the update of the existing sales contract.',
                        icon: 'warning'
                    })
                    setAddressToUpdateId(e)
                    handleOpenModal()
                }
            })
    }

    const updateSalesContract = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = {}

        formData['customer_id'] = id
        formData['ship_address_id'] = addressToUpdateId
        formData['sales_contract_items'] = items

        await axios.put(`/api/sales-contracts/${contractId}`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setIsLoading(false)
            handleCloseModal()
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

    return (
        <>
            <div className='p-5' >
                <div className='p-3 shadow-md mb-2 rounded-md' style={{ width: '480px'}}>
                    <div className='flex justify-between items-center' style={{ width: '450px'}}>
                        <div className='p-1'>
                            <InputLabel>{t('customer')}</InputLabel>
                        </div>
                        <div className='pb-2'>
                            <FormControl variant="standard" sx={{ width: '300px' }}>
                                <Select value={id}>
                                    <MenuItem value={id}>{name}</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className='flex justify-between items-start bg-gray-300 pb-0' style={{ width: '450px'}}>
                        <div className='p-1'>
                            <InputLabel>{t('shipToAdd')}</InputLabel>
                        </div>
                        <div className='pb-0'>
                            <FormControl variant="standard" sx={{ width: '300px' }}>
                                <Select defaultValue=" " value={shipToAddress} onChange={e => handleShip(e.target.value)}>
                                    {
                                        shipToAddresses?.map((item, index) => (
                                            <MenuItem value={item.id} key={index}>{item.name}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            {
                                shipToAddress !== "" ? <div className='mt-5 mb-2' style={{ width: '300px' }}>
                                    <p className='mb-3'>{address?.address}</p>
                                    <p>{address?.city}, {address?.state} {address?.zip}</p>
                                </div> : ''
                            }
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={open} onClose={handleCloseModal}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleCloseModal}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('editSalesContract')} - {contractId}</p>
                        </div>
                        <button type="button" onClick={updateSalesContract} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('edit')}
                        </button>
                    </div>
                    <div className='flex gap-1'>
                        <CustomerExistUpdate name={name} id={id} shipToAddresses={shipToAddresses} setShip_to_address_id={setShip_to_address_id} sales_address_id={addressToUpdateId} />
                        <SalesContractsItemExistUpdate setIsLoading={setIsLoading} id={contractId} itemsSend={items} setItemsSend={setItems} />
                    </div>

                </Box>
            </Modal>
        </>
    )
}

export default CustomerInfo
