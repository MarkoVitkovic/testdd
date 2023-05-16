import React, { useState, useEffect } from 'react'

import { InputLabel, FormControl, Select, MenuItem } from '@mui/material';

import axios from '../lib/axios';
import { useTranslation } from 'react-i18next';
import { useStateContext } from '../context/ContextProvider';


const VendorExistUpdate = ({ id, name, purchaseAddresses, setPurchase_address_id, purchase_address_id }) => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    const [purchaseAddress, setPurchaseAddress] = useState(purchase_address_id)
    const [address, setAddress] = useState()

    const getPurchaseAddress = async (id) => {
        await axios.get(`/api/purchase-addresses/${id}`, config)
            .then(res => {
                const shipTo = res.data
                setAddress(shipTo)
            })
    }

    useEffect(() => {
        setPurchase_address_id(purchase_address_id)
    }, [])

    useEffect(() => {
        getPurchaseAddress(purchaseAddress)
    }, [purchaseAddress])

    const handleShip = (e) => {
        setPurchaseAddress(e)
        setPurchase_address_id(e)
    }

    return (
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
                            <Select value={purchaseAddress} onChange={e => handleShip(e.target.value)} disabled>
                                {
                                    purchaseAddresses?.map((item, index) => (
                                        <MenuItem value={item.id} key={index}>{item.name}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        {
                            purchaseAddress ? <div className='mt-5 mb-2' style={{ width: '300px' }}>
                                <p className='mb-3'>{address?.address}</p>
                                <p>{address?.city}, {address?.state} {address?.zip}</p>
                            </div> : ''
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorExistUpdate
