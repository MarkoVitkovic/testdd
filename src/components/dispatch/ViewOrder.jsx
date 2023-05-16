import React from 'react'

import { Modal, Box, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CallMadeIcon from '@mui/icons-material/CallMade'
import CallReceivedIcon from '@mui/icons-material/CallReceived'

const ViewOrder = ({ order, open, handleOpen }) => {

    const { t } = useTranslation()

    return (
        <Modal open={open} onClose={handleOpen}>
            <Box sx={style}>
                <div className='p-5' style={{ backgroundColor: order.order_type === "SHIPMENTS" ? '#336195' : '#b7472a', borderRadius: '5px 5px 0 0' }}>
                    <div className='flex gap-4 items-center justify-between'>
                        <p className='text-xl roboto font-semibold text-white'>{order.so_number || order.po_number} {order.customer_name || order.vendor_name}</p>
                        <div className='p-2 rounded-full bg-white'>
                            {order.order_type === "SHIPMENTS" ? <div style={{ color: '#336195' }}><CallMadeIcon /></div> : <div style={{ color: '#b7472a' }}><CallReceivedIcon /></div>}
                        </div>
                    </div>
                </div>
                <div>
                    <div className='p-5'>
                        <div>
                            <p>{t('status')}: <span className='font-bold'>{order.so_status_name || order.po_status_name}</span></p>
                        </div>
                        <div className='flex justify-end gap-4'>
                            <Button variant="contained" style={{ backgroundColor: order.order_type === "SHIPMENTS" ? '#336195' : '#b7472a' }} onClick={handleOpen}>{t('close')}</Button>
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default ViewOrder

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    height: 'fit-content',
    bgcolor: '#ffffff',
    border: 'transparent',
    borderRadius: '5px',
    boxShadow: 24,
    zIndex: "1600",
    outline: 'none'
}
