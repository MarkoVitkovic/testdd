import React, { useState, useEffect } from 'react'

import { Modal, Box, FormControl, Select, InputLabel, MenuItem, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import Swal from 'sweetalert2';

import axios from '../../lib/axios'
import { useStateContext } from '../../context/ContextProvider'


const AssignForklifter = ({ open, setOpen, orderId }) => {

    const { t } = useTranslation()
    const { choosesite, setChoosesite, config } = useStateContext()

    const [forklifters, setForklifters] = useState([])
    const [forklifter, setForklifter] = useState('')
    const [disabled, setDisabled] = useState(true)

    useEffect(() => {
        setChoosesite(localStorage.getItem('site'))
    }, [])

    useEffect(() => {
        if (open) {
            getForklifters()
        }
    }, [open])

    useEffect(() => {
        if(forklifter) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [forklifter])

    const getForklifters = async () => {
        await axios.get(`/api/users?role=forklift_driver&site_id=${choosesite}`, config)
            .then(res => {
                const users = res.data
                setForklifters(users)
            })
    }


    const handleToogleModal = () => {
        setForklifter('')
        setOpen(!open)
    }

    const handleClear = () => {
        setForklifter('')
    }

    const assignForklifter = async(e) => {
        e.preventDefault()
        const formData = {}

        formData['forklifter_id'] = forklifter

        await axios.post(`/api/sales-orders/${orderId}/assign-forklifter`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setOpen(false)
        }).catch(({ response }) => {
            if (response.status === 422) {
                Swal.fire({
                    text: response.data.error.message,
                    icon: "error"
                })
            } else {
                Swal.fire({
                    text: response.data.error.message,
                    icon: "error"
                })
            }
        })
    }



    return (
        <Modal open={open} onClose={handleToogleModal}>
            <Box sx={style}>
                <div className='p-5' style={{ backgroundColor: '#df9133', borderRadius: '5px 5px 0 0' }}>
                    <div className='flex gap-4 items-baseline'>
                        {/* <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                            <button onClick={handleToogleModal}><i className="fa-solid fa-plus"></i></button>
                        </div> */}
                        <p className='text-xl roboto font-semibold text-white'>{t('select_forklift_driver')}</p>
                    </div>
                </div>
                <div>
                    <div className='p-5'>
                        <form className='flex justify-center flex-col items-start mt-2'>
                            <FormControl variant="standard" sx={{ width: '100%', marginBottom: '20px' }}>
                                <InputLabel id="demo-simple-select-standard-label">{t('select_forklift_driver')}</InputLabel>
                                <Select value={forklifter} onChange={e => { setForklifter(e.target.value) }}
                                    sx={{ ".MuiSelect-iconStandard": { display: forklifter ? 'none !important' : '' }, "&.Mui-focused .MuiIconButton-root": { color: 'rgba(0,0,0,.42)' } }}
                                    endAdornment={forklifter ? (<IconButton sx={{ visibility: forklifter ? "visible" : "hidden", padding: '0' }} onClick={handleClear}><ClearIcon /></IconButton>) : false}
                                >
                                    {
                                        forklifters.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)
                                    }
                                </Select>
                            </FormControl>
                        </form>
                        <div className='flex justify-end gap-4'>
                            <Button variant="contained" onClick={assignForklifter} sx={{ backgroundColor: '#df9133', "&:disabled": { backgroundColor: "[hsla(0,0%,100%,.12)]"} }} disabled={disabled}>{t('ok')}</Button>
                            <Button variant="contained" style={{ backgroundColor: '#df9133' }} onClick={handleToogleModal}>{t('close')}</Button>
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default AssignForklifter

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    height: 'fit-content',
    bgcolor: '#ffffff',
    border: 'transparent',
    borderRadius: '5px',
    boxShadow: 24,
    zIndex: "1600",
    outline: 'none'
}
