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
import Swal from 'sweetalert2'
import Pusher from 'pusher-js'
import { Link } from 'react-router-dom'

import AppLayout from '../../components/Layouts/AppLayout'
import TableShared from '../../components/TableShared'
import Loading from '../../components/Loading'
import { useStateContext } from '../../context/ContextProvider'
import axios from '../../lib/axios'

const Collections = () => {

    const { t } = useTranslation()
    const { choosesite, setChoosesite, config } = useStateContext()


    const [searchStatus, setsearchStatus] = useState('')
    const [searchDate, setsearchDate] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [salesOrderDates, setSalesOrderDates] = useState([])
    const [searchStatuses, setSearchStatuses] = useState([])


    /* filters */
    const [soNumber, setSoNumber] = useState('')
    const [customerNo, setCustomerNo] = useState('')
    const [customerName, setCustomerName] = useState('')




    useEffect(() => {
        setChoosesite(localStorage.getItem('site'))
    }, [])

    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe(`purchaseorder-deleted-site-${localStorage.getItem('site')}`)
        const channelcreate = pusher.subscribe(`purchaseorder-created-site-${localStorage.getItem('site')}`)
        const channelupdate = pusher.subscribe(`purchaseorder-updated-site-${localStorage.getItem('site')}`)

        if (choosesite) {
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
        }
    }, [choosesite])

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
        if (choosesite) {
            getPurchaseOrders()
        }
    }, [choosesite])

    useEffect(() => {
        getPurchaseOrders()
    }, [searchDate, searchStatus])


    const getPurchaseOrders = async () => {
        const date = dayjs(searchDate).format('YYYY-MM-DD')
        await axios.get(`/api/list-orders?type=purchase&site_id=${choosesite}&status_id=${searchStatus}&collected_date=${date}`, config)
            .then(res => {
                const purchaseOrders = res.data
                setPurchaseOrders(purchaseOrders)
                getSalesOrderDates(purchaseOrders)
                getSalesOrderStatuses(purchaseOrders)

            })
    }

    const getSalesOrderDates = (salesOrders) => {

        let dates = [];

        salesOrders.forEach(order => {
            let newFutureDate = order.collected_date;

            let newFutureDateExists = dates.includes(newFutureDate);

            if (!newFutureDateExists) {
                dates.push(newFutureDate);
            }
        });

        dates.sort();

        setSalesOrderDates(dates);
    }

    const getSalesOrderStatuses = (salesOrders) => {
        let statuses = [];

        salesOrders.forEach(order => {
            let newStatus = {
                id: order.po_status_id,
                name: order.po_status_name,
            };

            let newStatusExists = statuses.some(function (status) {
                return status.id === newStatus.id
            });

            if (!newStatusExists) {
                statuses.push(newStatus);
            }
        });

        statuses.sort((a, b) => {
            return a.id - b.id
        });

        setSearchStatuses(statuses);
    }

    const handleClearDate = () => {
        setsearchDate('')

        getSalesOrderDates(purchaseOrders)
    }

    const handleClearStatus = () => {
        setsearchStatus('')

        getSalesOrderStatuses(purchaseOrders)
    }

    const columns = [
        {
            field: 'po_number',
            headerName: t('purchase_order_no'),
            flex: 1
        },
        {
            field: 'vendor_no',
            headerName: t('vendor_no'),
            flex: 1
        },
        {
            field: 'vendor_name',
            headerName: t('vendor_name'),
            flex: 1
        },
        {
            field: 'collected_date',
            headerName: t('collected_date'),
            flex: 1,
            renderCell: (params) => <ShowDate params={params} />
        },
        {
            field: 'po_status_name',
            headerName: t('status'),
            flex: 0.5
        },
        {
            field: 'po_type',
            headerName: t('type'),
            flex: 0.5
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 0.5,
            renderCell: (params) => <PurchaseOrderAction params={params} setIsLoading={setIsLoading} config={config} getPurchaseOrders={getPurchaseOrders} />
        }
    ]

    const items = purchaseOrders?.filter(data => {
        if (soNumber === null)
            return data
        if (data.po_number?.toLocaleLowerCase().includes(soNumber.toLocaleLowerCase()))
            return data
    })

    const filtered = items?.filter(data => {
        if (customerNo === null)
            return data
        if (data.vendor_no?.toLocaleLowerCase().includes(customerNo.toLocaleLowerCase()))
            return data
    })

    const reFiltered = filtered.filter(data => {
        if (customerName === null)
            return data
        if (data.vendor_name?.toLocaleLowerCase().includes(customerName.toLocaleLowerCase()))
            return data
    })

    return (
        <>
            {isLoading ? <Loading /> : ''}
            <AppLayout>
                <div className='flex justify-between'>
                    <div className='p-5 w-full'>
                        <div className='pb-5 shadow-md mb-2 rounded-md'>
                            <div className='flex justify-between items-center'>
                                <div className='flex justify-start gap-4 items-center'>
                                    <p className='font-bold roboto pl-5 color-fake'>{t('collections')}</p>
                                </div>
                            </div>
                            <div className='flex justify-between items-end w-full'>
                                <div className='px-5 pt-5 w-full'>
                                    <div className='flex justify-between items-center search'>
                                        <input type="text" placeholder={t('search_by_purchase_no')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setSoNumber(e.target.value)} />
                                        <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                    </div>
                                </div>
                                <div className='px-5 pt-5 w-full'>
                                    <div className='flex justify-between items-center search'>
                                        <input type="text" placeholder={t('search_by_vendor_no')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setCustomerNo(e.target.value)} />
                                        <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                    </div>
                                </div>
                                <div className='px-5 pt-5 w-full'>
                                    <div className='flex justify-between items-center search'>
                                        <input type="text" placeholder={t('search_by_vendor_name')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setCustomerName(e.target.value)} />
                                        <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                    </div>
                                </div>
                                <div className='px-5 pt-5 w-full'>
                                    <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('search_by_status')}</InputLabel>
                                        <Select
                                            value={searchStatus}
                                            onChange={e => setsearchStatus(e.target.value)}
                                            label="Search role"
                                            sx={{ ".MuiSelect-iconStandard": { display: searchStatus ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                            endAdornment={searchStatus ? (<IconButton sx={{ visibility: searchStatus ? "visible" : "hidden", padding: '0' }} onClick={handleClearStatus}><ClearIcon /></IconButton>) : false}
                                        >
                                            {searchStatuses.map((status) => (
                                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className='px-5 pt-5 w-full'>
                                    <FormControl variant="standard" sx={{ width: 'inherit' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('search_by_request_collection_date')}</InputLabel>
                                        <Select
                                            value={searchDate}
                                            onChange={e => setsearchDate(e.target.value)}
                                            label="Search Past Or Present Date"
                                            sx={{ ".MuiSelect-iconStandard": { display: searchDate ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                            endAdornment={searchDate ? (<IconButton sx={{ visibility: searchDate ? "visible" : "hidden", padding: '0' }} onClick={handleClearDate}><ClearIcon /></IconButton>) : false}
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
                            <TableShared columns={columns} items={reFiltered} />
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    )
}

export default Collections


const PurchaseOrderAction = (params) => {

    const { t } = useTranslation()
    const [openUpdate, setOpenUpdate] = useState(false)

    const handleOpenUpdate = () => {
        setOpenUpdate(!openUpdate)
        localStorage.setItem('prevStatusPurchase', params.params.row.po_status_id)
    }

    const deleteCollection = async () => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_purchaseOrder') + params.params.row.po_number + "?",
            text: t('text_delete'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t('confirmButtonText_delete'),
            cancelButtonText: t('cancel')
        }).then((result) => {
            return result.isConfirmed
        })

        if (!isConfirm) {
            return
        }
        await axios.delete(`/api/purchase-orders/${params.params.row.id}`, params.config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
        }).catch(({ response: { data } }) => {
            Swal.fire({
                text: data.message,
                icon: "error"
            })
        })
    }

    return (
        <>
            <div className='flex justify-between'>
                <Tooltip title="BOL/POD" placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <a href={process.env.REACT_APP_BACKEND_URL + `/api/purchase-orders/${params.params.row.id}/proof-of-delivery`} target="_blank"><span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200"><i className="fa-solid fa-print"></i></span></a>
                    </div>
                </Tooltip>

                {params.params.row.po_status_id === 1 || params.params.row.po_status_id === 3 ?
                    (<Tooltip title={t('update')} placement='top'>
                        <div style={{ color: 'rgba(0,0,0,.54)' }}>
                            <Link to={`/purchase-order/${params.params.row.id}`}><span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={handleOpenUpdate}><i className="fa-solid fa-pencil"></i></span></Link>
                        </div>
                    </Tooltip>)
                    :
                    (<Tooltip title={t('open')} placement='top'>
                        <div style={{ color: 'rgba(0,0,0,.54)' }}>
                            <Link to={`/purchase-order/${params.params.row.id}`}><span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={handleOpenUpdate}><i className="fa-solid fa-eye"></i></span></Link>
                        </div>
                    </Tooltip>)
                }

                <Tooltip title={t('delete')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={deleteCollection}><i className="fa-solid fa-trash"></i></span>
                    </div>
                </Tooltip>
            </div>
        </>
    )
}

const ShowDate = (params) => {

    return (
        <div>
            <p>{dayjs(params.params.row.collected_date).format("YYYY-MM-DD")}</p>
        </div>
    )
}
