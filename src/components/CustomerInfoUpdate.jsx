import React, { useState, useEffect } from 'react'

import { InputLabel, FormControl, Select, MenuItem } from '@mui/material';

import axios from '../lib/axios';
import { useTranslation } from 'react-i18next';
import { useStateContext } from '../context/ContextProvider';


const CustomerInfo = ({ id, name, shipToAddresses, setShip_to_address_id, ship_to_address_id }) => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    const [shipToAddress, setShipToAddress] = useState(ship_to_address_id)
    const [address, setAddress] = useState()

    const getShipAddress = async (id) => {
        await axios.get(`/api/ship-addresses/${id}`, config)
            .then(res => {
                const shipTo = res.data
                setAddress(shipTo)
            })
    }

    useEffect(() => {
        setShip_to_address_id(ship_to_address_id)
    }, [])

    useEffect(() => {
        getShipAddress(shipToAddress)
    }, [shipToAddress])

    const handleShip = (e) => {
        setShipToAddress(e)
        setShip_to_address_id(e)
    }

    return (
        <div className='p-5 '>
            <div className='p-3 shadow-md mb-2 rounded-md' style={{ width: '480px'}}>
                <div className='flex justify-between items-center ' style={{ width: '450px'}}>
                    <div className='p-1'>
                        <InputLabel>{t('customer')}</InputLabel>
                    </div>
                    <div className='pb-2'>
                        <FormControl variant="standard" sx={{ width: '300px' }}>
                            <Select value={id} disabled>
                                <MenuItem value={id}>{name}</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>
                <div className='flex justify-between items-start bg-gray-300  pb-0' style={{ width: '450px'}}>
                    <div className='p-1'>
                        <InputLabel>{t('shipToAdd')}</InputLabel>
                    </div>
                    <div className=' pb-0'>
                        <FormControl variant="standard" sx={{ width: '300px' }}>
                            <Select value={shipToAddress} onChange={e => handleShip(e.target.value)} disabled>
                                {
                                    shipToAddresses?.map((item, index) => (
                                        <MenuItem value={item.id} key={index}>{item.name}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        {
                            shipToAddress ? <div className='mt-5 mb-2' style={{ width: '300px' }}>
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

export default CustomerInfo
