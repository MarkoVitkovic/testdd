import React, { useState, useEffect } from 'react'

import { Tooltip } from '@mui/material'
import ClearIcon from "@mui/icons-material/Clear"
import IconButton from "@mui/material/IconButton"
import InputLabel from '@mui/material/InputLabel'
import { useTranslation } from "react-i18next"
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import dayjs from 'dayjs'
import Pusher from 'pusher-js'

import AppLayout from '../../components/Layouts/AppLayout'
import CreatePurchaseOrder from '../../components/sales_purchase_orders/CreatePurchaseOrder'
import Loading from '../../components/Loading'
import { useStateContext } from '../../context/ContextProvider'
import axios from '../../lib/axios'
import DailyBoardTablePurchase from '../../components/DailyBoardTablePurchase'
import AddButton from '../../components/AddButton'


const PurchaseOrder = () => {

    const { t } = useTranslation()
    const { choosesite, setChoosesite, config } = useStateContext()

    const [open, setOpen] = useState(false)
    const [searchStatus, setSearchStatus] = useState('')
    const [searchDate, setSearchDate] = useState('')
    const [searchStatus1, setSearchStatus1] = useState('')
    const [searchDate1, setSearchDate1] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [purchaseOrderStatuses, setPurchaseOrderStatuses] = useState([])
    const [purchaseOrderStatusesFuture, setPurchaseOrderStatusesFuture] = useState([])
    const [purchaseOrderDates, setPurchaseOrderDates] = useState([])
    const [purchaseOrderDatesFuture, setPurchaseOrderDatesFuture] = useState([])
    const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState([])
    const [filteredPurchaseOrdersFuture, setFilteredPurchaseOrdersFuture] = useState([])



    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe(`purchaseorder-deleted-site-${localStorage.getItem('site')}`)
        const channelcreate = pusher.subscribe(`purchaseorder-created-site-${localStorage.getItem('site')}`)
        const channelupdate = pusher.subscribe(`purchaseorder-updated-site-${localStorage.getItem('site')}`)


        channeldelete.bind(`purchaseorder-deleted-event-site-${localStorage.getItem('site')}`, data => {
            setPurchaseOrders((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })

        channelcreate.bind(`purchaseorder-created-event-site-${localStorage.getItem('site')}`, data => {
            getPurchaseOrder(data.id, 'created')
        })

        channelupdate.bind(`purchaseorder-updated-event-site-${localStorage.getItem('site')}`, data => {
            getPurchaseOrder(data.id, 'updated')
        })
    }, [])

    const getPurchaseOrder = async (id, state) => {

        await axios.get(`/api/purchase-orders/${id}`, config)
            .then(res => {
                const purchaseOrder = res.data
                if (state === 'created') setPurchaseOrders((prev) => [...prev, purchaseOrder])

                if (state === 'updated') setPurchaseOrders((prev) => {
                    const item = prev.find((i) => i.id === id)
                    const exItem = prev.filter((i) => i.id !== item.id)
                    const vab = [...exItem, purchaseOrder]
                    return vab
                })
            })

    }

    useEffect(() => {
        setChoosesite(localStorage.getItem('site'))
    }, [])

    useEffect(() => {
        if (choosesite) {
            getPurchaseorders()
        }
    }, [choosesite])

    useEffect(() => {
        if (searchStatus1 !== '' && searchDate1 === '') {
            setFilteredPurchaseOrders(purchaseOrders.filter((order) => order.po_status_id === searchStatus1 && new Date(dayjs(order.requested_collection_date)) <= new Date(dayjs()))); // Filter by status

            getPurchaseOrderDates(purchaseOrders.filter((order) => order.po_status_id === searchStatus1 && new Date(dayjs(order.requested_collection_date)) <= new Date(dayjs())))
        } else if (searchStatus1 === '' && searchDate1 !== '') {
            setFilteredPurchaseOrders(purchaseOrders.filter((order) => order.requested_collection_date === searchDate1)); // Filter by date

            getPurchaseOrderStatuses(purchaseOrders.filter((order) => order.requested_collection_date === searchDate1))
        } else if (searchStatus1 !== '' && searchDate1 !== '') {
            setFilteredPurchaseOrders(purchaseOrders.filter((order) => order.po_status_id === searchStatus1 && order.requested_collection_date === searchDate1)); // Filter by status & date

            getPurchaseOrderDates(purchaseOrders.filter((order) => order.po_status_id === searchStatus1 && order.requested_collection_date === searchDate1))
            getPurchaseOrderStatuses(purchaseOrders.filter((order) => order.po_status_id === searchStatus1 && order.requested_collection_date === searchDate1))
        } else {
            setFilteredPurchaseOrders(purchaseOrders.filter((item) => new Date(dayjs(item.requested_collection_date)) <= new Date(dayjs())))
            getPurchaseOrderDates(purchaseOrders)
            getPurchaseOrderStatuses(purchaseOrders)
        }
    }, [searchStatus1, searchDate1, purchaseOrders])

    useEffect(() => {
        if (searchStatus !== '' && searchDate === '') {
            setFilteredPurchaseOrdersFuture(purchaseOrders.filter((order) => order.po_status_id === searchStatus && new Date(dayjs(order.requested_collection_date)) > new Date(dayjs()))); // Filter by status

            getPurchaseOrderDatesF(purchaseOrders.filter((order) => order.po_status_id === searchStatus && new Date(dayjs(order.requested_collection_date)) > new Date(dayjs())))
        } else if (searchStatus === '' && searchDate !== '') {
            setFilteredPurchaseOrdersFuture(purchaseOrders.filter((order) => order.requested_collection_date === searchDate)); // Filter by date

            getPurchaseOrderStatusesF(purchaseOrders.filter((order) => order.requested_collection_date === searchDate))
        } else if (searchStatus !== '' && searchDate !== '') {
            setFilteredPurchaseOrdersFuture(purchaseOrders.filter((order) => order.po_status_id === searchStatus && order.requested_collection_date === searchDate)); // Filter by status & date

            getPurchaseOrderDatesF(purchaseOrders.filter((order) => order.po_status_id === searchStatus && order.requested_collection_date === searchDate))
            getPurchaseOrderStatusesF(purchaseOrders.filter((order) => order.po_status_id === searchStatus && order.requested_collection_date === searchDate))
        } else {

            setFilteredPurchaseOrdersFuture(purchaseOrders.filter((item) => new Date(dayjs(item.requested_collection_date)) > new Date(dayjs())))
            getPurchaseOrderDatesF(purchaseOrders)
            getPurchaseOrderStatusesF(purchaseOrders)
        }
    }, [searchStatus, searchDate, purchaseOrders])




    const getPurchaseorders = async () => {
        await axios.get(`/api/list-orders?type=purchase&site_id=${choosesite}`, config)
            .then(res => {
                const orders = res.data
                setPurchaseOrders(orders)
                getPurchaseOrderStatuses(orders)
                getPurchaseOrderDates(orders)
                getPurchaseOrderStatusesF(orders)
                getPurchaseOrderDatesF(orders)
                setFilteredPurchaseOrders(orders.filter((item) => new Date(dayjs(item.requested_collection_date)) <= new Date(dayjs())));
                setFilteredPurchaseOrdersFuture(orders.filter((item) => new Date(dayjs(item.requested_collection_date)) > new Date(dayjs())))

            })
    }



    const getPurchaseOrderStatuses = (purchaseOrders) => {
        let pastPresentpurchaseOrders = purchaseOrders.filter((item) => new Date(dayjs(item.requested_collection_date)) <= new Date(dayjs()));

        let statuses = [];

        pastPresentpurchaseOrders.forEach(order => {
            let newStatus = {
                id: order.po_status_id,
                name: order.po_status_name,
            };

            let newStatusExists = statuses.some(function(status) {
                return status.id === newStatus.id
            });

            if(!newStatusExists) {
                statuses.push(newStatus);
            }
        });

        statuses.sort((a, b) => {
            return a.id - b.id
        });

        setPurchaseOrderStatuses(statuses);
    }

    const getPurchaseOrderStatusesF = (purchaseOrders) => {
        let futurepurchaseOrders = purchaseOrders.filter((item) => new Date(dayjs(item.requested_collection_date)) > new Date(dayjs()));

        let futureStatuses = [];

        futurepurchaseOrders.forEach(order => {
            let newFutureStatus = {
                id: order.po_status_id,
                name: order.po_status_name,
            };

            let newFutureStatusExists = futureStatuses.some(function(status) {
                return status.id === newFutureStatus.id
            });

            if(!newFutureStatusExists) {
                futureStatuses.push(newFutureStatus);
            }
        });

        futureStatuses.sort((a, b) => {
            return a.id - b.id
        });

        setPurchaseOrderStatusesFuture(futureStatuses);
    }

    const getPurchaseOrderDates = (purchaseOrders) => {
        let pastPresentpurchaseOrders = purchaseOrders.filter((item) => new Date(dayjs(item.requested_collection_date)) <= new Date(dayjs()));

        let dates = [];

        pastPresentpurchaseOrders.forEach(order => {
            let newDate = order.requested_collection_date;

            let newDateExists = dates.includes(newDate);

            if(!newDateExists) {
                dates.push(newDate)
            }
        });

        dates.sort();

        setPurchaseOrderDates(dates);
    }

    const getPurchaseOrderDatesF = (purchaseOrders) => {
        let futurepurchaseOrders = purchaseOrders.filter((item) => new Date(dayjs(item.requested_collection_date)) > new Date(dayjs()));

        let futureDates = [];

        futurepurchaseOrders.forEach(order => {
            let newFutureDate = order.requested_collection_date;

            let newFutureDateExists = futureDates.includes(newFutureDate);

            if(!newFutureDateExists) {
                futureDates.push(newFutureDate);
            }
        });

        futureDates.sort();

        setPurchaseOrderDatesFuture(futureDates);
    }


    const handleOpen = () => {
        setOpen(!open)
    }

    const handleClearStatus = () => {
        setSearchStatus('')
        getPurchaseOrderDatesF(filteredPurchaseOrdersFuture)
    }

    const handleClearStatus1 = () => {
        setSearchStatus1('')
        getPurchaseOrderDates(filteredPurchaseOrders)
    }

    const handleClearDate = () => {
        setSearchDate('')
        getPurchaseOrderStatusesF(filteredPurchaseOrdersFuture)
    }

    const handleClearDate1 = () => {
        setSearchDate1('')
        getPurchaseOrderStatuses(filteredPurchaseOrders)
    }

    return (
        <>

            {isLoading ? <Loading /> : ''}
            <AppLayout>
                <div className='flex justify-between'>
                    <div className='p-5 w-full'>
                        <div className='pb-5 shadow-md mb-2 rounded-md'>
                            <div className='flex justify-between items-center'>
                                <div className='flex justify-start gap-4 items-center'>
                                    <p className='font-bold roboto pl-5 color-fake'>{t('todays_purchase_orders')}</p>
                                    <Tooltip title={t('create_new_po')} placement='right'>
                                        <div>
                                            <AddButton className="text-[#b7472a]" onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className='pr-5'>
                                    <span style={{ color: '#b7472a', fontSize: '22px', transform: 'rotate(225deg)' }} className="flex items-center justify-center">
                                        <i className="fa-solid fa-arrow-up-long"></i>
                                    </span>
                                </div>
                            </div>
                            <div className='flex justify-between items-end w-full'>
                                <div className='px-5 pt-5 w-full'>
                                    <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('search_by_status')}</InputLabel>
                                        <Select
                                            value={searchStatus1}
                                            onChange={e => setSearchStatus1(e.target.value)}
                                            label="Search role"
                                            sx={{ ".MuiSelect-iconStandard": { display: searchStatus1 ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                            endAdornment={searchStatus1 ? (<IconButton sx={{ visibility: searchStatus1 ? "visible" : "hidden", padding: '0' }} onClick={handleClearStatus1}><ClearIcon /></IconButton>) : false}
                                        >
                                            {purchaseOrderStatuses.map((status) => (
                                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                <div className='px-5 pt-5 w-full'>
                                    <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('search_by_request_delivery_date')}</InputLabel>
                                        <Select
                                            value={searchDate1}
                                            onChange={e => setSearchDate1(e.target.value)}
                                            label="Search Past Or Present Date"
                                            sx={{ ".MuiSelect-iconStandard": { display: searchDate1 ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                            endAdornment={searchDate1 ? (<IconButton sx={{ visibility: searchDate1 ? "visible" : "hidden", padding: '0' }} onClick={handleClearDate1}><ClearIcon /></IconButton>) : false}
                                        >
                                            {purchaseOrderDates.map((date) => (
                                                <MenuItem key={date} value={date}>{date}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                        <div>
                            <DailyBoardTablePurchase items={filteredPurchaseOrders} />
                        </div>
                    </div>
                    <div className='p-5 w-full'>
                        <div className='pb-5 shadow-md mb-2 rounded-md'>
                            <div className='flex justify-between items-center gap-4 '>
                                <div className='flex justify-start gap-4 items-center'>
                                    <p className='font-bold roboto pl-5 color-fake'>{t('future_purchase_orders')}</p>
                                    <Tooltip title={t('create_new_po')} placement='right'>
                                        <div>
                                            <AddButton className="text-[#b7472a]" onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className='pr-5'>
                                    <span style={{ color: '#b7472a', fontSize: '22px', transform: 'rotate(225deg)' }} className="flex items-center justify-center">
                                        <i className="fa-solid fa-arrow-up-long"></i>
                                    </span>
                                </div>
                            </div>
                            <div className='flex justify-between items-end w-full'>
                                <div className='px-5 pt-5 w-full'>
                                    <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('search_by_status')}</InputLabel>
                                        <Select
                                            value={searchStatus}
                                            onChange={e => setSearchStatus(e.target.value)}
                                            label="Search role"
                                            sx={{ ".MuiSelect-iconStandard": { display: searchStatus ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                            endAdornment={searchStatus ? (<IconButton sx={{ visibility: searchStatus ? "visible" : "hidden", padding: '0' }} onClick={handleClearStatus}><ClearIcon /></IconButton>) : false}
                                        >
                                            {purchaseOrderStatusesFuture.map((status) => (
                                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                <div className='px-5 pt-5 w-full'>
                                    <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('search_by_request_delivery_date')}</InputLabel>
                                        <Select
                                            value={searchDate}
                                            onChange={e => setSearchDate(e.target.value)}
                                            label="Search Past Or Present Date"
                                            sx={{ ".MuiSelect-iconStandard": { display: searchDate ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                            endAdornment={searchDate ? (<IconButton sx={{ visibility: searchDate ? "visible" : "hidden", padding: '0' }} onClick={handleClearDate}><ClearIcon /></IconButton>) : false}
                                        >
                                            {purchaseOrderDatesFuture.map((date) => (
                                                <MenuItem key={date} value={date}>{date}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                        <div>
                            <DailyBoardTablePurchase items={filteredPurchaseOrdersFuture} />
                        </div>
                    </div>
                </div>
                <CreatePurchaseOrder open={open} handleOpen={handleOpen} setIsLoading={setIsLoading} />
            </AppLayout>

        </>
    )
}

export default PurchaseOrder

