import React, { useState, useEffect, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { Box, TextField, FormControl, MenuItem, Select, Tooltip, Button, Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom'
import Pusher from 'pusher-js'

import { useAuth } from '../../hooks/auth'
import { useStateContext } from '../../context/ContextProvider'
import axios from '../../lib/axios'
import TableShared from '../TableShared'
import AddButton from '../AddButton'
import AddSalesOrderItem from './AddSalesOrderItem'
import Loading from '../Loading'

const EditSalesOrder = () => {

    const { t } = useTranslation()
    const { config, setCompany_id, setChoosesite, configFile } = useStateContext()
    const params = useParams()
    const { user } = useAuth({ middleware: 'guest' })

    /* state */
    const [salesOrder, setSalesOrder] = useState([])
    const [shipToLocations, setShipToLocation] = useState([])
    const [salesOrderItems, setSalesOrderItems] = useState([])
    const [openSalesOrderItem, setOpenSalesOrderItem] = useState(false)
    const [disabled, setDisabled] = useState(true)
    const [disabledFields, setDisabledFields] = useState(false)
    const [totalPrice, setTotalPrice] = useState(0)
    const [totalQty, setTotalQty] = useState(0)
    const [value, setValue] = useState("1")
    const [prevStatus, setPrevStatus] = useState('')
    const [blocked, setBlocked] = useState(false)

    /* form */
    const [customer, setCustomer] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [shipToCode, setShipToCode] = useState('')
    const [address, setAddress] = useState('')
    const [zip, setZip] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [requestedDeliveryDate, setRequestedDeliveryDate] = useState(dayjs())
    const [shippedDate, setShippedDate] = useState(dayjs())
    const [customerPoNo, setCustomerPoNo] = useState('')
    const [pickupTrailerNo, setPickupTrailerNo] = useState('')
    const [dropTrailerNo, setDropTrailerNo] = useState('')
    const [status, setStatus] = useState('')
    const [comments, setComments] = useState('')
    const [file, setFile] = useState('')
    const inputRef = useRef(null)
    const [isLoading, setIsLoading] = useState(false)
    const [SCItems, setSCItems] = useState([])

    /* documents */
    const [orderDocuments, setOrderDocuments] = useState([])

    useEffect(() => {
        getSalesOrder(params.id)
    }, [params.id])

    useEffect(() => {
        if (SCItems.length > 0) {
            handleNewItem(SCItems)
        }
    }, [SCItems])

    const handleNewItem = (e) => {
        e.map((item) => {
            let new_item = {
                "id": item.id,
                "item_no": item.item_no,
                "description": item.description,
                "qty_ordered": 0,
                "qty_to_ship": 0,
                "qty_shipped": 0,
                "qty_loaded": 0,
                "unit_price": item.unit_price,
                "total_cost": 0,
                "unit_id": item.item_id
            }

            setSalesOrderItems((prev) => [...prev, new_item])
        })
    }


    const getSalesOrder = async (id) => {
        setIsLoading(true)
        await axios.get(`/api/sales-orders/${id}`, config)
            .then(res => {
                const salesOrder = res.data
                setStatus(salesOrder.so_status_id)
                setPrevStatus(salesOrder.prev_status_id || '')
                setCustomer(salesOrder.customer_id)
                setCustomerName(salesOrder.customer_name)
                setDropTrailerNo(salesOrder.drop_trailer_no || '')
                setPickupTrailerNo(salesOrder.pickup_trailer_no || '')
                setCustomerPoNo(salesOrder.customer_po_no)
                setRequestedDeliveryDate(dayjs(salesOrder.requested_delivery_date))
                setShippedDate(dayjs(salesOrder.shippment_date))
                setSalesOrderItems(salesOrder.sales_order_items)
                setComments(salesOrder.comments || '')
                setSalesOrder(salesOrder)
                setIsLoading(false)
            })
    }

    /* UseEffect */
    useEffect(() => {
        setCompany_id(localStorage.getItem('company_id'))
        setChoosesite(localStorage.getItem('site'))
        getDocs()
    }, [])

    useEffect(() => {
        if (status === 1 || status === 3) {
            setDisabledFields(false)
        } else {
            setDisabledFields(true)
        }
    }, [status])



    useEffect(() => {
        loadShipToLocation()
    }, [shipToLocations])

    useEffect(() => {
        if (customer) {
            getShipToLocations(customer)
        }
    }, [customer])

    useEffect(() => {
        handleTotalPrice()
        handleTotalQty()
    }, [salesOrderItems, params])

    useEffect(() => {
        const items = salesOrderItems.filter((item) => item.qty_ordered !== "")

        if (items) {
            const sum = items.reduce((accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue.qty_ordered), 0);
            if (sum > 0) {
                setBlocked(false)
            }
            else setBlocked(true)
        }

    }, [salesOrderItems])



    /* useEffect(() => {
        setSalesOrderItems([])
        if (shipToLocations.length > 0 && customer && shipToCode) {
            getSalesContractItems()
        }
    }, [shipToCode]) */



    /* Handlers */

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const handleTotalPrice = () => {
        const sum = salesOrderItems.reduce((accumulator, currentValue) => parseFloat(accumulator) + parseFloat(currentValue.total_cost), 0);
        setTotalPrice(sum);
    }

    const handleTotalQty = () => {
        //proci kroz sales iteme i vidjeti ima li koji qty == "" ako ima skip
        const item = salesOrderItems.filter((item) => item.qty_ordered !== "")
        if (item) {
            const sum = item.reduce((accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue.qty_ordered), 0);
            setTotalQty(sum)
        } else {
            setTotalQty(0)
        }
    }


    const handleCustomerPoNo = (e) => {
        const limit = 50
        setCustomerPoNo(e.target.value.slice(0, limit))
    }

    const loadShipToLocation = () => {
        const item = shipToLocations?.find(item => item.id === shipToCode)
        setAddress(item?.address)
        setZip(item?.zip)
        setCity(item?.city)
        setState(item?.state)
    }

    const handleShipToLocation = (e) => {
        setShipToCode(e.target.value)
        const item = shipToLocations.find(item => item.id === e.target.value)
        setAddress(item.address)
        setZip(item.zip)
        setCity(item.city)
        setState(item.state)
    }

    const handleUpdateItem = (id, quantity, unit_price) => {
        const salesOrderItemsCopy = [...salesOrderItems]
        const item = salesOrderItemsCopy.find(item => item.id === id)

        item.qty_ordered = quantity
        item.qty_to_ship = quantity
        item.unit_price = unit_price
        item.total_cost = quantity * unit_price

        setSalesOrderItems(salesOrderItemsCopy)
    }

    const handleOpenSalesOrderItem = () => {
        setDisabled(true)
        setOpenSalesOrderItem(!openSalesOrderItem)
    }

    const handleUploadClick = () => {
        inputRef.current?.click()
    }


    const getDocs = async () => {
        await axios.get(`/api/order-documents?order_id=${params.id}`, config)
            .then(res => {
                const files = res.data
                setOrderDocuments(files)
            })
    }

    const deleteDocs = async (id, name) => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_docs') + name + "?",
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
        await axios.delete(`/api/order-documents/${id}`, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            getDocs()
        }).catch(({ response: { data } }) => {
            Swal.fire({
                text: data.message,
                icon: "error"
            })
        })
    }

    const handleFileChange = async (e, type) => {
        if (!e.target.files) {
            return;
        }
        setFile(e.target.files[0]);

        setIsLoading(true)

        // 🚩 do the file upload here normally...
        const formData = new FormData()

        formData.append('file', e.target.files[0])
        formData.append('order_id', params.id)
        formData.append('order_type', 'sales')
        formData.append('document_type', type)

        await axios.post(`/api/store-documents`, formData, configFile).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.message
            })
            inputRef.current.value = ""
            setIsLoading(false)
        }).catch(({ response }) => {
            Swal.fire({
                text: response.data.message,
                icon: "error"
            })
            setIsLoading(false)
        })

        getDocs()
    }


    const getShipToLocations = async (id) => {
        await axios.get(`/api/ship-addresses?customer_id=${id}`, config)
            .then(res => {
                const shipToLocations = res.data
                setShipToLocation(shipToLocations)
            })
        setShipToCode(salesOrder.ship_address_id)
    }

    const updateReopenStatus = async (e) => {
        e.preventDefault()
        setDisabledFields(false)
        setStatus(3)
        setIsLoading(true)

        const formData = {}

        formData['customer_id'] = customer
        formData['ship_address_id'] = shipToCode
        formData['drop_trailer_no'] = dropTrailerNo
        formData['pickup_trailer_no'] = pickupTrailerNo
        formData['customer_po_no'] = customerPoNo
        formData['requested_delivery_date'] = dayjs(requestedDeliveryDate).format('YYYY-MM-DD HH:mm:ss')
        formData['shippment_date'] = dayjs(shippedDate).format('YYYY-MM-DD HH:mm:ss')
        formData['site_id'] = salesOrder.site_id
        formData['sales_order_items'] = salesOrderItems
        formData['so_status_id'] = 3
        formData['prev_status_id'] = status
        formData['so_number'] = salesOrder.so_number
        formData['comments'] = comments


        await axios.put(`/api/sales-orders/${params.id}`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setIsLoading(false)
            getSalesOrder(params.id)
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

    const updateReleaseStatus = async (e) => {
        setIsLoading(true)
        e.preventDefault()
        setDisabledFields(true)
        if (prevStatus > 3) {
            setStatus(prevStatus)
        } else setStatus(2)

        const formData = {}


        formData['customer_id'] = customer
        formData['ship_address_id'] = shipToCode
        formData['drop_trailer_no'] = dropTrailerNo
        formData['pickup_trailer_no'] = pickupTrailerNo
        formData['customer_po_no'] = customerPoNo
        formData['requested_delivery_date'] = dayjs(requestedDeliveryDate).format('YYYY-MM-DD HH:mm:ss')
        formData['shippment_date'] = dayjs(shippedDate).format('YYYY-MM-DD HH:mm:ss')
        formData['site_id'] = salesOrder.site_id
        formData['sales_order_items'] = salesOrderItems
        formData['so_status_id'] = prevStatus > 3 ? prevStatus : 2
        formData['prev_status_id'] = null
        formData['so_number'] = salesOrder.so_number
        formData['comments'] = comments


        await axios.put(`/api/sales-orders/${params.id}`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setIsLoading(false)
            getSalesOrder(params.id)
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

    const updateSalesOrder = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = {}

        formData['customer_id'] = customer
        formData['ship_address_id'] = shipToCode
        formData['drop_trailer_no'] = dropTrailerNo
        formData['pickup_trailer_no'] = pickupTrailerNo
        formData['customer_po_no'] = customerPoNo
        formData['requested_delivery_date'] = dayjs(requestedDeliveryDate).format('YYYY-MM-DD HH:mm:ss')
        formData['shippment_date'] = dayjs(shippedDate).format('YYYY-MM-DD HH:mm:ss')
        formData['site_id'] = salesOrder.site_id
        formData['sales_order_items'] = salesOrderItems
        formData['so_status_id'] = status
        formData['so_number'] = salesOrder.so_number
        formData['comments'] = comments



        await axios.put(`/api/sales-orders/${params.id}`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setIsLoading(false)
            getSalesOrder(params.id)
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

    const setStatusToLoading = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = {}

        formData['so_status_id'] = 5

        await axios.put(`/api/sales-orders/${params.id}/change-status`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setIsLoading(false)
            getSalesOrder(params.id)
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

    const setStatusToLoaded = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = {}

        formData['so_status_id'] = 6

        await axios.put(`/api/sales-orders/${params.id}/change-status`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setIsLoading(false)
            getSalesOrder(params.id)
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


    const handleUpdateItemQTY = (id, quantity) => {
        const purchaseOrderItemsCopy = [...salesOrderItems]
        const item = purchaseOrderItemsCopy.find(item => item.id === id)

        item.qty_ordered = quantity
        item.qty_to_ship = quantity


        setSalesOrderItems(purchaseOrderItemsCopy)
    }

    const columns = [
        {
            field: 'item_no',
            headerName: t('no'),
            flex: 0.5
        },
        {
            field: 'description',
            headerName: t('description'),
            flex: 1
        },
        {
            field: 'qty_ordered',
            headerName: t('quantity_ordered'),
            flex: 1,
            renderCell: (params) => <HandleQty params={params} handler={handleUpdateItem} handlerQTR={handleUpdateItemQTY} disabled={disabledFields} />
        },
        {
            field: 'qty_to_ship',
            headerName: t('quantity_to_ship'),
            flex: 1,
            renderCell: (params) => <HandleQtyShip params={params} disabled={disabledFields} />
        },
        {
            field: 'qty_shipped',
            headerName: t('quantity_shipped'),
            flex: 1,
        },
        {
            field: 'unit_price',
            headerName: t('unit_price'),
            flex: 1
        },
        {
            field: 'total_cost',
            headerName: t('total'),
            flex: 1,
            renderCell: (params) => <HandleTotal params={params} />
        },
    ]

    const orderDocumentsFiltered = orderDocuments?.filter(data => {
        if (data.document_type?.toLocaleLowerCase().includes('order_document'))
            return data
    })


    const loadSheetFiltered = orderDocuments?.filter(data => {
        if (data.document_type?.toLocaleLowerCase().includes('load_sheet'))
            return data
    })

    return (
        <>
            {isLoading ? <Loading /> : ''}
            <Box>
                <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                    <div className='flex gap-4 items-baseline'>
                        <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                            <Link to="/sales-order"><i className="fa-solid fa-plus"></i></Link>
                        </div>
                        <p className='text-xl roboto font-semibold text-white'>{t('update_so')} - {salesOrder.so_number} </p>
                    </div>
                    <div>
                        <button type="button" disabled={disabledFields} onClick={updateSalesOrder} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-[hsla(0,0%,100%,.12)]'>
                            {t('update')}
                        </button>
                        {
                            (status === 1 || status === 3) ?
                                <button type="button" onClick={updateReleaseStatus} disabled={blocked} className='text-white px-4 py-6 uppercase self-end roboto bg-[#4caf50] disabled:bg-[hsla(0,0%,100%,.12)]'>
                                    <i className="fa-solid fa-check"></i> {t('release')}
                                </button>
                                :
                                <button type="button" onClick={updateReopenStatus} className='text-white px-4 py-6 uppercase self-end roboto bg-[#fb8c00] disabled:bg-zinc-400'>
                                    <i className="fa-solid fa-arrow-rotate-left"></i> {t('reopen')}
                                </button>
                        }
                    </div>
                </div>
                <div className='p-5 flex justify-between gap-3'>
                    <div className='p-2 shadow-md mb-2 rounded-md w-full h-fit'>
                        {/* Address */}
                        <div className='w-full flex p-3'>
                            <div className='w-1/2'>Status:</div>
                            <div className='w-1/2 flex gap-3'>
                                {salesOrder.so_status_name}
                                {
                                    user.role === 'master_admin' ?
                                        salesOrder.so_status_id === 4 ? <Tooltip title={t('change_status_loading')}><button /* disabled={disabledFields} */ onClick={e => setStatusToLoading(e)} className='ml-5 disabled:text-zinc-400'><i className="fa-solid fa-truck-arrow-right"></i></button></Tooltip> : ''
                                        :
                                        ''
                                }
                                {
                                    user.role === 'master_admin' ?
                                        salesOrder.so_status_id === 5 ? <Tooltip title={t('change_status_loaded')}><button /* disabled={disabledFields} */ onClick={e => setStatusToLoaded(e)} className='ml-5 disabled:text-zinc-400'><i className="fa-solid fa-truck"></i></button></Tooltip> : ''
                                        :
                                        ''
                                }
                            </div>
                        </div>
                        {/* Customer */}
                        <div className='w-full flex p-3 bg-[#e0e0e0]'>
                            <div className='w-1/2'>{t('customer')}: <span className='text-red-500'>*</span></div>
                            <div className='w-1/2'>
                                <TextField type="text" disabled variant='standard' className='w-full' name="drop_trailer_no" value={customerName} />
                            </div>
                        </div>
                        {/* Ship to code */}
                        <div className='w-full flex p-3'>
                            <div className='w-1/2'>{t('shipToAdd')}:</div>
                            <div className='w-1/2'>
                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                    <Select value={shipToCode} onChange={(e) => { handleShipToLocation(e) }} disabled>
                                        {shipToLocations?.map((item, index) => <MenuItem key={index} value={item.id}>{item.code} - {item.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        {/* Address */}
                        <div className='w-full flex p-3 bg-[#e0e0e0]'>
                            <div className='w-1/2'></div>
                            <div className='w-1/2'>{address}</div>
                        </div>
                        {/* Zip, City, State */}
                        <div className='w-full flex p-3'>
                            <div className='w-1/2'></div>
                            {shipToCode ? <div className='w-1/2'>{zip} {city}, {state}</div> : <div className='w-1/2'></div>}
                        </div>
                        {/* Drop Trailer No. */}
                        <div className='w-full flex p-3 bg-[#e0e0e0]'>
                            <div className='w-1/2'>{t('drop_trailer_no')}</div>
                            <div className='w-1/2'>
                                <TextField type="text" disabled={disabledFields} variant='standard' className='w-full' name="drop_trailer_no" value={dropTrailerNo} onChange={(e) => { setDropTrailerNo(e.target.value) }} />
                            </div>
                        </div>
                        {/* Pickup Trailer No. */}
                        <div className='w-full flex p-3'>
                            <div className='w-1/2'>{t('pickup_trailer_no')}</div>
                            <div className='w-1/2'>
                                <TextField type="text" disabled={disabledFields} variant='standard' className='w-full' name="pickup_trailer_no" value={pickupTrailerNo} onChange={(e) => { setPickupTrailerNo(e.target.value) }} />
                            </div>
                        </div>
                        {/* Customer PO No. */}
                        <div className='w-full flex p-3 bg-[#e0e0e0]'>
                            <div className='w-1/2'>{t('customer_po_no')} <span className='text-red-500'>*</span></div>
                            <div className='w-1/2'>
                                <TextField type="text" disabled={disabledFields} variant='standard' className='w-full' name="customer_po_no" value={customerPoNo} onChange={(e) => { handleCustomerPoNo(e) }} />
                                <p className='text-xs italic roboto text-slate-500 pt-1'><i className="fa-solid fa-circle-info"></i> The maximum charachter limit is 50.</p>
                            </div>
                        </div>
                        {/* Requested Delivery Date */}
                        <div className='w-full flex p-3'>
                            <div className='w-1/2'>{t('requested_delivery_date')}:</div>
                            <div className='w-1/2'>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <MobileDatePicker disabled={disabledFields} sx={{ width: '100%' }} format="YYYY-MM-DD" slotProps={{ textField: { variant: 'standard' } }} value={requestedDeliveryDate} onChange={(newValue) => setRequestedDeliveryDate(newValue)} />
                                </LocalizationProvider>
                            </div>
                        </div>
                        {/* Shippment Date */}
                        <div className='w-full flex p-3 bg-[#e0e0e0]'>
                            <div className='w-1/2'>{t('shipment_date')}:</div>
                            <div className='w-1/2'>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <MobileDatePicker disabled={disabledFields} sx={{ width: '100%' }} format="YYYY-MM-DD" slotProps={{ textField: { variant: 'standard' } }} value={shippedDate} onChange={(newValue) => setShippedDate(newValue)} />
                                </LocalizationProvider>
                            </div>
                        </div>
                    </div>
                    <div className='w-full'>
                        <div className='p-2 shadow-md mb-2 rounded-md w-full'>
                            <div className='flex justify-start items-center gap-4 '>
                                <p className='font-bold roboto color-fake ml-5'>{t('salesOrderitems')}</p>
                                <Tooltip title={t('addsalesOrderitems')} placement='right'>
                                    <div>
                                        <AddButton className="text-[#336195]" disabled={disabledFields} onClick={handleOpenSalesOrderItem}><i className="fa-solid fa-plus text-[#336195]"></i></AddButton>
                                    </div>
                                </Tooltip>
                            </div>
                            <div className='p-5 pt-15'>
                                <div className='flex justify-between font-bold'>
                                    <p>{t('totalPrice')}</p>
                                    <p>{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className='flex justify-between font-bold'>
                                    <p>{t('totalQty')}</p>
                                    <p>{totalQty}</p>
                                </div>
                            </div>
                            <div>
                                <TableShared columns={columns} items={salesOrderItems} />
                            </div>
                        </div>
                        <div className='w-full'>
                            <div className='p-5 shadow-md mb-2 rounded-md'>
                                <div className='flex justify-between items-center gap-4 pb-5'>
                                    <div className='flex justify-start gap-4 items-center'>
                                        <p className='font-bold roboto color-fake'>{t('comments')}</p>
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <TextField
                                        label={t('enter_comments')}
                                        multiline
                                        disabled={disabledFields}
                                        rows={3}
                                        variant="filled"
                                        value={comments}
                                        onChange={e => setComments(e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='w-full'>
                            <div className='p-5 shadow-md mb-2 rounded-md'>
                                <div className='flex justify-between items-center gap-4 pb-5'>
                                    <div className='flex justify-start gap-4 items-center'>
                                        <p className='font-bold roboto color-fake'>{t('documents')}</p>
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <TabContext value={value}>
                                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                                <Tab sx={{ textTransform: 'none' }} value="1" label={t('order_documents')} />
                                                <Tab sx={{ textTransform: 'none' }} value="2" label={t('proof_of_delivery')} />
                                                <Tab sx={{ textTransform: 'none' }} value="3" label={t('load_sheet')} />
                                            </TabList>
                                        </Box>
                                        <TabPanel value="1">
                                            <Button onClick={handleUploadClick} disabled={disabledFields} variant="contained" component="label" sx={{ backgroundColor: '#607d8b', "&:hover": { backgroundColor: '#6c8794' } }}>
                                                <div className='flex items-center gap-2'><p>UPLOAD</p> <i className="fa-solid fa-cloud-arrow-up"></i></div>
                                            </Button>
                                            <input hidden type="file" name="fileUpload" ref={inputRef} onChange={e => handleFileChange(e, 'order_document')} />
                                            <>
                                                {
                                                    orderDocumentsFiltered?.map((item, index) => (

                                                        <div className='pt-5 flex justify-between' key={index}>
                                                            <p className='text-blue-900 underline' >{item.document_name}</p>
                                                            <div className='flex gap-2'>
                                                                <a href={item.document_url} target="_blank" download><button className='text-neutral-500'><Tooltip title={t('View')} placement='top'><i className="fa-solid fa-eye"></i></Tooltip></button></a>
                                                                <button disabled={disabledFields} className='text-neutral-500' onClick={e => deleteDocs(item.id, item.document_name)}><Tooltip title={t('delete')} placement='top'><i className="fa-solid fa-trash"></i></Tooltip></button>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </>
                                        </TabPanel>

                                        <TabPanel value="2">

                                            <div className='pt-5 flex justify-between'>
                                                <p className='text-blue-900 underline' ><a href={process.env.REACT_APP_BACKEND_URL + `/api/sales-orders/${params.id}/proof-of-delivery`} target="_blank"><span className="text-[#336195]" style={{ cursor: 'pointer' }}>{t('proof_of_delivery')}</span></a></p>
                                                <div className='flex gap-2'>
                                                    <a href={process.env.REACT_APP_BACKEND_URL + `/api/sales-orders/${params.id}/proof-of-delivery`} target="_blank" download><button className='text-neutral-500'><Tooltip title={t('View PoD')} placement='top'><i className="fa-solid fa-eye"></i></Tooltip></button></a>
                                                    <a href={process.env.REACT_APP_BACKEND_URL + `/api/sales-orders/${params.id}/proof-of-delivery-download`} target="_blank" download><button className='text-neutral-500'><Tooltip title={t('Download PoD')} placement='top'><i className="fa-solid fa-download"></i></Tooltip></button></a>
                                                </div>
                                            </div>

                                        </TabPanel>
                                        <TabPanel value="3">
                                            <div className='pt-5 flex justify-between'>
                                                <p className='text-blue-900 underline' ><a href={process.env.REACT_APP_BACKEND_URL + `/api/sales-orders/${params.id}/load-sheet`} target="_blank"><span className="text-[#336195]" style={{ cursor: 'pointer' }}>{t('load_sheet')}</span></a></p>
                                                <div className='flex gap-2'>
                                                    <a href={process.env.REACT_APP_BACKEND_URL + `/api/sales-orders/${params.id}/load-sheet`} target="_blank" download><button className='text-neutral-500'><Tooltip title={t('View Load Sheet')} placement='right'><i className="fa-solid fa-eye"></i></Tooltip></button></a>
                                                    <a href={process.env.REACT_APP_BACKEND_URL + `/api/sales-orders/${params.id}/load-sheet-download`} target="_blank" download><button className='text-neutral-500'><Tooltip title={t('Download Load Sheet')} placement='top'><i className="fa-solid fa-download"></i></Tooltip></button></a>
                                                </div>
                                            </div>
                                        </TabPanel>
                                    </TabContext>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Box>
            <AddSalesOrderItem open={openSalesOrderItem} handleOpen={handleOpenSalesOrderItem} salesOrderItems={salesOrderItems} setSalesOrderItems={setSalesOrderItems} disabled={disabled} setDisabled={setDisabled} />
        </>
    )
}

export default EditSalesOrder


const HandleQty = ({ params, handler, disabled, handlerQTR }) => {

    const [qty, setQty] = useState(params.value)

    const handleZero = (e) => {
        if (e.target.value === "") {
            setQty(0)

            handler(
                params.row.id,
                0,
                params.row.unit_price
            )
        }
    }

    const deleteZero = (e) => {
        if (qty == 0) {
            setQty('')
        }
    }

    const handleQuantity = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty(0)
            else {
                if (e.target.value < params.row.qty_to_ship) {
                    setQty(e.target.value)

                    handlerQTR(
                        params.row.id,
                        e.target.value
                    )
                    handler(
                        params.row.id,
                        e.target.value,
                        params.row.unit_price
                    )
                } else {
                    setQty(e.target.value)

                    handler(
                        params.row.id,
                        e.target.value,
                        params.row.unit_price
                    )
                }
            }

        }
    }

    return (
        <TextField type="text" variant='standard' disabled={disabled} className='w-2/3 mb-5 px-0 pt-0' name="qty" value={qty} onChange={(e) => { handleQuantity(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />
    )

}

const HandleQtyShip = ({ params, disabled }) => {

    const [qty, setQty] = useState(params.value)
    const { t } = useTranslation()

    const handleZero = (e) => {
        if (e.target.value === "") {
            setQty(0)
        }
    }

    const deleteZero = (e) => {
        if (qty == 0) {
            setQty('')
        }
    }

    useEffect(() => {
        setQty(params.value)
    }, [params.row.qty_ordered])

    const handleQuantity = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty(0)
            else {
                if (e.target.value > params.row.qty_ordered) {
                    setQty(params.row.qty_ordered)
                    Swal.fire(
                        '',
                        t('warningSalesOrder'),
                        'warning'
                    )
                }
                else setQty(e.target.value)
            }
        }
    }

    return (
        <TextField type="text" disabled={disabled} variant='standard' className='w-2/3 mb-5 px-0 pt-0' name="qty" value={qty} onChange={(e) => { handleQuantity(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />
    )

}


const HandleTotal = (params) => {

    const [total, setTotal] = useState(params.params.value)

    useEffect(() => {
        setTotal(params.params.row.qty_ordered * params.params.row.unit_price)
    }, [params])

    return (
        <>{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
    )

}
