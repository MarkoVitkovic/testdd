import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'

const TableShared = ({ items, columns }) => {

    const [pageSize, setPageSize] = useState(10)
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()

    useEffect(() => {
        checkLoading()
    }, [items])

    const checkLoading = () => {
        if(items.length > 0) {
            setLoading(false)
        }
        else setTimeout(() => {
            setLoading(false)
        }, 2000);
    }



    const localizedTextsMap = {
        columnMenuUnsort: t('unsort'),
        columnMenuSortAsc: t('sortAsc'),
        columnMenuSortDesc: t('sortDesc'),
        columnMenuFilter: t('filter'),
        columnMenuHideColumn: t('hide'),
        columnMenuShowColumns: t('showCol'),
        MuiTablePagination: {
            labelRowsPerPage: t('rowsPerPage'),
            labelDisplayedRows: ({ from, to, count }) =>
                `${from} - ${to} ${t('of')} ${count}`,

        },
        noRowsLabel: t('noRows')
    }

    return (
        <div className='shadow-md'>
            <Box sx={{ width: '100%' }}>
                <DataGrid
                    loading={loading}
                    autoHeight
                    rows={items}
                    columns={columns}
                    pageSize={pageSize}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    rowsPerPageOptions={[10, 15]}
                    disableSelectionOnClick
                    experimentalFeatures={{ newEditingApi: true }}
                    localeText={localizedTextsMap}
                />
            </Box>
        </div>
    )
}

export default TableShared
