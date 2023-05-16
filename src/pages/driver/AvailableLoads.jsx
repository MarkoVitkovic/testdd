import React, { useState, useEffect } from 'react'
import { useTranslation } from "react-i18next"
import { useAuth } from '../../hooks/auth'
import { useStateContext } from '../../context/ContextProvider'
import AppLayout from '../../components/Layouts/AppLayout'
import axios from '../../lib/axios'
import Pusher from 'pusher-js'
import AssignedShipments from '../../components/driver/AssignedShipments'
import AssignedCollections from '../../components/driver/AssignedCollections'
import update from 'immutability-helper';

const AvailableLoads = () => {
    const { t } = useTranslation()
    const { user } = useAuth({ middleware: 'guest' })
    const { choosesite, setChoosesite, config } = useStateContext()

    const [shipments, setShipments] = useState([])
    const [collections, setCollections] = useState([])

    useEffect(() => {
        setChoosesite(localStorage.getItem('site'))
    }, [])

    useEffect(() => {
        const pusher = new Pusher('386213d5feb1fcd42917', {
            cluster: 'eu',
            encrypted: true,
        })
        const shipmentChannelDelete = pusher.subscribe(`salesorder-deleted-site-${localStorage.getItem('site')}`)
        const shipmentChannelUpdate = pusher.subscribe(`salesorder-updated-site-${localStorage.getItem('site')}`)

        const collectionChannelDelete = pusher.subscribe(`purchaseorder-deleted-site-${localStorage.getItem('site')}`)
        const collectionChannelUpdate = pusher.subscribe(`purchaseorder-updated-site-${localStorage.getItem('site')}`)

        // Bind shipment channel pushes

        shipmentChannelDelete.bind(`salesorder-deleted-event-site-${localStorage.getItem('site')}`, data => {
            setShipments((prev) => {
                const deletedShipment = prev.find((i) => i.id === data.id)
                const shipmentsUpdated = prev.filter((i) => i.id !== deletedShipment.id)
                return shipmentsUpdated
            })
        })

        shipmentChannelUpdate.bind(`salesorder-updated-event-site-${localStorage.getItem('site')}`, data => {
            getShipment(data.id, 'updated')
        })

        // Bind collection channel pushes

        collectionChannelDelete.bind(`purchaseorder-deleted-event-site-${localStorage.getItem('site')}`, data => {
            setCollections((prev) => {
                const deletedCollection = prev.find((i) => i.id === data.id)
                const collectionsUpdated = prev.filter((i) => i.id !== deletedCollection.id)
                return collectionsUpdated
            })
        })

        collectionChannelUpdate.bind(`purchaseorder-updated-event-site-${localStorage.getItem('site')}`, data => {
            getCollection(data.id, 'updated')
        })
    }, [])

    const getLoads = async () => {
        await axios.get(`/api/list-loads/${user?.id}`, config)
            .then(res => {
                const data = res.data
                setShipments(data.data.shipments)
                setCollections(data.data.collections)
            })
    }

    const getShipments = async () => {
        await axios.get(`/api/list-shipments/${user?.id}`, config)
            .then(res => {
                const data = res.data
                setShipments(data)
            })
    }

    const getShipment = async (id, event) => {
        await axios.get(`/api/sales-orders/${id}`, config)
            .then(res => {
                const shipment = res.data
                if (event === 'updated' && shipment.driver_id === user?.id) {
                    if(shipment.so_status_id !== 7 && shipment.so_status_id !== 8) {
                        setShipments((prev) => {
                            const shipmentIndex = prev.findIndex((i) => i.id === shipment.id)

                            update(prev,
                                {
                                    items: {
                                        $splice: [[shipmentIndex, 1]]
                                    }
                                }
                            )
                        })
                    } else {
                        setShipments((prev) => {
                            const shipmentIndex = prev.findIndex((i) => i.id === id)

                            update(prev, {
                                [shipmentIndex]: {$set: shipment}
                            })
                        })
                    }
                }
            })
    }

    const getCollections = async () => {
        await axios.get(`/api/list-collections/${user?.id}`, config)
            .then(res => {
                const data = res.data
                setCollections(data)
            })
    }

    const getCollection = async (id, event) => {
        await axios.get(`/api/purchase-orders/${id}`, config)
            .then(res => {
                const collection = res.data
                if (event === 'updated' && collection.driver_id === user?.id) {
                    if(collection.po_status_id !== 4 && collection.po_status_id !== 5) {
                        setCollections((prev) => {
                            const collectionIndex = prev.findIndex((i) => i.id === collection.id)

                            update(prev,
                                {
                                    items: {
                                        $splice: [[collectionIndex, 1]]
                                    }
                                }
                            )
                        })
                    } else {
                        setCollections((prev) => {
                            if(prev === undefined || prev.length < 1) {
                                update(prev,
                                    {
                                        $push: collection
                                    }
                                )
                            } else {
                                const collectionIndex = prev.findIndex((i) => i.id === collection.id)

                                update(prev, {
                                    [collectionIndex]: {$set: collection}
                                })
                            }
                        })
                    }
                }
            })
    }

    useEffect(() => {
        if (choosesite) {
            getShipments()
            getCollections()
        }
    }, [choosesite])

    return (
        <AppLayout>
            <div className='flex flex-col justify-between'>
                <div className='p-5 w-full'>
                    <div className='pb-5 shadow-md mb-2 rounded-md'>
                        <div className='flex justify-between items-center'>
                            <div className='flex justify-start gap-4 items-center'>
                                <p className='font-bold roboto pl-5 color-fake'>{t('shipments')}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <AssignedShipments shipments={shipments ?? []} />
                    </div>
                </div>

                <div className='p-5 w-full'>
                    <div className='pb-5 shadow-md mb-2 rounded-md'>
                        <div className='flex justify-between items-center'>
                            <div className='flex justify-start gap-4 items-center'>
                                <p className='font-bold roboto pl-5 color-fake'>{t('collections')}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <AssignedCollections collections={collections ?? []} />
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default AvailableLoads
