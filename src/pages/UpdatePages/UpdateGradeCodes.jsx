import React, { useState, useEffect } from 'react'

import { useParams } from "react-router-dom"
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from '../../lib/axios'
import Swal from 'sweetalert2'
import { Box, TextField } from '@mui/material'

import Loading from '../../components/Loading'
import { useStateContext } from '../../context/ContextProvider'

const UpdateGradeCodes = () => {

    const { t } = useTranslation()
    const { config } = useStateContext()
    const params = useParams()
    const [isLoading, setIsLoading] = useState(false)

    /* fields */
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        getCodes(params.id)
    }, [params.id])

    const getCodes = async (id) => {
        await axios.get(`/api/grade-codes/${id}`, config)
            .then(res => {
                const salesOrder = res.data
                setCode(salesOrder.code)
                setDescription(salesOrder.description)
            })
    }

    const updateItem = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const formData = {}

        formData['code'] = code
        formData['description'] = description


        await axios.put(`/api/grade-codes/${params.id}`, formData, config).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.success.message
            })
            setIsLoading(false)
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

    return (
        <>
            {isLoading ? <Loading /> : ''}
            <Box>
                <div className='flex justify-between items-center p-5 pr-0 pt-0 pb-0' style={{ backgroundColor: '#336195', borderRadius: '5px 5px 0 0' }}>
                    <div className='flex gap-4 items-baseline'>
                        <div style={{ transform: "rotate(45deg)" }} className="font-semibold text-white">
                            <Link to="/grade-codes"><i className="fa-solid fa-plus"></i></Link>
                        </div>
                        <p className='text-xl roboto font-semibold text-white'>{t('update_grade_code')} - {code}</p>
                    </div>
                    <button type="button" onClick={updateItem} className='text-white px-4 py-6 uppercase self-end roboto bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400'>
                        {t('update')}
                    </button>
                </div>

                <div className='p-5'>
                    <form className='flex justify-center flex-col items-start mt-2'>
                        <TextField type="text" variant='standard' label={t('code')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="code" value={code} onChange={(e) => { setCode(e.target.value) }} required />

                        <TextField type="text" variant='standard' label={t('description')} sx={{ marginBottom: '20px' }} className='w-full mb-5 px-0 pt-0' name="description" value={description} onChange={(e) => { setDescription(e.target.value) }} required />
                    </form>
                </div>

            </Box>
        </>
    )
}

export default UpdateGradeCodes
