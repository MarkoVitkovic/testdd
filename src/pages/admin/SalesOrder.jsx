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
import AddButton from '../../components/AddButton'
import CreateSalesOrder from '../../components/sales_purchase_orders/CreateSalesOrder'
import Loading from '../../components/Loading'
import { useStateContext } from '../../context/ContextProvider'
import axios from '../../lib/axios'
import DailyBoardTableSales from '../../components/DailyBoardTableSales'


const SalesOrder = () => {

    const { t } = useTranslation()
    const { choosesite, setChoosesite, config } = useStateContext()

    const [open, setOpen] = useState(false)
    const [searchStatus, setSearchStatus] = useState('')
    const [searchDate, setSearchDate] = useState('')
    const [searchStatus1, setSearchStatus1] = useState('')
    const [searchDate1, setSearchDate1] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [salesOrderStatuses, setSalesOrderStatuses] = useState([])
    const [salesOrderStatusesFuture, setSalesOrderStatusesFuture] = useState([])
    const [salesOrderDates, setSalesOrderDates] = useState([])
    const [salesOrderDatesFuture, setSalesOrderDatesFuture] = useState([])
    const [unfilteredSalesOrders, setUnfilteredSalesOrders] = useState([])
    const [filteredSalesOrders, setFilteredSalesOrders] = useState([])
    const [filteredSalesOrdersFuture, setFilteredSalesOrdersFuture] = useState([])


    useEffect(() => {
        const pusher = new Pusher('386213d5feb1fcd42917', {
            cluster: 'eu',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe(`salesorder-deleted-site-${localStorage.getItem('site')}`)
        const channelcreate = pusher.subscribe(`salesorder-created-site-${localStorage.getItem('site')}`)
        const channelupdate = pusher.subscribe(`salesorder-updated-site-${localStorage.getItem('site')}`)

        channeldelete.bind(`salesorder-deleted-event-site-${localStorage.getItem('site')}`, data => {
            setUnfilteredSalesOrders((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })

        channelcreate.bind(`salesorder-created-event-site-${localStorage.getItem('site')}`, data => {
            getSalesOrder(data.id, 'created')
        })

        channelupdate.bind(`salesorder-updated-event-site-${localStorage.getItem('site')}`, data => {
            getSalesOrder(data.id, 'updated')
        })
    }, [])

    useEffect(() => {
        setChoosesite(localStorage.getItem('site'))
    }, [])

    useEffect(() => {
        if (choosesite) {
            getUnfilteredSalesOrders()
        }
    }, [choosesite])

    useEffect(() => {
        if (searchStatus1 !== '' && searchDate1 === '') {
            setFilteredSalesOrders(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus1 && new Date(dayjs(order.requested_delivery_date)) <= new Date(dayjs()))); // Filter by status

            /* getSalesOrderStatuses(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus1 && new Date(dayjs(order.requested_delivery_date)) <= new Date(dayjs()))) */
            getSalesOrderDates(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus1 && new Date(dayjs(order.requested_delivery_date)) <= new Date(dayjs())))
        } else if (searchStatus1 === '' && searchDate1 !== '') {
            setFilteredSalesOrders(unfilteredSalesOrders.filter((order) => order.requested_delivery_date === searchDate1)); // Filter by date

            /* getSalesOrderDates(unfilteredSalesOrders.filter((order) => order.requested_delivery_date === searchDate1)) */
            getSalesOrderStatuses(unfilteredSalesOrders.filter((order) => order.requested_delivery_date === searchDate1))
        } else if (searchStatus1 !== '' && searchDate1 !== '') {
            setFilteredSalesOrders(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus1 && order.requested_delivery_date === searchDate1)); // Filter by status & date

            getSalesOrderDates(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus1 && order.requested_delivery_date === searchDate1))
            getSalesOrderStatuses(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus1 && order.requested_delivery_date === searchDate1))
        } else {
            setFilteredSalesOrders(unfilteredSalesOrders.filter((item) => new Date(dayjs(item.requested_delivery_date)) <= new Date(dayjs())))
            getSalesOrderDates(unfilteredSalesOrders)
            getSalesOrderStatuses(unfilteredSalesOrders)
        }
    }, [searchStatus1, searchDate1, unfilteredSalesOrders])

    useEffect(() => {
        if (searchStatus !== '' && searchDate === '') {
            setFilteredSalesOrdersFuture(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus && new Date(dayjs(order.requested_delivery_date)) > new Date(dayjs()))); // Filter by status

            /* getSalesOrderStatusesFuture(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus && new Date(dayjs(order.requested_delivery_date)) > new Date(dayjs()))) */
            getSalesOrderDatesFuture(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus && new Date(dayjs(order.requested_delivery_date)) > new Date(dayjs())))
        } else if (searchStatus === '' && searchDate !== '') {
            setFilteredSalesOrdersFuture(unfilteredSalesOrders.filter((order) => order.requested_delivery_date === searchDate)); // Filter by date

            /* getSalesOrderDatesFuture(unfilteredSalesOrders.filter((order) => order.requested_delivery_date === searchDate)) */
            getSalesOrderStatusesFuture(unfilteredSalesOrders.filter((order) => order.requested_delivery_date === searchDate))
        } else if (searchStatus !== '' && searchDate !== '') {
            setFilteredSalesOrdersFuture(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus && order.requested_delivery_date === searchDate)); // Filter by status & date

            getSalesOrderDatesFuture(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus && order.requested_delivery_date === searchDate))
            getSalesOrderStatusesFuture(unfilteredSalesOrders.filter((order) => order.so_status_id === searchStatus && order.requested_delivery_date === searchDate))
        } else {

            setFilteredSalesOrdersFuture(unfilteredSalesOrders.filter((item) => new Date(dayjs(item.requested_delivery_date)) > new Date(dayjs())))
            getSalesOrderDatesFuture(unfilteredSalesOrders)
            getSalesOrderStatusesFuture(unfilteredSalesOrders)
        }
    }, [searchStatus, searchDate, unfilteredSalesOrders])

    const getSalesOrder = async (id, state) => {
        await axios.get(`/api/sales-orders/${id}`, config)
            .then(res => {
                const salesOrder = res.data
                if (state === 'created') setUnfilteredSalesOrders((prev) => [...prev, salesOrder])

                if (state === 'updated') setUnfilteredSalesOrders((prev) => {
                    const item = prev.find((i) => i.id === id)
                    const exItem = prev.filter((i) => i.id !== item.id)
                    const vab = [...exItem, salesOrder]
                    return vab
                })
            })

    }

    const getUnfilteredSalesOrders = async () => {
        await axios.get(`/api/list-orders?type=sales&site_id=${choosesite}`, config)
            .then(res => {
                const orders = res.data;
                getSalesOrderStatuses(orders)
                getSalesOrderStatusesFuture(orders)
                getSalesOrderDates(orders)
                getSalesOrderDatesFuture(orders)
                setUnfilteredSalesOrders(orders)
                setFilteredSalesOrders(orders.filter((item) => new Date(dayjs(item.requested_delivery_date)) <= new Date(dayjs())));
                setFilteredSalesOrdersFuture(orders.filter((item) => new Date(dayjs(item.requested_delivery_date)) > new Date(dayjs())))
            })
    }

    const getSalesOrderStatuses = (salesOrders) => {
        let pastPresentSalesOrders = salesOrders.filter((item) => new Date(dayjs(item.requested_delivery_date)) <= new Date(dayjs()));

        let statuses = [];

        pastPresentSalesOrders.forEach(order => {
            let newStatus = {
                id: order.so_status_id,
                name: order.so_status_name,
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

        setSalesOrderStatuses(statuses);
    }

    const getSalesOrderStatusesFuture = (salesOrders) => {
        let futureSalesOrders = salesOrders.filter((item) => new Date(dayjs(item.requested_delivery_date)) > new Date(dayjs()));

        let futureStatuses = [];

        futureSalesOrders.forEach(order => {
            let newFutureStatus = {
                id: order.so_status_id,
                name: order.so_status_name,
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

        setSalesOrderStatusesFuture(futureStatuses);
    }

    const getSalesOrderDates = (salesOrders) => {
        let pastPresentSalesOrders = salesOrders.filter((item) => new Date(dayjs(item.requested_delivery_date)) <= new Date(dayjs()));

        let dates = [];

        pastPresentSalesOrders.forEach(order => {
            let newDate = order.requested_delivery_date;

            let newDateExists = dates.includes(newDate);

            if(!newDateExists) {
                dates.push(newDate)
            }
        });

        dates.sort();

        setSalesOrderDates(dates);
    }

    const getSalesOrderDatesFuture = (salesOrders) => {
        let futureSalesOrders = salesOrders.filter((item) => new Date(dayjs(item.requested_delivery_date)) > new Date(dayjs()));

        let futureDates = [];

        futureSalesOrders.forEach(order => {
            let newFutureDate = order.requested_delivery_date;

            let newFutureDateExists = futureDates.includes(newFutureDate);

            if(!newFutureDateExists) {
                futureDates.push(newFutureDate);
            }
        });

        futureDates.sort();

        setSalesOrderDatesFuture(futureDates);
    }

    const handleOpen = () => {
        setOpen(!open)
    }

    const handleClearStatus = () => {
        setSearchStatus('')

        getSalesOrderDatesFuture(filteredSalesOrdersFuture)
    }

    const handleClearStatus1 = () => {
        setSearchStatus1('')

        getSalesOrderDates(filteredSalesOrders)
    }

    const handleClearDate = () => {
        setSearchDate('')

        getSalesOrderStatusesFuture(filteredSalesOrdersFuture)
    }

    const handleClearDate1 = () => {
        setSearchDate1('')

        getSalesOrderStatuses(filteredSalesOrders)
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
                                    <p className='font-bold roboto pl-5 color-fake'>{t('todays_sales_orders')}</p>
                                    <Tooltip title={t('create_new_so')} placement='right'>
                                        <div>
                                            <AddButton className="text-[#336195]" onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className='pr-5'>
                                    <span style={{ transform: 'rotate(45deg)', color: '#336195', fontSize: '22px' }} className="flex items-center justify-center">
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
                                            {salesOrderStatuses.map((status) => (
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
                                            {salesOrderDates.map((date) => (
                                                <MenuItem key={date} value={date}>{date}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                        <div>
                            <DailyBoardTableSales items={filteredSalesOrders} />
                        </div>
                    </div>
                    <div className='p-5 w-full'>
                        <div className='pb-5 shadow-md mb-2 rounded-md'>
                            <div className='flex justify-between items-center gap-4 '>
                                <div className='flex justify-start gap-4 items-center'>
                                    <p className='font-bold roboto pl-5 color-fake'>{t('future_sales_orders')}</p>
                                    <Tooltip title={t('create_new_so')} placement='right'>
                                        <div>
                                            <AddButton className="text-[#336195]" onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className='pr-5'>
                                    <span style={{ transform: 'rotate(45deg)', color: '#336195', fontSize: '22px' }} className="flex items-center justify-center">
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
                                            {salesOrderStatusesFuture.map((status) => (
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
                                            {salesOrderDatesFuture.map((date) => (
                                                <MenuItem key={date} value={date}>{date}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                        <div>
                            <DailyBoardTableSales items={filteredSalesOrdersFuture} />
                        </div>
                    </div>
                </div>
                <CreateSalesOrder open={open} handleOpen={handleOpen} setIsLoading={setIsLoading} />
            </AppLayout>

        </>
    )
}

export default SalesOrder

