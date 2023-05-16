import React, { useState, useEffect } from 'react'

import { Tooltip, Modal, Box, TextField, Autocomplete } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'

import AddButton from './AddButton'
import TableShared from './TableShared'
import style from '../styles/style'
import { useStateContext } from '../context/ContextProvider'
import axios from '../lib/axios'


const SalesContractsItemExistUpdate = ({ setIsLoading, id, itemsSend, setItemsSend }) => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    const [salesItems, setSalesItems] = useState(itemsSend)
    const [item, setItem] = useState([])
    const [items, setItems] = useState([])
    const [no, setNo] = useState('')
    const [description, setDescription] = useState(' ')
    const [qty, setQty] = useState(0)
    const [totalCost, setTotalCost] = useState(0)
    const [open, setOpen] = useState(false)
    const [qty1, setQty1] = useState(0)
    const [disabled, setDisabled] = useState(true)
    const [count, setCount] = useState(1000)



    const handleOpen = () => { setOpen(true); setDisabled(true) }
    const handleClose = () => {
        setOpen(false)
        setNo('')
        setDescription(' ')
        setQty(0)
        setQty1(0)
        setTotalCost(0)
    }
    const handleZero = (e) => {
        if (e.target.value === "") {
            setQty(0)
        }
    }
    const handleZeroRest = (e) => {
        if (e.target.value === "") {
            setQty1(0)
        }
    }
    const deleteZero = (e) => {
        if (qty === 0) {
            setQty('')
        }
    }
    const deleteZeroRest = (e) => {
        if (qty1 === 0) {
            setQty1('')
        }
    }
    const handleNumber = (e) => {

        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty1(0)
            else setQty1(e.target.value)
        }
    }
    const handleQty = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty(0)
            else setQty(e.target.value)
        }
    }

    useEffect(() => {
        const total = qty * qty1
        setTotalCost(total)
    }, [qty, qty1])

    useEffect(() => {
        getItems(salesItems.map(({ item_no }) => item_no))
        getPurchaseitems(id)
    }, [])

    useEffect(() => {
        getItems(salesItems.map(({item_no}) => item_no))
    }, [salesItems])

    useEffect(() => {
        getItem(no)
    }, [no])

    useEffect(() => {
        if (!Array.isArray(item)) {
            setDescription(item?.description)
            setQty1(item?.unit_price)
        }
    }, [item])

    const getPurchaseitems = async (id) => {
        await axios.get(`/api/sales-contract-items?sales_contract_id=${id}`, config)
            .then(res => {
                const shipTo = res.data
                setSalesItems(shipTo)
                setItemsSend(shipTo)
                let nos = shipTo.map(({ item_no }) => item_no);
                getItems(nos)
            })
    }

    const getItems = async (without = []) => {
        await axios.get(`/api/items?blocked_for_sales=0&blocked=0&company_id=${localStorage.getItem('company_id')}`, config)
            .then(res => {
                const shipTo = res.data
                const filteredShipTo = shipTo.filter(item => {
                    return !without.includes(item['item_no']);
                });
                setItems(filteredShipTo)
            })
    }

    const getItem = async (id) => {
        await axios.get(`/api/items/${id}`, config)
            .then(res => {
                const shipTo = res.data
                setItem(shipTo)
            })
    }

    const updateItem = (id, quantity, unit_price) => {
        const salesItemsCopy = [...salesItems]
        const item = salesItemsCopy.find(item => item.id === id)

        item.quantity = quantity
        item.unit_price = unit_price
        item.total_cost = quantity * unit_price

        setSalesItems(salesItemsCopy)
        setItemsSend(salesItemsCopy)
    }

    const createItem = async (e) => {
        e.preventDefault();

        let new_item = {
            "id": count,
            "item_id": item.id,
            "sales_contract_id": id,
            "item_no": item.item_no,
            "description": description,
            "quantity": qty,
            "unit_price": qty1,
            "total_cost": totalCost
        }

        setSalesItems((prev) => [...prev, new_item])
        setItemsSend((prev) => [...prev, new_item])
        setCount((prev) => prev + 1)

        setNo('')
        setDescription(' ')
        setQty(0)
        setQty1(0)
        setTotalCost(0)

        handleClose()
    }

    const shipToColumns = [
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
            field: 'quantity',
            headerName: t('qty'),
            flex: 1,
            renderCell: (params) => <HandleQty params={params} handler={updateItem} />
        },
        {
            field: 'unit_price',
            headerName: t('unit_price'),
            flex: 1,
            renderCell: (params) => <HandleUnitPrice params={params} handler={updateItem} />
        },
        {
            field: 'total_cost',
            headerName: t('total_cost'),
            flex: 0.5,
            renderCell: (params) => <HandleTotal params={params} />
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 0.5,
            renderCell: (params) => <DeleteItem params={params} setSalesItems={setSalesItems} salesItems={salesItems} setItemsSend={setItemsSend} itemsSend={itemsSend}  />
        }
    ]

    const options = items?.map(option => ({ label: option.item_no, id: option.id }))

    return (
        <>
            <div className='w-full p-5 pl-0'>
                <div className='pb-5 shadow-md mb-2 rounded-md'>
                    <div className='flex justify-start items-center gap-4 '>
                        <p className='font-bold roboto color-fake ml-5'>{t('salesContractItems')}</p>
                        <Tooltip title={t('addsalesContractItems')} placement='right'>
                            <div>
                                <AddButton onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <div>
                    <TableShared items={salesItems} columns={shipToColumns} />
                </div>
            </div>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('addsalesContractItems')}</p>
                        </div>
                        <button type="button" onClick={createItem} style={{ width: '90px' }} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-[hsla(0,0%,100%,.12)]' disabled={disabled}>
                            {t('add')}
                        </button>
                    </div>
                    <div>
                        <div className='p-5'>
                            <form className='flex justify-center flex-col items-start mt-2'>

                                <Autocomplete
                                    disablePortal
                                    id="combo-box-demo"
                                    options={options}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    sx={{ width: '100%', marginBottom: '20px' }}
                                    onChange={(a, b) => { setNo(b.id); setDisabled(false) }}
                                    renderInput={(params) => <TextField {...params} label={t('no')} variant="standard" />}
                                />

                                <TextField type="text" variant='standard' label={t('description')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="description" value={description} onChange={(e) => { setDescription(e.target.value) }} disabled />

                                <TextField type="text" variant='standard' label={t('qty')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="qty" value={qty} onChange={(e) => { handleQty(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />

                                <TextField type="text" variant='standard' label={t('unit_price')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="unitPrice" value={qty1} onChange={(e) => { handleNumber(e) }} onBlur={e => handleZeroRest(e)} onFocus={e => deleteZeroRest(e)} />

                                <TextField type="text" variant='standard' label={t('total_cost')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="total_cost" value={totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} onChange={(e) => { setTotalCost(e.target.value) }} disabled />

                            </form>
                        </div>
                    </div>
                </Box>
            </Modal>
        </>
    )
}

export default SalesContractsItemExistUpdate


const HandleQty = ({ params, handler }) => {

    const [qty, setQty] = useState(params.value)

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

    const handleQuantity = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty(0)
            else {
                setQty(e.target.value)
                handler(
                    params.row.id,
                    e.target.value,
                    params.row.unit_price
                );
            }
        }

    }

    return (
        <TextField type="text" variant='standard' className='w-2/3 mb-5 px-0 pt-0' name="qty" value={qty} onChange={(e) => { handleQuantity(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />
    )

}

const HandleUnitPrice = ({ params, handler }) => {

    const [unitPrice, setUnitPrice] = useState(params.value)

    const handleZero = (e) => {
        if (e.target.value === "") {
            setUnitPrice(0)
        }
    }
    const deleteZero = (e) => {
        if (unitPrice == 0) {
            setUnitPrice('')
        }
    }

    const handleUnitPrice = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setUnitPrice(0)
            else {
                setUnitPrice(e.target.value)
                handler(
                    params.row.id,
                    params.row.quantity,
                    e.target.value,
                );
            }
        }

    }

    return (
        <TextField type="text" variant='standard' className='w-2/3 mb-5 px-0 pt-0' name="unit_price" value={unitPrice} onChange={(e) => { handleUnitPrice(e) }} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />
    )

}

const HandleTotal = (params) => {

    const [total, setTotal] = useState(params.params.value)

    useEffect(() => {
        setTotal(params.params.row.quantity * params.params.row.unit_price)
    }, [params])

    return (
        <>{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
    )

}

const DeleteItem = (params) => {

    const { t } = useTranslation()

    const deleteItem = (id) => {
        params.setItemsSend(params.itemsSend.filter((row) => row.id !== id))
        params.setSalesItems(params.salesItems.filter((row) => row.id !== id))
    }

    return (
        <div className='flex justify-between'>
            <Tooltip title={t('delete')} placement='top'>
                <div style={{ color: 'rgba(0,0,0,.54)' }}>
                    <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => deleteItem(params.params.row.id)}><i className="fa-solid fa-trash"></i></span>
                </div>
            </Tooltip>
        </div>
    )

}
