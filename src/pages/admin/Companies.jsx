import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'

import AppLayout from '../../components/Layouts/AppLayout'
import { useStateContext } from '../../context/ContextProvider'
import TableShared from '../../components/TableShared'


const Companies = () => {

    const { t } = useTranslation()
    const { companies } = useStateContext()

    const columns = [
        {
            field: 'name',
            headerName: t('name'),
            flex: 1
        },
        {
            field: 'address',
            headerName: t('address'),
            flex: 1
        },
        {
            field: 'city',
            headerName: t('city'),
            flex: 1
        },
        {
            field: 'state',
            headerName: t('state'),
            flex: 1
        },
        {
            field: 'zip',
            headerName: t('zip'),
            flex: 1
        }
    ]


    return (
        <AppLayout>
            <div className='p-5'>
                <div>
                    <TableShared items={companies} columns={columns}/>
                </div>
            </div>
        </AppLayout>
    )

}

export default Companies
