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
import AddPurchaseOrderItem from './AddPurchaseOrderItem'


const CreatePurchaseOrder = ({ open, handleOpen, setIsLoading }) => {

    const { t } = useTranslation()
    const { company_id, config, setCompany_id, choosesite, setChoosesite } = useStateContext()
    const navigate = useNavigate();


    /* state */
    const [vendors, setVendors] = useState([])
    const [purchaseLocations, setPurchaseLocations] = useState([])
    const [purchaseOrderItems, setPurchaseOrderItems] = useState([])
    const [openPurchaseOrderItem, setOpenPurchaseOrderItem] = useState(false)
    const [disabled, setDisabled] = useState(true)
    const [totalPrice, setTotalPrice] = useState(0)
    const [totalQty, setTotalQty] = useState(0)
    const [disabledButton, setDisabledButton] = useState(true)

    /* form */
    const [vendor, setVendor] = useState('')
    const [purchaseLocation, setPurchaseLocation] = useState('')
    const [address, setAddress] = useState('')
    const [zip, setZip] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [requestedCollectionDate, setRequestedCollectionDate] = useState(dayjs())
    const [collectedDate, setCollectedDate] = useState(dayjs())
    const [customerBOL, setCustomerBOL] = useState('')
    const [brokerBOL, setBrokerBOL] = useState('')
    const [pickupTrailerNo, setPickupTrailerNo] = useState('')
    const [dropTrailerNo, setDropTrailerNo] = useState('')
    const [comments, setComments] = useState('')
    const [PCItems, setPCItems] = useState([])


    /* UseEffect */
    useEffect(() => {
        setCompany_id(localStorage.getItem('company_id'))
        setChoosesite(localStorage.getItem('site'))
    }, [])

    useEffect(() => {
        getVendors(company_id)
    }, [company_id])

    useEffect(() => {
        getPurchaseLocations(vendor)
        setPurchaseOrderItems([])
    }, [vendor])

    useEffect(() => {
        setPurchaseOrderItems([])
        if (purchaseLocations.length > 0 && vendor && purchaseLocation) {
            getPurchaseContractItems()
        }
    }, [purchaseLocation])

    useEffect(() => {
        if (PCItems.length > 0) {
            handleNewItem(PCItems)
        }
    }, [PCItems])

    useEffect(() => {
        handleTotalPrice()
        handleTotalQty()
    }, [purchaseOrderItems])


    const handleTotalPrice = () => {
        const sum = purchaseOrderItems.reduce((accumulator, currentValue) => parseFloat(accumulator) + parseFloat(currentValue.total_cost), 0);
        setTotalPrice(sum);
    }

    const handleTotalQty = () => {
        const item = purchaseOrderItems.filter((item) => item.qty_ordered !== "")
        if(item) {
            const sum = item.reduce((accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue.qty_ordered), 0);
            setTotalQty(sum)
        } else {
            setTotalQty(0)
        }
    }

    const handleNewItem = (e) => {
        e.map((item) => {

            let new_item = {
                "id": item.id,
                "item_no": item.item_no,
                "description": item.description,
                "qty_ordered": 0,
                "qty_to_receive": 0,
                "qty_received": 0,
                "qty_unloaded": 0,
                "vendor_count": 0,
                "unit_price": item.unit_price,
                "total_cost": 0,
                "unit_id": item.item_id
            }

            setPurchaseOrderItems((prev) => [...prev, new_item])
        })
    }

    /* Handlers */
    const handleToogleModal = () => {
        setVendor('')
        setPurchaseLocation('')
        setDropTrailerNo('')
        setPickupTrailerNo('')
        setCustomerBOL('')
        setBrokerBOL('')
        setRequestedCollectionDate(dayjs())
        setCollectedDate(dayjs())
        setPurchaseOrderItems([])
        handleOpen()
        setDisabledButton(true)
    }


    const handleCustomerBOL = (e) => {
        setCustomerBOL(e.target.value);
    }

    const handleBrokerBOL = (e) => {
        setBrokerBOL(e.target.value);
    }

    const handleShipToLocation = (e) => {
        setPurchaseLocation(e.target.value)
        const item = purchaseLocations.find(item => item.id === e.target.value)
        setAddress(item.address)
        setZip(item.zip)
        setCity(item.city)
        setState(item.state)
    }

    const handleUpdateItem = (id, quantity, unit_price) => {
        const purchaseOrderItemsCopy = [...purchaseOrderItems]
        const item = purchaseOrderItemsCopy.find(item => item.id === id)

        item.qty_ordered = quantity
        item.qty_to_receive = quantity
        item.unit_price = unit_price
        item.total_cost = quantity * unit_price

        setPurchaseOrderItems(purchaseOrderItemsCopy)
    }

    const handleUpdateItemQTY = (id, quantity) => {
        const purchaseOrderItemsCopy = [...purchaseOrderItems]
        const item = purchaseOrderItemsCopy.find(item => item.id === id)

        item.qty_ordered = quantity
        item.qty_to_receive = quantity


        setPurchaseOrderItems(purchaseOrderItemsCopy)
    }

    const handleOpenPurchaseOrderItem = () => {
        setDisabled(true)
        setOpenPurchaseOrderItem(!openPurchaseOrderItem)
    }


    /* API Requests */

    const getPurchaseContractItems = async () => {
        await axios.get(`/api/purchase-contracts?vendor_id=${vendor}&purchase_address_id=${purchaseLocation}`, config)
            .then(res => {
                const items = res.data
                setPCItems(items[0]?.purchase_contract_items || [])
            })
    }

    const getVendors = async (id) => {
        setVendor('')
        await axios.get(`/api/vendors?company_id=${id}`, config)
            .then(res => {
                const vendors = res.data
                setVendors(vendors)
            })
    }

    const getPurchaseLocations = async (id) => {
        setPurchaseLocation('')
        setAddress('')
        setZip('')
        setCity('')
        setState('')
        await axios.get(`/api/purchase-addresses?vendor_id=${id}`, config)
            .then(res => {
                const purchaseLocations = res.data
                setPurchaseLocations(purchaseLocations)
                setPurchaseLocation(purchaseLocations[0]?.id || '')
                setAddress(purchaseLocations[0]?.address || '')
                setZip(purchaseLocations[0]?.zip || '')
                setCity(purchaseLocations[0]?.city || '')
                setState(purchaseLocations[0]?.state || '')
            })


    }

    const createPurchaseOrder = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const formData = {}

        formData['vendor_id'] = vendor
        formData['purchase_address_id'] = purchaseLocation
        formData['drop_trailer_no'] = dropTrailerNo
        formData['pickup_trailer_no'] = pickupTrailerNo
        formData['customer_bol_no'] = customerBOL
        formData['broker_bol_no'] = brokerBOL
        formData['requested_collection_date'] = dayjs(requestedCollectionDate).format('YYYY-MM-DD HH:mm:ss')
        formData['collected_date'] = dayjs(collectedDate).format('YYYY-MM-DD HH:mm:ss')
        formData['site_id'] = choosesite
        formData['purchase_order_items'] = purchaseOrderItems
        formData['po_status_id'] = 1
        formData['comments'] = comments
        formData['po_type'] = 'collection'


        await axios.post(`/api/purchase-orders`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })

            navigate("/purchase-order/" + data.success.created.id)

            setVendor('')
            setPurchaseLocation('')
            setDropTrailerNo('')
            setPickupTrailerNo('')
            setCustomerBOL('')
            setBrokerBOL('')
            setComments('')
            setRequestedCollectionDate(dayjs())
            setCollectedDate(dayjs())
            setPurchaseOrderItems([])

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
            headerName: t('qty_ordered'),
            flex: 1,
            renderCell: (params) => <HandleQty params={params} handler={handleUpdateItem} handlerQTR={handleUpdateItemQTY} />
        },
        {
            field: 'qty_to_receive',
            headerName: t('qty_to_receive'),
            flex: 1,
            renderCell: (params) => <HandleQtyShip params={params} />
        },
        {
            field: 'qty_received',
            headerName: t('quantity_received'),
            flex: 1,
            renderCell: (params) => <HandleShipped params={params} />
        },
        {
            field: 'vendor_count',
            headerName: t('vendor_count'),
            flex: 1,
            renderCell: (params) => <HandleVendorCount params={params} />
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
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#b7472a', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleToogleModal}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('create_new_po')}</p>
                        </div>
                        <button type="button" onClick={createPurchaseOrder} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('create')}
                        </button>
                    </div>
                    <div className='p-5 flex justify-between gap-3'>
                        <div className='p-2 shadow-md mb-2 rounded-md w-full h-fit'>
                            {/* Vendor */}
                            <div className='w-full flex p-3 bg-[#e0e0e0]'>
                                <div className='w-1/2'>{t('vendor')}: <span className='text-red-500'>*</span></div>
                                <div className='w-1/2'>
                                    <FormControl variant="standard" sx={{ width: '100%' }}>
                                        <Select value={vendor} onChange={(e) => { setVendor(e.target.value); setDisabledButton(false) }}>
                                            {vendors?.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            {/* Ship to code */}
                            <div className='w-full flex p-3'>
                                <div className='w-1/2'>{t('purchaseLocation')}:</div>
                                <div className='w-1/2'>
                                    <FormControl variant="standard" sx={{ width: '100%' }}>
                                        <Select value={purchaseLocation} onChange={(e) => { handleShipToLocation(e) }}>
                                            {purchaseLocations?.map((item, index) => <MenuItem key={index} value={item.id}>{item.code} - {item.name}</MenuItem>)}
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
                                {purchaseLocation ? <div className='w-1/2'>{zip} {city}, {state}</div> : <div className='w-1/2'></div>}
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
                            {/* Customer BOL */}
                            <div className='w-full flex p-3 bg-[#e0e0e0]'>
                                <div className='w-1/2'>{t('customer_bol')}#</div>
                                <div className='w-1/2'>
                                    <TextField type="text" variant='standard' className='w-full' name="customerbol" value={customerBOL} onChange={(e) => { handleCustomerBOL(e) }} />
                                </div>
                            </div>
                            {/* Broker BOL */}
                            <div className='w-full flex p-3'>
                                <div className='w-1/2'>{t('broker_bol')}#</div>
                                <div className='w-1/2'>
                                    <TextField type="text" variant='standard' className='w-full' name="brokerbol" value={brokerBOL} onChange={(e) => { handleBrokerBOL(e) }} />
                                </div>
                            </div>
                            {/* Requested Delivery Date */}
                            <div className='w-full flex p-3 bg-[#e0e0e0]'>
                                <div className='w-1/2'>{t('requested_collection_date')}:</div>
                                <div className='w-1/2'>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <MobileDatePicker sx={{ width: '100%' }} format="YYYY-MM-DD" slotProps={{ textField: { variant: 'standard' } }} value={requestedCollectionDate} onChange={(newValue) => setRequestedCollectionDate(newValue)} />
                                    </LocalizationProvider>
                                </div>
                            </div>
                            {/* Shippment Date */}
                            <div className='w-full flex p-3 '>
                                <div className='w-1/2'>{t('collected_date')}:</div>
                                <div className='w-1/2'>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <MobileDatePicker sx={{ width: '100%' }} format="YYYY-MM-DD" slotProps={{ textField: { variant: 'standard' } }} value={collectedDate} onChange={(newValue) => setCollectedDate(newValue)} />
                                    </LocalizationProvider>
                                </div>
                            </div>
                        </div>
                        <div className='w-full'>
                            <div className='p-2 shadow-md mb-2 rounded-md w-full'>
                                <div className='flex justify-start items-center gap-4 '>
                                    <p className='font-bold roboto color-fake ml-5'>{t('purchaseOrderItems')}</p>
                                    <Tooltip title={t('addpurchaseOrderItems')} placement='right'>
                                        <div>
                                            <AddButton disabled={disabledButton} onClick={handleOpenPurchaseOrderItem}><i className="fa-solid fa-plus text-[#b7472a]"></i></AddButton>
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
                                    <TableShared columns={columns} items={purchaseOrderItems} />
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
            <AddPurchaseOrderItem open={openPurchaseOrderItem} handleOpen={handleOpenPurchaseOrderItem} purchaseOrderItems={purchaseOrderItems} setPurchaseOrderItems={setPurchaseOrderItems} disabled={disabled} setDisabled={setDisabled} />
        </>
    )
}



export default CreatePurchaseOrder


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
        if (qty === 0) {
            setQty('')
        }
    }

    const handleQuantity = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty(0)
            else {
                if(e.target.value < params.row.qty_to_receive) {
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

const HandleQtyShip = ({ params, handler }) => {

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
                        t('warningPurchaseOrder'),
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

const HandleVendorCount = ({ params }) => {

    const [qty, setQty] = useState(params.value)

    const handleZero = (e) => {
        if (e.target.value === "") {
            setQty(0)
        }
    }

    const deleteZero = (e) => {
        if (qty === 0) {
            setQty('')
        }
    }

    const handleQuantity = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty(0)
            else {
                setQty(e.target.value)
            }
        }
    }

    return (
        <TextField type="text" variant='standard' className='w-2/3 mb-5 px-0 pt-0' name="qty" value={qty} onChange={(e) => { handleQuantity(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />
    )

}

const HandleShipped = ({ params }) => {

    const [qty, setQty] = useState(params.value)

    const handleZero = (e) => {
        if (e.target.value === "") {
            setQty(0)
        }
    }

    const deleteZero = (e) => {
        if (qty === 0) {
            setQty('')
        }
    }

    const handleQuantity = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty(0)
            else {
                setQty(e.target.value)
            }
        }
    }

    return (
        <TextField type="text" variant='standard' className='w-2/3 mb-5 px-0 pt-0' name="qty" value={qty} onChange={(e) => { handleQuantity(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} disabled />
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
