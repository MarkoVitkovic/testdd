import React, { useRef, useState } from 'react'

import { useTranslation } from "react-i18next";
import Swal from 'sweetalert2'

import AppLayout from '../../components/Layouts/AppLayout'
import Button from '../../components/Button';
import axios from '../../lib/axios'
import { useStateContext } from '../../context/ContextProvider';


const Import = () => {

    const { t } = useTranslation()
    const { config } = useStateContext()

    /* state */
    const [fileName, setFileName] = useState()
    const hiddenFileInput = useRef(null)
    const [errors, setErrors] = useState([])
    const [display, setDisplay] = useState('none')

    /* methods */
    const handleClick = event => {
        hiddenFileInput.current.click()

    }

    const handleDelete = event => {
        setDisplay('none')
        hiddenFileInput.current.value = ""
    }

    const handleChange = event => {
        const fileUploaded = event.target.files[0];
        setDisplay('block')
        setFileName(fileUploaded.name)
        importFile(fileUploaded)
        hiddenFileInput.current.value = ""
    }

    const importFile = async (fileUploaded) => {

        const formData = new FormData()

        formData.append('file', fileUploaded)

        await axios.post(process.env.REACT_APP_BACKEND_URL + `/api/users/import`, formData, config).then((data) => {
            Swal.fire({
                icon: "success",
                text: data.data.success.message
            })
        }).catch(({ response }) => {
            if (response.status === 422) {
                setErrors(response.data.error.message)
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
        <AppLayout>

            <div className='p-5'>
                <div className='pb-5 shadow-md mb-2 rounded-md'>
                    <div className='flex justify-start items-center gap-4 '>
                        <p className='font-bold roboto pl-5 color-fake py-3 text-xl'>{t('import_users')}</p>
                    </div>
                    <div className='px-5 pt-5 w-full'>
                        <div className='flex gap-2'><p className='pb-2 text-sky-700' style={{display: display}}>{fileName}</p> <button onClick={handleDelete} className='pb-2 text-red-600' style={{display: display}}>x</button></div>
                        <Button onClick={handleClick} className="uppercase roboto" sx={{ backgroundColor: '#607d8b', "&:hover": {backgroundColor: '#6c8794'} }}>{t("import_users")}</Button>
                    </div>
                    <input type="file" ref={hiddenFileInput} onChange={handleChange} style={{ display: 'none' }} />
                </div>
            </div>
        </AppLayout>
    )

}

export default Import
