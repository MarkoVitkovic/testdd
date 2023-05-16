/* This code is a React component that displays a list of sites in a data grid.
It uses the React Hooks useState and useEffect to set the initial state of
the component and to perform an API call when the component mounts. It also uses
the useTranslation hook to get translations for the header name, as well as
the useAuth hook to get authentication information. The API call is
made using axios, and it gets data from an endpoint */

import React from 'react'

import { useTranslation } from 'react-i18next'

import AppLayout from '../../components/Layouts/AppLayout'
import { useStateContext } from '../../context/ContextProvider'
import TableShared from '../../components/TableShared'


const Sites = () => {

    const { t } = useTranslation()
    const { allSites } = useStateContext()

    const columns = [
        {
            field: 'code',
            headerName: t('code'),
            flex: 0.5
        },
        {
            field: 'name',
            headerName: t('name'),
            flex: 1
        },
        {
            field: 'companyName',
            headerName: t('company'),
            flex: 1,
            valueGetter: (params) => {
                return params.row.company.name;
            }
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
            flex: 0.5
        },
        {
            field: 'zip',
            headerName: t('zip'),
            flex: 0.5
        },
        {
            field: 'phone',
            headerName: t('contact'),
            flex: 1
        }
    ]



    return (
        <AppLayout>

            <div className='p-5'>
                <div>
                    <TableShared items={allSites} columns={columns} />
                </div>
            </div>
        </AppLayout>
    )

}

export default Sites

