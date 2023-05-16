import React, { useState, useEffect } from 'react'

import { Modal, Box, TextField, Autocomplete } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useStateContext } from '../../context/ContextProvider'
import axios from '../../lib/axios'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    height: '50%',
    bgcolor: '#ffffff',
    border: 'transparent',
    borderRadius: '5px',
    boxShadow: 24,
    zIndex: "1600"
}


const AddSalesOrderItem = ({ open, handleOpen, salesOrderItems, setSalesOrderItems, disabled, setDisabled }) => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    /* state */
    const [items, setItems] = useState([])
    const [count, setCount] = useState(10000)
    const [selectedItem, setSelectedItem] = useState([])

    /* form */
    const [no, setNo] = useState('')
    const [description, setDescription] = useState(' ')
    const [qty, setQty] = useState(0)
    const [totalCost, setTotalCost] = useState(0)
    const [unitPrice, setUnitPrice] = useState(0)

    /* useefect */
    useEffect(() => {
        const total = qty * unitPrice
        setTotalCost(total)
    }, [qty, unitPrice])

    useEffect(() => {
        if(open) getItems(salesOrderItems.map(({item_no}) => item_no))
    }, [salesOrderItems])

    useEffect(() => {
        if(open){
            if(no) {
                getItem(no)
            }
        }
    }, [no])

    useEffect(() => {
        if(open) {
            getItems(salesOrderItems.map(({item_no}) => item_no))
        }
    }, [open])

    useEffect(() => {
        if (!Array.isArray(selectedItem)) {
            setDescription(selectedItem?.description)
            setUnitPrice(selectedItem?.unit_price)
        }
    }, [selectedItem])


    /* getters */
    const getItems = async (without = []) => {
        await axios.get(`/api/items?blocked_for_sales=0&blocked=0&company_id=${localStorage.getItem('company_id')}`, config)
            .then(res => {
                const items = res.data
                const filteredItems = items.filter(item => {
                    return !without.includes(item['item_no'])
                })
                setItems(filteredItems)
            })
    }

    const getItem = async (id) => {
        await axios.get(`/api/items/${id}`, config)
            .then(res => {
                const item = res.data
                setSelectedItem(item)
            })
    }

    /* handlers */
    const deleteZero = (e) => {
        if (qty === 0) {
            setQty('')
        }
    }
    const deleteZeroRest = (e) => {
        if (unitPrice === 0) {
            setUnitPrice('')
        }
    }
    const handleZero = (e) => {
        if (e.target.value === "") {
            setQty(0)
        }
    }
    const handleZeroRest = (e) => {
        if (e.target.value === "") {
            setUnitPrice(0)
        }
    }
    const handleUnitPrice = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setUnitPrice(0)
            else setUnitPrice(e.target.value)
        }
    }
    const handleQty = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setQty(0)
            else setQty(e.target.value)
        }
    }

    const handleToogleModal = () => {
        setNo('')
        setDescription(' ')
        setQty(0)
        setUnitPrice(0)
        setTotalCost(0)
        handleOpen()
    }

    const createItem = async (e) => {
        e.preventDefault();

        let new_item = {
            "id": count,
            "item_no": selectedItem.item_no,
            "description": description,
            "qty_ordered": qty,
            "qty_to_ship": qty,
            "qty_shipped": 0,
            "qty_loaded": 0,
            "unit_price": unitPrice,
            "total_cost": totalCost,
            "unit_id": selectedItem.id
        }

        setSalesOrderItems((prev) => [...prev, new_item])
        setCount(prev => prev + 1)

        setNo('')
        setDescription(' ')
        setQty(0)
        setUnitPrice(0)
        setTotalCost(0)

        handleOpen()
    }

    const options = items?.map(option => ({ label: option.item_no, id: option.id }))

    return (
        <Modal open={open} onClose={handleToogleModal}>
            <Box sx={style}>
                <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                    <div className='flex gap-4 items-baseline'>
                        <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                            <button onClick={handleToogleModal}><i className="fa-solid fa-plus"></i></button>
                        </div>
                        <p className='text-xl roboto font-semibold text-white'>{t('addsalesOrderitems')}</p>
                    </div>
                    <button type="button" onClick={createItem} disabled={disabled} style={{ width: '90px' }} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-[hsla(0,0%,100%,.12)]'>
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

                            <TextField type="text" variant='standard' label={t('unit_price')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="unitPrice" value={unitPrice} onChange={(e) => { handleUnitPrice(e) }} onBlur={e => handleZeroRest(e)} onFocus={e => deleteZeroRest(e)} />

                            <TextField type="text" variant='standard' label={t('total_cost')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="total_cost" value={totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} onChange={(e) => { setTotalCost(e.target.value) }} disabled />

                        </form>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default AddSalesOrderItem
