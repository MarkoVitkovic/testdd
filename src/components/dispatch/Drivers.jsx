import React, { useEffect, useState } from 'react'

import { useDrop } from 'react-dnd'
import Swal from 'sweetalert2'
import Popover from '@mui/material/Popover'
import CallMadeIcon from '@mui/icons-material/CallMade'
import CallReceivedIcon from '@mui/icons-material/CallReceived'
import Pusher from 'pusher-js'
import update from 'immutability-helper'

import { COLUMN_NAMES } from '../../constants/constants'
import Driver from './Driver'
import axios from '../../lib/axios'
import { useStateContext } from '../../context/ContextProvider'


const Drivers = ({ id, driver, setIsLoading, shipments, collections }) => {

    const { config } = useStateContext()
    const [possibleLoads, setPossibleLoads] = useState([])
    const [anchorEl, setAnchorEl] = useState(null)

    const [driverItems, setDriverItems] = useState([])

    useEffect(() => {
        const pusher = new Pusher('386213d5feb1fcd42917', {
            cluster: 'eu',
            encrypted: true,
        })
        const channelupdate = pusher.subscribe(`salesorder-updated-site-${localStorage.getItem('site')}`)

        const channelupdatePurchase = pusher.subscribe(`purchaseorder-updated-site-${localStorage.getItem('site')}`)

        channelupdate.bind(`salesorder-updated-event-site-${localStorage.getItem('site')}`, data => {
            console.log(data)
            getItems(id)
        })

        channelupdatePurchase.bind(`purchaseorder-updated-event-site-${localStorage.getItem('site')}`, data => {
            console.log(data)
            getItems(id)
        })

    }, [])

    const getItems = async (id) => {
        await axios.get(`/api/list-loads/${id}`, config) /* &so_status_id=6 */
            .then(res => {
                const salesOrder = res.data
                setDriverItems(salesOrder)
            })
    }

    useEffect(() => {
        if (id) getItems(id)
    }, [id])


    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handlePopoverClose = () => {
        setAnchorEl(null);
    }

    const open = Boolean(anchorEl)

    useEffect(() => {
        if (driverItems?.length > 0) checkForPossibleLoads(driverItems)
    }, [driverItems])


    const [, drop] = useDrop(
        () => ({
            accept: [COLUMN_NAMES.SHIPMENTS, COLUMN_NAMES.COLLECTIONS],
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
                canDrop: !!monitor.canDrop(),
            }),
            drop: (item) => updateStatus(item)
        }),
        [driverItems],
    )

    const updateStatus = async (item) => {

        setIsLoading(true)
        const formData = {}
        let type = ''

        if (item.order_type === "SHIPMENTS") {
            type = "sales-orders"
        }
        else {
            type = "purchase-orders"
        }

        formData['driver_id'] = id

        await axios.post(`/api/${type}/${item.id}/assign-driver`, formData, config).then(({ data }) => {
            setIsLoading(false)
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

    const checkForPossibleLoads = (driverItems) => {
        var filteredShipments = shipments.filter((item) => item.driver_id == null)
        var filteredCollections = collections.filter((item) => item.driver_id == null)
        var shipToNames = driverItems.map(i => (i.order_type == 'SHIPMENTS') ? i.ship_address_id : i.purchase_address_id)
        var possibleShipments = filteredShipments.filter(i => shipToNames.includes(i.ship_address_id))
        var possibleCollections = filteredCollections.filter(i => shipToNames.includes(i.purchase_address_id))

        setPossibleLoads(possibleShipments.concat(possibleCollections))
    }

    return (
        <>
            <div className='shadow-gray-400 shadow-md rounded-md h-fit w-1/4'>
                <div className='border-b flex justify-between items-baseline relative'>
                    <p className='p-4 pt-6 font-bold'>{driver.name}</p>
                    <div className='p-4 pb-6 pr-6 text-gray-400'><i className="fa-solid fa-truck"></i></div>
                    {possibleLoads.length > 0 ?
                        <div onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose} className='absolute right-1 top-1 bg-green-500 rounded-full text-center w-[22px] h-[22px] flex items-center justify-center'>
                            <p className='text-xs text-white font-bold'>{possibleLoads.length}</p>
                            <Popover id="mouse-over-popover" sx={{ pointerEvents: 'none', borderRadius: 'none' }} open={open} anchorEl={anchorEl} anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }} transformOrigin={{ vertical: 'top', horizontal: 'left', }} onClose={handlePopoverClose} disableRestoreFocus >
                                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: 'none' }} className='p-2 text-white'>
                                    {
                                        possibleLoads.map((item, index) =>
                                        (
                                            <div key={index} className='flex justify-between items-center gap-20 pb-1 pt-1'>
                                                <div className='flex gap-2'>
                                                    <p className='p-2 text-md'>{item.so_number || item.po_number}</p>
                                                    <p className='p-2 text-md'>{item.customer_name || item.vendor_name}</p>
                                                </div>
                                                <div className='p-2 rounded-full bg-white'>
                                                    {item.order_type === "SHIPMENTS" ? <div style={{ color: '#336195' }}><CallMadeIcon /></div> : <div style={{ color: '#b7472a' }}><CallReceivedIcon /></div>}
                                                </div>
                                            </div>
                                        )
                                        )
                                    }
                                </div>
                            </Popover>
                        </div>
                        :
                        ''
                    }
                </div>
                <div ref={drop}>
                    {driverItems?.length > 0 ? driverItems?.map((item, index) => <Driver id={id} driverItems={driverItems} setDriverItems={setDriverItems} setIsLoading={setIsLoading}  key={index} shipments={item} type={item.order_type} index={index} />) : <div className='p-4 flex justify-center'>No data</div>}
                </div>
            </div>
        </>
    )
}

export default Drivers
