import React, { useState, useEffect } from 'react'

import { InputLabel, FormControl, Select, MenuItem, Modal, Box } from '@mui/material';
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next';

import axios from '../lib/axios';
import { useStateContext } from '../context/ContextProvider';
import VendorExistUpdate from './VendorExistUpdate'
import PurchaseContractsItemExistUpdate from './PurchaseContractsItemExistUpdate';
import style from '../styles/style';


const VendorInfo = ({ id, name, purchaseAddresses, setPurchase_address_id, setIsLoading, handleClose }) => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    const [purchaseAddress, setPurchaseAddress] = useState('')
    const [address, setAddress] = useState()
    const [open, setOpen] = useState(false)
    const [addressToUpdateId, setAddressToUpdateId] = useState('')
    const [items, setItems] = useState([])
    const [contractId, setContractId] = useState('')

    const handleCloseModal = () => {setOpen(false); handleClose()}
    const handleOpenModal = () => setOpen(true)

    const getPurchaseAddress = async (id) => {
        await axios.get(`/api/purchase-addresses/${id}`, config)
            .then(res => {
                const shipTo = res.data
                setAddress(shipTo)
            })
    }

    useEffect(() => {
        setPurchase_address_id('')
    }, [])

    useEffect(() => {
        getPurchaseAddress(purchaseAddress)
    }, [purchaseAddress])

    const handleShip = async(e) => {
        await axios.get(`/api/purchase-contracts?purchase_address_id=${e}&vendor_id=${id}`, config)
            .then(res => {
                let shipTo = res.data

                setContractId(shipTo[0]?.id)
                setItems(shipTo[0]?.purchase_contract_items)

                if(shipTo.length === 0) {
                    setPurchaseAddress(e)
                    setPurchase_address_id(e)
                } else {
                    Swal.fire({
                        title: t('purchase_contract_exists'),
                        text: 'You will be transferred to the update of the existing purchase contract.',
                        icon: 'warning'
                    })
                    setAddressToUpdateId(e)
                    handleOpenModal()
                }
        })
    }

    const updatePurchaseContract = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = {}

        formData['vendor_id'] = id
        formData['purchase_address_id'] = addressToUpdateId
        formData['purchase_contract_items'] = items

        await axios.put(`/api/purchase-contracts/${contractId}`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            handleCloseModal()
            handleClose()
            setIsLoading(false)
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
            <div className='p-5 '>
                <div className='p-3 shadow-md mb-2 rounded-md' style={{ width: '490px'}}>
                    <div className='flex justify-between items-center' style={{ width: '460px'}}>
                        <div className='p-1'>
                            <InputLabel>{t('vendor')}</InputLabel>
                        </div>
                        <div className='pb-2'>
                            <FormControl variant="standard" sx={{ width: '300px' }}>
                                <Select value={id} disabled>
                                    <MenuItem value={id}>{name}</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className='flex justify-between items-start bg-gray-300 pb-0' style={{ width: '460px'}}>
                        <div className='p-1'>
                            <InputLabel>{t('purchase_addresse')}</InputLabel>
                        </div>
                        <div className='pb-0'>
                            <FormControl variant="standard" sx={{ width: '300px' }}>
                                <Select value={purchaseAddress} onChange={e => handleShip(e.target.value)}>
                                    {
                                        purchaseAddresses?.map((item, index) => (
                                            <MenuItem value={item.id} key={index}>{item.name}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            {
                                purchaseAddress !== "" ? <div className='mt-5 mb-2' style={{ width: '300px' }}>
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
                            <p className='text-xl roboto font-semibold text-white'>{t('editPurchaseContract')} - {contractId}</p>
                        </div>
                        <button type="button" onClick={updatePurchaseContract} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('edit')}
                        </button>
                    </div>
                    <div className='flex gap-1'>
                        <VendorExistUpdate name={name} id={id} purchaseAddresses={purchaseAddresses} setPurchase_address_id={setPurchase_address_id} purchase_address_id={addressToUpdateId}/>
                        <PurchaseContractsItemExistUpdate setIsLoading={setIsLoading} id={contractId} itemsSend={items} setItemsSend={setItems} />
                    </div>

                </Box>
            </Modal>

        </>
    )
}

export default VendorInfo
