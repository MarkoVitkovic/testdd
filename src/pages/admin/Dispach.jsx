import React, { useState, useEffect } from 'react'

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import Pusher from 'pusher-js'
import update from 'immutability-helper'

import AppLayout from '../../components/Layouts/AppLayout'
import { useStateContext } from '../../context/ContextProvider'
import axios from '../../lib/axios'
import Drivers from '../../components/dispatch/Drivers'
import ShipmentsTable from '../../components/dispatch/ShipmentsTable'
import CollectionsTable from '../../components/dispatch/CollectionsTable'
import Loading from '../../components/Loading'




const Dispach = () => {

    const { choosesite, setChoosesite, config } = useStateContext()

    const [shipments, setShipments] = useState([])
    const [collections, setCollections] = useState([])
    const [drivers, setDrivers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [items, setItems] = useState([])

    useEffect(() => {
        setChoosesite(localStorage.getItem('site'))
    }, [])

    useEffect(() => {
        if (choosesite) getItems()
    }, [choosesite])

    const getItems = async () => {
        await axios.get(`/api/sales-orders?site_id=${localStorage.getItem('site')}&so_status_id=6`, config) /* &so_status_id=6 */
            .then(res => {
                const salesOrder = res.data
                setShipments(salesOrder)
            })
        await axios.get(`/api/purchase-orders?site_id=${localStorage.getItem('site')}&po_status_id=2`, config) /*  */
            .then(res => {
                const purchaseOrders = res.data
                setCollections(purchaseOrders)
            })
        await axios.get(`/api/users?role=driver&site_id=${localStorage.getItem('site')}`, config)
            .then(res => {
                const drivers = res.data
                setDrivers(drivers)
            })
    }


    useEffect(() => {
        const pusher = new Pusher('386213d5feb1fcd42917', {
            cluster: 'eu',
            encrypted: true,
        })
        const channelupdate = pusher.subscribe(`salesorder-updated-site-${localStorage.getItem('site')}`)
        const channeldelete = pusher.subscribe(`salesorder-deleted-site-${localStorage.getItem('site')}`)

        const channelupdatePurchase = pusher.subscribe(`purchaseorder-updated-site-${localStorage.getItem('site')}`)
        const channeldeletePurchase = pusher.subscribe(`purchaseorder-deleted-site-${localStorage.getItem('site')}`)

        channelupdate.bind(`salesorder-updated-event-site-${localStorage.getItem('site')}`, data => {
            getSalesOrder(data.id)
        })
        channeldelete.bind(`salesorder-deleted-event-site-${localStorage.getItem('site')}`, data => {
            setShipments((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })
        channelupdatePurchase.bind(`purchaseorder-updated-event-site-${localStorage.getItem('site')}`, data => {
            getPurchaseOrder(data.id)
            console.log(data);
        })
        channeldeletePurchase.bind(`purchaseorder-deleted-event-site-${localStorage.getItem('site')}`, data => {
            setCollections((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })
    }, [])

    const getSalesOrder = async (id) => {

        await axios.get(`/api/sales-orders/${id}`, config)
            .then(res => {
                const salesOrder = res.data
                setShipments((prev) => {
                    const index = prev?.findIndex((i) => i.id === id)
                    return update(prev,
                        { [index]: { $set: salesOrder } }
                    )
                })
            })
    }

    const getPurchaseOrder = async (id) => {

        await axios.get(`/api/purchase-orders/${id}`, config)
            .then(res => {
                const purchaseOrder = res.data
                setCollections((prev) => {
                    const index = prev?.findIndex((i) => i.id === id)
                    return update(prev,
                        { [index]: { $set: purchaseOrder } }
                    )
                })
            })
    }


    return (
        <>
            {isLoading ? <Loading /> : ''}
            <AppLayout>
                <DndProvider backend={HTML5Backend}>
                    <div className='flex gap-10 p-5'>
                        <div className='w-1/2'>
                            <ShipmentsTable items={shipments.filter((item) => item.driver_id === null)} shipments={shipments} setShipments={setShipments} setIsLoading={setIsLoading} getItems={getItems} />
                            <CollectionsTable items={collections.filter((item) => item.driver_id === null)} setIsLoading={setIsLoading} getItems={getItems} />
                        </div>
                        <div className='w-1/2 flex gap-5 flex-wrap'>
                            {
                                drivers.map((item, index) => <Drivers shipments={shipments} collections={collections} id={item.id} driver={item} key={index} index={index} setItems={setItems} items={item.driving.shipments.concat(item.driving.collecions)} setIsLoading={setIsLoading} />)
                            }
                        </div>
                    </div>
                </DndProvider>
            </AppLayout>
        </>
    )
}

export default Dispach
