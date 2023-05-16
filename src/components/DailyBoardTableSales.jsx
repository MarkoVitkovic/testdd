import * as React from 'react'
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
import { Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'
import TablePagination from "@mui/material/TablePagination";
import { t } from 'i18next'
import dayjs from 'dayjs'
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useEffect } from 'react'
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import AssignForklifter from './sales_purchase_orders/AssignForklifter'



function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false)

    return (
        <React.Fragment >
            <TableRow sx={{ '& > *': { borderBottom: 'unset !important' } }}>
                <TableCell sx={{ padding: '8px 16px' }}>{row.so_number}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.customer_name}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{<ShowDate date={row.requested_delivery_date} />}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.so_status_name}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>
                    {
                        <TodaysSalesOrderAction id={row.id} status={row.so_status_id} />
                    }
                </TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell style={{ padding: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '20%' }}>{t('item_no')}</TableCell>
                                        <TableCell sx={{ width: '50%' }}>{t('description')}</TableCell>
                                        <TableCell sx={{ width: '10%' }}>{t('quantity_ordered')}</TableCell>
                                        <TableCell sx={{ width: '10%' }}>{t('quantity_to_ship')}</TableCell>
                                        <TableCell sx={{ width: '10%' }}>{t('quantity_shipped')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.sales_order_items.map((historyRow) => (
                                        <TableRow key={historyRow.id}>
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.item_no}</TableCell>
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.description}</TableCell>
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.qty_ordered}</TableCell>
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.qty_to_ship}</TableCell>
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.qty_shipped}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </React.Fragment>
    );
}

export default function CollapsibleTable({ items }) {

    const { t } = useTranslation()

    const [pg, setpg] = React.useState(0);
    const [rpg, setrpg] = React.useState(10);
    const [loading, setLoading] = useState(true)

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
                    <Table aria-label="collapsible table" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '20%' }}>{t('sales_order_no')}</TableCell>
                                <TableCell sx={{ width: '20%' }}>{t('customer_name')}</TableCell>
                                <TableCell sx={{ width: '30%' }}>{t('requested_delivery_date')}</TableCell>
                                <TableCell sx={{ width: '10%' }}>{t('status')}</TableCell>
                                <TableCell sx={{ width: '10%' }}>{t('actions')}</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length <= 0 ? loading ?
                                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center' }}><CircularProgress /></TableCell></TableRow> :
                                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center' }}>No data</TableCell></TableRow> : null}
                            {items?.slice(pg * rpg, pg *
                                rpg + rpg).map((row) => (
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


const TodaysSalesOrderAction = ({ id, status }) => {

    const { t } = useTranslation()

    const [open, setOpen] = useState(false)

    const openPopup = () => {
        setOpen(!open)
    }

    return (
        <>
            <div className='flex gap-1'>
                <Tooltip title="BOL/POD" placement='top'>
                    <div style={{ color: 'rgba(0,0,0,.54)' }}>
                        <a href={process.env.REACT_APP_BACKEND_URL + `/api/sales-orders/${id}/proof-of-delivery`} target="_blank"><span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200"><i className="fa-solid fa-print"></i></span></a>
                    </div>
                </Tooltip>
                {status === 1 || status === 3 ?
                    (<Tooltip title={t('update')} placement='top'>
                        <div style={{ color: 'rgba(0,0,0,.54)' }}>
                            <Link to={`${id}`}><span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200"><i className="fa-solid fa-pencil"></i></span></Link>
                        </div>
                    </Tooltip>)
                    :
                    (<Tooltip title={t('open')} placement='top'>
                        <div style={{ color: 'rgba(0,0,0,.54)' }}>
                            <Link to={`${id}`}><span style={{ cursor: 'pointer' }} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200"><i className="fa-solid fa-eye"></i></span></Link>
                        </div>
                    </Tooltip>)
                }
                {status === 2 ?
                    (<Tooltip title={t('assign_forklifter')} placement='top'>
                        <div style={{ color: 'rgba(0,0,0,.54)' }}>
                            <span style={{ cursor: 'pointer' }} onClick={openPopup} className="flex justify-center items-center hover:rounded-full icons p-2 hover:bg-zinc-200"><VerticalAlignTopIcon /></span>
                        </div>
                    </Tooltip>)
                    :
                    ''
                }
            </div>
            <AssignForklifter open={open} setOpen={setOpen} orderId={id} />
        </>
    )
}

export const ShowDate = ({ date }) => {

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
