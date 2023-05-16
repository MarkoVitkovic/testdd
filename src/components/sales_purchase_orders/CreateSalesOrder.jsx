import React, { useState, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { Box, Modal, TextField, FormControl, MenuItem, Select, Tooltip } from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom";

import style from '../../styles/style'
import { useStateContext } from '../../context/ContextProvider'
import axios from '../../lib/axios'
import TableShared from '../TableShared'
import AddButton from '../AddButton'
import AddSalesOrderItem from './AddSalesOrderItem'

const CreateSalesOrder = ({ open, handleOpen, setIsLoading }) => {

    const { t } = useTranslation()
    const { company_id, config, setCompany_id, choosesite, setChoosesite } = useStateContext()
    const navigate = useNavigate();


    /* state */
    const [customers, setCustomers] = useState([])
    const [shipToLocations, setShipToLocation] = useState([])
    const [salesOrderItems, setSalesOrderItems] = useState([])
    const [openSalesOrderItem, setOpenSalesOrderItem] = useState(false)
    const [disabled, setDisabled] = useState(true)
    const [totalPrice, setTotalPrice] = useState(0)
    const [totalQty, setTotalQty] = useState(0)
    const [disabledButton, setDisabledButton] = useState(true)

    /* form */
    const [customer, setCustomer] = useState('')
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
    const [comments, setComments] = useState('')
    const [SCItems, setSCItems] = useState([])


    /* UseEffect */
    useEffect(() => {
        setCompany_id(localStorage.getItem('company_id'))
        setChoosesite(localStorage.getItem('site'))
    }, [])

    useEffect(() => {
        getCustomers(company_id)
    }, [company_id])

    useEffect(() => {
        getShipToLocations(customer)
        setSalesOrderItems([])
    }, [customer])

    useEffect(() => {
        setSalesOrderItems([])
        if (shipToLocations.length > 0 && customer && shipToCode) {
            getSalesContractItems()
        }
    }, [shipToCode])

    useEffect(() => {
        if (SCItems.length > 0) {
            handleNewItem(SCItems)
        }
    }, [SCItems])

    useEffect(() => {
        handleTotalPrice()
        handleTotalQty()
    }, [salesOrderItems])


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

    /* Handlers */

    const handleTotalPrice = () => {
        const sum = salesOrderItems.reduce((accumulator, currentValue) => parseFloat(accumulator) + parseFloat(currentValue.total_cost), 0);
        setTotalPrice(sum);
    }

    const handleTotalQty = () => {
        const item = salesOrderItems.filter((item) => item.qty_ordered !== "")
        if (item) {
            const sum = item.reduce((accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue.qty_ordered), 0);
            setTotalQty(sum)
        } else {
            setTotalQty(0)
        }
    }

    const handleToogleModal = () => {
        setCustomer('')
        setShipToCode('')
        setDropTrailerNo('')
        setPickupTrailerNo('')
        setCustomerPoNo('')
        setRequestedDeliveryDate(dayjs())
        setShippedDate(dayjs())
        setSalesOrderItems([])
        handleOpen()
        setDisabledButton(true)
    }


    const handleCustomerPoNo = (e) => {
        const limit = 50;
        setCustomerPoNo(e.target.value.slice(0, limit));
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

    const handleUpdateItemQTY = (id, quantity) => {
        const purchaseOrderItemsCopy = [...salesOrderItems]
        const item = purchaseOrderItemsCopy.find(item => item.id === id)

        item.qty_ordered = quantity
        item.qty_to_ship = quantity


        setSalesOrderItems(purchaseOrderItemsCopy)
    }

    const handleOpenSalesOrderItem = () => {
        setDisabled(true)
        setOpenSalesOrderItem(!openSalesOrderItem)
    }


    /* API Requests */

    const getSalesContractItems = async () => {
        await axios.get(`/api/sales-contracts?customer_id=${customer}&ship_address_id=${shipToCode}`, config)
            .then(res => {
                const items = res.data
                setSCItems(items[0]?.sales_contract_items || [])
            })
    }

    const getCustomers = async (id) => {
        setCustomer('')
        await axios.get(`/api/customers?company_id=${id}`, config)
            .then(res => {
                const customers = res.data
                setCustomers(customers)
            })
    }

    const getShipToLocations = async (id) => {
        setShipToCode('')
        setAddress('')
        setZip('')
        setCity('')
        setState('')
        await axios.get(`/api/ship-addresses?customer_id=${id}`, config)
            .then(res => {
                const shipToLocations = res.data
                setShipToLocation(shipToLocations)
                setShipToCode(shipToLocations[0]?.id || '')
                setAddress(shipToLocations[0]?.address || '')
                setZip(shipToLocations[0]?.zip || '')
                setCity(shipToLocations[0]?.city || '')
                setState(shipToLocations[0]?.state || '')
            })


    }

    const createSalesOrder = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const formData = {}

        formData['customer_id'] = customer
        formData['ship_address_id'] = shipToCode
        formData['drop_trailer_no'] = dropTrailerNo
        formData['pickup_trailer_no'] = pickupTrailerNo
        formData['customer_po_no'] = customerPoNo
        formData['requested_delivery_date'] = dayjs(requestedDeliveryDate).format('YYYY-MM-DD HH:mm:ss')
        formData['shippment_date'] = dayjs(shippedDate).format('YYYY-MM-DD HH:mm:ss')
        formData['site_id'] = choosesite
        formData['sales_order_items'] = salesOrderItems
        formData['so_status_id'] = 1
        formData['comments'] = comments


        await axios.post(`/api/sales-orders`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })

            navigate("/sales-order/" + data.success.created.id)

            setCustomer('')
            setShipToCode('')
            setDropTrailerNo('')
            setPickupTrailerNo('')
            setCustomerPoNo('')
            setComments('')
            setRequestedDeliveryDate(dayjs())
            setShippedDate(dayjs())
            setSalesOrderItems([])

            setIsLoading(false)
            handleOpen()
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
            renderCell: (params) => <HandleQty params={params} handler={handleUpdateItem} handlerQTR={handleUpdateItemQTY}/>
        },
        {
            field: 'qty_to_ship',
            headerName: t('quantity_to_ship'),
            flex: 1,
            renderCell: (params) => <HandleQtyShip params={params} />
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
    return (
        <>
            <Modal open={open} onClose={handleToogleModal}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleToogleModal}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('create_new_so')}</p>
                        </div>
                        <button type="button" onClick={createSalesOrder} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('create')}
                        </button>
                    </div>
                    <div className='p-5 flex justify-between gap-3'>
                        <div className='p-2 shadow-md mb-2 rounded-md w-full h-fit'>
                            {/* Customer */}
                            <div className='w-full flex p-3 bg-[#e0e0e0]'>
                                <div className='w-1/2'>{t('customer')}: <span className='text-red-500'>*</span></div>
                                <div className='w-1/2'>
                                    <FormControl variant="standard" sx={{ width: '100%' }}>
                                        <Select value={customer} onChange={(e) => { setCustomer(e.target.value); setDisabledButton(false) }}>
                                            {customers?.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            {/* Ship to code */}
                            <div className='w-full flex p-3'>
                                <div className='w-1/2'>{t('shipToAdd')}:</div>
                                <div className='w-1/2'>
                                    <FormControl variant="standard" sx={{ width: '100%' }}>
                                        <Select value={shipToCode} onChange={(e) => { handleShipToLocation(e) }}>
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
                                    <TextField type="text" variant='standard' className='w-full' name="drop_trailer_no" value={dropTrailerNo} onChange={(e) => { setDropTrailerNo(e.target.value) }} />
                                </div>
                            </div>
                            {/* Pickup Trailer No. */}
                            <div className='w-full flex p-3'>
                                <div className='w-1/2'>{t('pickup_trailer_no')}</div>
                                <div className='w-1/2'>
                                    <TextField type="text" variant='standard' className='w-full' name="pickup_trailer_no" value={pickupTrailerNo} onChange={(e) => { setPickupTrailerNo(e.target.value) }} />
                                </div>
                            </div>
                            {/* Customer PO No. */}
                            <div className='w-full flex p-3 bg-[#e0e0e0]'>
                                <div className='w-1/2'>{t('customer_po_no')} <span className='text-red-500'>*</span></div>
                                <div className='w-1/2'>
                                    <TextField type="text" variant='standard' className='w-full' name="customer_po_no" value={customerPoNo} onChange={(e) => { handleCustomerPoNo(e) }} />
                                    <p className='text-xs italic roboto text-slate-500 pt-1'><i className="fa-solid fa-circle-info"></i> The maximum charachter limit is 50.</p>
                                </div>
                            </div>
                            {/* Requested Delivery Date */}
                            <div className='w-full flex p-3'>
                                <div className='w-1/2'>{t('requested_delivery_date')}:</div>
                                <div className='w-1/2'>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <MobileDatePicker sx={{ width: '100%' }} format="YYYY-MM-DD" slotProps={{ textField: { variant: 'standard' } }} value={requestedDeliveryDate} onChange={(newValue) => setRequestedDeliveryDate(newValue)} />
                                    </LocalizationProvider>
                                </div>
                            </div>
                            {/* Shippment Date */}
                            <div className='w-full flex p-3 bg-[#e0e0e0]'>
                                <div className='w-1/2'>{t('shipment_date')}:</div>
                                <div className='w-1/2'>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <MobileDatePicker sx={{ width: '100%' }} format="YYYY-MM-DD" slotProps={{ textField: { variant: 'standard' } }} value={shippedDate} onChange={(newValue) => setShippedDate(newValue)} />
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
                                            <AddButton disabled={disabledButton} className="text-[#336195]" onClick={handleOpenSalesOrderItem}><i className="fa-solid fa-plus text-[#336195]"></i></AddButton>
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
                                            rows={3}
                                            variant="filled"
                                            value={comments}
                                            onChange={e => setComments(e.target.value)}
                                            className='w-full'
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
            <AddSalesOrderItem open={openSalesOrderItem} handleOpen={handleOpenSalesOrderItem} salesOrderItems={salesOrderItems} setSalesOrderItems={setSalesOrderItems} disabled={disabled} setDisabled={setDisabled} />
        </>
    )
}



export default CreateSalesOrder


const HandleQty = ({ params, handler, handlerQTR }) => {

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
                if(e.target.value < params.row.qty_to_ship) {
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
        <TextField type="text" variant='standard' className='w-2/3 mb-5 px-0 pt-0' name="qty" value={qty} onChange={(e) => { handleQuantity(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />
    )

}

const HandleQtyShip = ({ params }) => {

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
        <TextField type="text" variant='standard' className='w-2/3 mb-5 px-0 pt-0' name="qty" value={qty} onChange={(e) => { handleQuantity(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />
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

