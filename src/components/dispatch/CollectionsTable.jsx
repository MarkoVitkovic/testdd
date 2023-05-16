import * as React from 'react'
import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useTranslation } from "react-i18next"
import TablePagination from "@mui/material/TablePagination";
import { t } from 'i18next'
import dayjs from 'dayjs'
import CircularProgress from '@mui/material/CircularProgress';
import { useDrag, useDrop } from "react-dnd";
import Swal from 'sweetalert2'
import CallReceivedIcon from '@mui/icons-material/CallReceived'

import { COLUMN_NAMES } from "../../constants/constants"
import axios from '../../lib/axios'
import { useStateContext } from '../../context/ContextProvider'




function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false)

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: COLUMN_NAMES.COLLECTIONS,
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
            item: () => {
                return { ...row, index: 0 }
            }
        }),
        [],
    )

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset !important' } }} ref={drag}>
                <TableCell sx={{ padding: '8px 16px' }}>{row.po_number}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.vendor_name}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.purchase_address_name}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{<ShowDate date={row.requested_collection_date} />}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell style={{ padding: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ padding: '8px 16px' }}>
                            <div className='flex justify-between'>
                                <p>{t('customer_bol')}: {row.customer_bol_no}</p>
                                <p>{t('pickup_trailer_no')}: {row.pickup_trailer_no || '-'}</p>
                            </div>
                            <div>
                                <p className='font-bold text-xl pt-2 pb-2'>{t('items')}</p>
                                <div>
                                    {
                                        row.purchase_order_items.map((item, index) => (
                                            <div key={index} className='flex justify-between'>
                                                <p className='pb-1'>{item.item_no}, {item.description}</p>
                                                <p>{t('quantity_ordered')}: {item.qty_ordered}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </>
    );
}

export default function CollapsibleTable({ items, setIsLoading }) {

    const { t } = useTranslation()

    const [pg, setpg] = React.useState(0);
    const [rpg, setrpg] = React.useState(10);
    const [loading, setLoading] = useState(true)
    const { config } = useStateContext()

    const [, drop] = useDrop(
        () => ({
            accept: COLUMN_NAMES.COLLECTIONS,
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
                canDrop: !!monitor.canDrop()
            }),
            drop: (item) => updateStatus(item)
        }),
        [],
    )

    const updateStatus = async (item) => {

        setIsLoading(true)
        const formData = {}
        let type = ''

        if (item.order_type === "SHIPMENTS") {
            type = "sales-orders"
        }
        else {
            type = "purchase-orders"
        }

        formData['driver_id'] = null

        await axios.post(`/api/${type}/${item.id}/assign-driver`, formData, config).then(({ data }) => {
            setIsLoading(false)
        }).catch(({ response }) => {
            if (response.status === 422) {
                Swal.fire({
                    text: response.data.error.description,
                    icon: "error"
                })
            } else {
                Swal.fire({
                    text: response.data.error.description,
                    icon: "error"
                })
            }
            setIsLoading(false)
        })
    }

    useEffect(() => {
        checkLoading()
    }, [items])

    const checkLoading = () => {
        if (items.length > 0) {
            setLoading(false)
        }
        else setTimeout(() => {
            setLoading(false)
        }, 2000);
    }

    function handleChangePage(event, newpage) {
        setpg(newpage);
    }

    function handleChangeRowsPerPage(event) {
        setrpg(parseInt(event.target.value, 10));
        setpg(0);
    }

    return (
        <>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table aria-label="collapsible table" stickyHeader ref={drop}>
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <div className='flex justify-between'>
                                        {t('collections')}
                                        <span style={{ color: '#b7472a' }}>
                                            <CallReceivedIcon />
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length <= 0 ? loading ?
                                <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center' }}><CircularProgress /></TableCell></TableRow> :
                                <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center' }}>No data</TableCell></TableRow> : null}
                            {items?.slice(pg * rpg, pg *
                                rpg + rpg).map((row, index) => (
                                    <Row key={row.id} row={row} />
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 15]}
                    component="div"
                    count={items.length}
                    rowsPerPage={rpg}
                    page={pg}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </>
    );
}

const ShowDate = ({ date }) => {

    const date1 = new Date(dayjs(date).format("YYYY-MM-DD"))
    const date2 = new Date(dayjs().format("YYYY-MM-DD"))

    return (
        <div>
            {
                date1 < date2 ? <p style={{ color: 'red', border: '1px solid red', padding: '5px', borderRadius: '15px', lineHeight: '1', width: 'fit-content' }}>{dayjs(date).format("YYYY-MM-DD")}</p> :
                    date1 == date2 ? <p style={{ color: 'blue', border: '1px solid blue', padding: '5px', borderRadius: '15px', lineHeight: '1', width: 'fit-content' }}>{dayjs(date).format("YYYY-MM-DD")}</p> :
                        date1 > date2 ? <p style={{ color: 'green', border: '1px solid green', padding: '5px', borderRadius: '15px', lineHeight: '1', width: 'fit-content' }}>{dayjs(date).format("YYYY-MM-DD")}</p> :
                            <p style={{ color: 'blue', border: '1px solid blue', padding: '5px', borderRadius: '15px', lineHeight: '1', width: 'fit-content' }}>{dayjs(date).format("YYYY-MM-DD")}</p>
            }
        </div>
    )
}
