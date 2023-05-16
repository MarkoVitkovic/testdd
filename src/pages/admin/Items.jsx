import React, { useState, useEffect } from "react"

import { useTranslation } from 'react-i18next'
import { Tooltip, Box, Modal, Tab, Switch, TextField, InputLabel } from "@mui/material"
import Swal from 'sweetalert2'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton"
import Pusher from 'pusher-js'

import AppLayout from '../../components/Layouts/AppLayout'
import { useStateContext } from '../../context/ContextProvider'
import TableShared from '../../components/TableShared'
import Loading from "../../components/Loading"
import AddButton from "../../components/AddButton"
import style from '../../styles/style'
import axios from "../../lib/axios"
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox';


const Items = () => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    /* state */
    const [isLoading, setIsLoading] = useState(false)
    const [items, setItems] = useState([])
    const [searchCode, setSearchCode] = useState('')
    const [searchName, setSearchName] = useState('')
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('1')
    const [unitsofMeasure, setUnitsOfMeasure] = useState([])

    /* fields */
    const [itemNo, setItemNo] = useState('')
    const [description, setDescription] = useState('')
    const [additionalDesc, setAdditionalDesc] = useState('')
    const [unitOfMeasure, setUnitOfMeasure] = useState('')
    const [unitPrice, setUnitPrice] = useState(0)
    const [blockedSO, setBlockedSO] = useState(false)
    const [blockedPO, setBlockedPO] = useState(false)
    const [blocked, setBlocked] = useState(false)
    const [minimumStockQuantity, setMinimumStockQuantity] = useState(1)
    const [negativeInventory, setNegativeInventory] = useState(false)
    const [stockoutWarning, setStockoutWarninig] = useState(false)

    const [selectedBlocked, setSelectedBlocked] = useState([]);
    const [soBlocked, setSoBlocked] = useState(0)
    const [poBlocked, setPoBlocked] = useState(0)
    const [allBlocked, setAllBlocked] = useState(0)



    useEffect(() => {
        const pusher = new Pusher('b5344b63ba9e360efbcc', {
            cluster: 'mt1',
            encrypted: true,
        })
        const channeldelete = pusher.subscribe('item-deleted')
        const channelcreate = pusher.subscribe('item-created')
        const channelupdate = pusher.subscribe('item-updated')


        channeldelete.bind('item-deleted-event', data => {
            setItems((prev) => {
                const item = prev.find((i) => i.id === data.id)
                const exItem = prev.filter((i) => i.id !== item.id)
                return exItem
            })
        })

        channelcreate.bind('item-created-event', data => {
            getItem(data.id, 'created')
        })

        channelupdate.bind('item-updated-event', data => {
            getItems()
        })
    }, [])

    const getItem = async (id, state) => {

        await axios.get(`/api/items/${id}`, config)
            .then(res => {
                const item = res.data
                if (state === 'created') setItems((prev) => [...prev, item])

                if (state === 'updated') setItems((prev) => {
                    const item = prev.find((i) => i.id === id)
                    const exItem = prev.filter((i) => i.id !== item.id)
                    const vab = [...exItem, item]
                    return vab
                })
            })

    }

    const handleChangePerson = (event) => {
        const { target: { value } } = event
        setSelectedBlocked(
            typeof value === "string" ? value.split(",") : value
        )
    }

    /* methods */

    useEffect(() => {
        if (selectedBlocked.includes(1)) setAllBlocked(1)
        else setAllBlocked(0)
        if (selectedBlocked.includes(2)) setSoBlocked(1)
        else setSoBlocked(0)
        if (selectedBlocked.includes(3)) setPoBlocked(1)
        else setPoBlocked(0)
    }, [selectedBlocked])

    useEffect(() => {
        getItems()
    }, [allBlocked, soBlocked, poBlocked])

    useEffect(() => {
        getItems()
        getUOM()
    }, [])

    const handleOpen = () => setOpen(true)
    const handleClose = () => {
        setOpen(false)
        setValue('1')
        setItemNo('')
        setDescription('')
        setAdditionalDesc('')
        setUnitOfMeasure('')
        setUnitPrice(0)
        setBlockedSO(false)
        setBlockedPO(false)
        setBlocked(false)
        setMinimumStockQuantity(1)
        setStockoutWarninig(false)
    }
    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    const handleBlocked = (event) => {
        setBlocked(event.target.checked);
    }
    const handleBlockedPO = (event) => {
        setBlockedPO(event.target.checked);
    }
    const handleBlockedSO = (event) => {
        setBlockedSO(event.target.checked);
    }
    const deleteZero = (e) => {
        if (unitPrice === 0) {
            setUnitPrice('')
        }
    }
    const handleZero = (e) => {
        if (e.target.value === "") {
            setUnitPrice(0)
        }
    }
    const handleZeroRest = (e) => {
        if (e.target.value === "" || e.target.value < 1) {
            setMinimumStockQuantity(1)
        }
    }
    const handleNumber = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setUnitPrice(0)
            else setUnitPrice(e.target.value)
        }
    }
    const handleQty = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value === '-') setMinimumStockQuantity(1)
            else setMinimumStockQuantity(e.target.value)
        }
    }


    const getItems = async () => {
        await axios.get(`/api/items?blocked_for_sales=${soBlocked}&blocked_for_purchases=${poBlocked}&blocked=${allBlocked}`, config)
            .then(res => {
                const items = res.data
                setItems(items)
            })
    }

    const getUOM = async () => {
        await axios.get(`/api/units-of-measure`, config)
            .then(res => {
                const uom = res.data
                setUnitsOfMeasure(uom)
            })
    }

    const createItem = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const formData = {}

        formData['item_no'] = itemNo
        formData['description'] = description
        formData['description2'] = additionalDesc
        formData['unit_price'] = unitPrice
        formData['unit_of_measure_id'] = unitOfMeasure
        formData['blocked_for_sales'] = blockedSO
        formData['blocked_for_purchases'] = blockedPO
        formData['blocked'] = blocked
        /*  formData['can_hit_negative_inventory'] = negativeInventory */
        formData['can_issue_stockout_warnings'] = stockoutWarning
        formData['minumum_stock_quantity'] = minimumStockQuantity
        formData['company_id'] = localStorage.getItem('company_id')

        await axios.post(`/api/items`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setItemNo('')
            setDescription('')
            setAdditionalDesc('')
            setUnitPrice(0)
            setUnitOfMeasure(' ')
            setBlockedSO(false)
            setBlockedPO(false)
            setBlocked(false)
            setNegativeInventory(false)
            setStockoutWarninig(false)
            setMinimumStockQuantity(1)
            setIsLoading(false)
            handleClose()
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

    /* data managment */

    const itemsFiltered = items.filter(data => {
        if (searchCode === null)
            return data
        if (data.item_no.toLocaleLowerCase().includes(searchCode.toLocaleLowerCase()))
            return data
    })

    const filtered = itemsFiltered.filter(data => {
        if (searchName === null)
            return data
        if (data.description.toLocaleLowerCase().includes(searchName.toLocaleLowerCase()))
            return data
    })

    const columns = [
        {
            field: 'item_no',
            headerName: t('no'),
            flex: 1
        },
        {
            field: 'description',
            headerName: t('description'),
            flex: 1
        },
        {
            field: 'description2',
            headerName: t('description2'),
            flex: 1
        },
        {
            field: 'unit_price',
            headerName: t('unit_price'),
            flex: 1
        },
        {
            field: 'actions',
            headerName: t('actions'),
            flex: 0.5,
            renderCell: (params) => <ItemsActions params={params} unitsofMeasure={unitsofMeasure} setIsLoading={setIsLoading} config={config} />
        }
    ]

    const handleClearUOMClick = () => {
        setUnitOfMeasure('')
    }

    return (
        <>
            {isLoading ? <Loading /> : ''}
            <AppLayout>
                <div className='p-5'>
                    <div className='pb-5 shadow-md mb-2 rounded-md'>
                        <div className='flex justify-start items-center gap-4 '>
                            <p className='font-bold roboto pl-5 color-fake'>{t('items')}</p>
                            <Tooltip title={t('create_item')} placement='right'>
                                <div>
                                    <AddButton onClick={handleOpen}><i className="fa-solid fa-plus"></i></AddButton>
                                </div>
                            </Tooltip>
                        </div>
                        <div className='flex justify-between items-end w-full'>
                            <div className='px-5 pt-5 w-full'>
                                <div className='flex justify-between items-center search'>
                                    <input type="text" placeholder={t('searchCode')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setSearchCode(e.target.value)} />
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                </div>
                            </div>
                            <div className='px-5 pt-5 w-full'>
                                <div className='flex justify-between items-center search'>
                                    <input type="text" placeholder={t('searchName')} className='w-full border-0 focus:ring-0 px-0' style={{ paddingBottom: '4px' }} onChange={(e) => setSearchName(e.target.value)} />
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: 'rgba(0,0,0,.54)' }}></i>
                                </div>
                            </div>
                            <div className='px-5 pt-5 w-full'>
                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                    <InputLabel>{t('search_by_blocked')}</InputLabel>
                                    <Select
                                        multiple
                                        value={selectedBlocked}
                                        onChange={handleChangePerson}
                                    >
                                        <MenuItem value={1}>Blocked</MenuItem>
                                        <MenuItem value={2}>Blocked for sales</MenuItem>
                                        <MenuItem value={3}>Blocked for purchase</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </div>
                    <div>
                        <TableShared items={filtered} columns={columns} />
                    </div>
                </div>
            </AppLayout>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('create_item')}</p>
                        </div>
                        <button type="button" onClick={createItem} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('create')}
                        </button>
                    </div>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab sx={{ textTransform: 'none' }} value="1" label={t('general')} icon={<i className="fa-solid fa-circle-info"></i>} iconPosition='start' />
                                <Tab sx={{ textTransform: 'none' }} value="2" label={t('planning')} icon={<i className="fa-solid fa-box-open"></i>} iconPosition='start' />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    <TextField type="text" variant='standard' label={t('no')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="item_no" value={itemNo} onChange={(e) => { setItemNo(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('description')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="description" value={description} onChange={(e) => { setDescription(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('description2')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="description2" value={additionalDesc} onChange={(e) => { setAdditionalDesc(e.target.value) }} />


                                    <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('units_of_measure')}</InputLabel>
                                        <Select defaultValue=" " value={unitOfMeasure} onChange={(e) => { setUnitOfMeasure(e.target.value) }}
                                            sx={{ ".MuiSelect-iconStandard": { display: unitOfMeasure ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                            endAdornment={unitOfMeasure ? (<IconButton sx={{ visibility: unitOfMeasure ? "visible" : "hidden", padding: '0' }} onClick={handleClearUOMClick}><ClearIcon /></IconButton>) : false}>
                                            {unitsofMeasure.map((item, index) => <MenuItem key={index} value={item.id}>{item.code}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <TextField type="text" variant='standard' label={t('unit_price')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="unitPrice" value={unitPrice} onChange={handleNumber} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />

                                    <label htmlFor="blocked" className='text-sm'>{t('blockedSales')}</label>
                                    <Switch checked={blockedSO} onChange={handleBlockedSO} inputProps={{ 'aria-label': 'controlled' }} />

                                    <label htmlFor="blocked" className='text-sm'>{t('blockedPurchase')}</label>
                                    <Switch checked={blockedPO} onChange={handleBlockedPO} inputProps={{ 'aria-label': 'controlled' }} />

                                    <label htmlFor="blocked" className='text-sm'>{t('blocked')}</label>
                                    <Switch checked={blocked} onChange={handleBlocked} inputProps={{ 'aria-label': 'controlled' }} />
                                </form>
                            </div>
                        </TabPanel>
                        <TabPanel value="2">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    {/* <div className="mb-5 flex gap-2 items-center">
                                        <label htmlFor="negative_inventory" className='text-sm'>{t('negative_inventory')}</label>
                                        <Checkbox checked={negativeInventory} onChange={e => setNegativeInventory(e.target.checked ? true : false)} />
                                    </div> */}

                                    <TextField type="text" variant='standard' label={t('minimum_stock_quantity')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="minimum_stock_quantity" value={minimumStockQuantity} onChange={e => handleQty(e)} onBlur={e => handleZeroRest(e)} />

                                    <div className="mb-5 flex gap-2 items-center">
                                        <Tooltip title={t('info-stock')} placement='bottom'>
                                            <i className="fa-solid fa-circle-info"></i>
                                        </Tooltip>
                                        <label htmlFor="stockout_warning" className='text-sm'>{t('stockout_warning')}</label>
                                        <Checkbox checked={stockoutWarning} onChange={e => setStockoutWarninig(e.target.checked ? true : false)} />
                                    </div>
                                </form>
                            </div>
                        </TabPanel>
                    </TabContext>
                </Box>
            </Modal>
        </>
    )
};

export default Items;

const ItemsActions = (params) => {

    const { t } = useTranslation()

    /* state */
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('1')


    /* fields */
    const [itemNo, setItemNo] = useState(params.params.row.item_no)
    const [description, setDescription] = useState(params.params.row.description)
    const [additionalDesc, setAdditionalDesc] = useState(params.params.row.description2 || '')
    const [unitOfMeasure, setUnitOfMeasure] = useState(params.params.row.unit_of_measure_id || '')
    const [unitPrice, setUnitPrice] = useState(params.params.row.unit_price || 0)
    const [blockedSO, setBlockedSO] = useState(params.params.row.blocked_for_sales ? true : false)
    const [blockedPO, setBlockedPO] = useState(params.params.row.blocked_for_purchases ? true : false)
    const [blocked, setBlocked] = useState(params.params.row.blocked ? true : false)
    const [minimumStockQuantity, setMinimumStockQuantity] = useState(params.params.row.minumum_stock_quantity || 1)
    const [negativeInventory, setNegativeInventory] = useState(params.params.row.can_hit_negative_inventory ? true : false)
    const [stockoutWarning, setStockoutWarninig] = useState(params.params.row.can_issue_stockout_warnings ? true : false)

    /* methods */
    const handleOpen = () => setOpen(true)
    const handleClose = () => {
        setOpen(false)
        setValue('1')
        setItemNo(params.params.row.item_no)
        setDescription(params.params.row.description)
        setAdditionalDesc(params.params.row.description2 || '')
        setUnitOfMeasure(params.params.row.unit_of_measure_id || '')
        setUnitPrice(params.params.row.unit_price || 0)
        setBlockedSO(params.params.row.blocked_for_sales ? true : false)
        setBlockedPO(params.params.row.blocked_for_purchases ? true : false)
        setBlocked(params.params.row.blocked ? true : false)
        setMinimumStockQuantity(params.params.row.minumum_stock_quantity || 1)
        setStockoutWarninig(params.params.row.can_issue_stockout_warnings ? true : false)
    }
    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    const handleBlocked = (event) => {
        setBlocked(event.target.checked);
    }
    const handleBlockedPO = (event) => {
        setBlockedPO(event.target.checked);
    }
    const handleBlockedSO = (event) => {
        setBlockedSO(event.target.checked);
    }
    const handleZero = (e) => {
        if (e.target.value === "") {
            setUnitPrice(0)
        }
    }
    const handleZeroRest = (e) => {
        if (e.target.value === "" || e.target.value < 1) {
            setMinimumStockQuantity(1)
        }
    }
    const deleteZero = (e) => {
        if (unitPrice === 0) {
            setUnitPrice('')
        }
    }
    const handleNumber = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value < 0 || e.target.value === '-') setUnitPrice(0)
            else setUnitPrice(e.target.value)
        }
    }
    const handleQty = (e) => {
        const regex = /^(-?\d*)((\.(\d{0,2})?)?)$/i
        if (regex.test(e.target.value)) {
            if (e.target.value === '-') setMinimumStockQuantity(1)
            else setMinimumStockQuantity(e.target.value)
        }
    }



    const updateItem = async (e) => {
        e.preventDefault();
        params.setIsLoading(true)
        const formData = {}

        formData['item_no'] = itemNo
        formData['description'] = description
        formData['description2'] = additionalDesc
        formData['unit_price'] = unitPrice
        formData['unit_of_measure_id'] = unitOfMeasure
        formData['blocked_for_sales'] = blockedSO
        formData['blocked_for_purchases'] = blockedPO
        formData['blocked'] = blocked
        /* formData['can_hit_negative_inventory'] = negativeInventory */
        formData['can_issue_stockout_warnings'] = stockoutWarning
        formData['minumum_stock_quantity'] = minimumStockQuantity
        formData['company_id'] = localStorage.getItem('company_id')

        await axios.put(`/api/items/${params.params.row.id}`, formData, params.config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            params.setIsLoading(false)
            setOpen(false)
            setValue("1")
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
            params.setIsLoading(false)
        })
    }


    const deleteItems = async (id) => {
        const isConfirm = await Swal.fire({
            title: t('title_delete') + t('del_item') + params.params.row.item_no + "?",
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
        await axios.delete(`/api/items/${id}`, params.config).then(({ data }) => {
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
    const handleClearUOMClick = () => {
        setUnitOfMeasure('')
    }

    return (
        <>
            <div className='flex justify-between'>
                <Tooltip title={t('edit')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={handleOpen}><i className="fa-solid fa-pencil"></i></span>
                    </div>
                </Tooltip>
                <Tooltip title={t('delete')} placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200" onClick={() => deleteItems(params.params.row.id)}><i className="fa-solid fa-trash"></i></span>
                    </div>
                </Tooltip>
            </div>
            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                        <div className='flex gap-4 items-baseline'>
                            <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                                <button onClick={handleClose}><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <p className='text-xl roboto font-semibold text-white'>{t('update_item')} - {params.params.row.item_no}</p>
                        </div>
                        <button type="button" onClick={updateItem} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                            {t('update')}
                        </button>
                    </div>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab sx={{ textTransform: 'none' }} value="1" label={t('general')} icon={<i className="fa-solid fa-circle-info"></i>} iconPosition='start' />
                                <Tab sx={{ textTransform: 'none' }} value="2" label={t('planning')} icon={<i className="fa-solid fa-box-open"></i>} iconPosition='start' />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    <TextField type="text" variant='standard' label={t('no')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="item_no" value={itemNo} onChange={(e) => { setItemNo(e.target.value) }} required disabled />

                                    <TextField type="text" variant='standard' label={t('description')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="description" value={description} onChange={(e) => { setDescription(e.target.value) }} required />

                                    <TextField type="text" variant='standard' label={t('description2')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="description2" value={additionalDesc} onChange={(e) => { setAdditionalDesc(e.target.value) }} />


                                    <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                        <InputLabel id="demo-simple-select-standard-label">{t('units_of_measure')}*</InputLabel>
                                        <Select value={unitOfMeasure} onChange={(e) => { setUnitOfMeasure(e.target.value) }}
                                            sx={{ ".MuiSelect-iconStandard": { display: unitOfMeasure ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                            endAdornment={unitOfMeasure ? (<IconButton sx={{ visibility: unitOfMeasure ? "visible" : "hidden", padding: '0' }} onClick={handleClearUOMClick}><ClearIcon /></IconButton>) : false}>
                                            {params.unitsofMeasure.map((item, index) => <MenuItem key={index} value={item.id}>{item.code}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <TextField type="text" variant='standard' label={t('unit_price')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="unitPrice" value={unitPrice} onChange={e => handleNumber(e)} onBlur={e => handleZero(e)} onFocus={e => deleteZero(e)} />

                                    <label htmlFor="blocked" className='text-sm'>{t('blockedSales')}</label>
                                    <Switch checked={blockedSO} onChange={handleBlockedSO} inputProps={{ 'aria-label': 'controlled' }} />

                                    <label htmlFor="blocked" className='text-sm'>{t('blockedPurchase')}</label>
                                    <Switch checked={blockedPO} onChange={handleBlockedPO} inputProps={{ 'aria-label': 'controlled' }} />

                                    <label htmlFor="blocked" className='text-sm'>{t('blocked')}</label>
                                    <Switch checked={blocked} onChange={handleBlocked} inputProps={{ 'aria-label': 'controlled' }} />
                                </form>
                            </div>
                        </TabPanel>
                        <TabPanel value="2">
                            <div>
                                <form className='flex justify-center flex-col items-start mt-2'>
                                    {/* <div className="mb-5 flex gap-2 items-center">
                                        <label htmlFor="negative_inventory" className='text-sm'>{t('negative_inventory')}</label>
                                        <Checkbox checked={negativeInventory} onChange={e => setNegativeInventory(e.target.checked ? true : false)} />
                                    </div> */}

                                    <TextField type="text" variant='standard' label={t('minimum_stock_quantity')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="minimum_stock_quantity" value={minimumStockQuantity} onChange={e => handleQty(e)} onBlur={e => handleZeroRest(e)} />

                                    <div className="mb-5 flex gap-2 items-center">
                                        <Tooltip title={t('info-stock')} placement='bottom'>
                                            <i className="fa-solid fa-circle-info"></i>
                                        </Tooltip>
                                        <label htmlFor="stockout_warning" className='text-sm'>{t('stockout_warning')}</label>
                                        <Checkbox checked={stockoutWarning} onChange={e => setStockoutWarninig(e.target.checked ? true : false)} />
                                    </div>
                                </form>
                            </div>
                        </TabPanel>
                    </TabContext>
                </Box>
            </Modal>
        </>
    )
}
