import React, {useState, useEffect} from 'react'
import { Tooltip } from '@mui/material'
import { useTranslation } from "react-i18next"
import { ShowDate } from '../DailyBoardTablePurchase'
import AddButton from '../AddButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import TablePagination from "@mui/material/TablePagination";
import Collapse from '@mui/material/Collapse'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress';
import { useStateContext } from '../../context/ContextProvider'
import Swal from 'sweetalert2'
import styles from './Assigned.module.css'

function Row(props) {
    const { t } = useTranslation()

    const { row } = props;
    const [open, setOpen] = React.useState(false)
    const [highlight, setHighlight] = React.useState(false)
    const { config } = useStateContext()

    const highlightRowHandler = (highlight) => {
        setHighlight(highlight)
    }

    const clickAcceptShipmentButtonHandler = () => {
        setHighlight(true)
    }

    return (
        <React.Fragment >
            <TableRow selected={highlight} sx={{ '& > *': { borderBottom: 'unset !important' } }}>
                <TableCell sx={{ padding: '8px 16px' }}>
                    {
                        <AcceptCollectionButton onClick={clickAcceptShipmentButtonHandler} highlightRow={highlightRowHandler} id={row.id} config={config} />
                    }
                </TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.po_number}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.drop_trailer_no}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.vendor_name}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.address}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.city}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.state}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{<ShowDate date={row.requested_collection_date} />}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>{row.po_status_name}</TableCell>
                <TableCell sx={{ padding: '8px 16px' }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell style={{ padding: 0 }} colSpan={10}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{fontSize: "0.8rem"}}>
                                        <TableCell sx={{ width: '5%', fontSize: "inherit" }}/>
                                        <TableCell sx={{ width: '19%', fontSize: "inherit" }}>{t('item_no')}</TableCell>
                                        <TableCell sx={{ width: '27%', fontSize: "inherit" }}>{t('description')}</TableCell>
                                        <TableCell sx={{ width: '24.5%', fontSize: "inherit" }}>{t('qty_ordered')}</TableCell>
                                        <TableCell sx={{ width: '24.5%', fontSize: "inherit" }}>{t('vendor_count')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.purchase_order_items.map((historyRow) => (
                                        <TableRow key={historyRow.id}>
                                            <TableCell />
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.item_no}</TableCell>
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.description}</TableCell>
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.qty_ordered}</TableCell>
                                            <TableCell sx={{ padding: '8px 16px' }}>{historyRow.vendor_count}</TableCell>
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

const AcceptCollectionButton = (props) => {
    const { t } = useTranslation()

    const acceptCollectionHandler = async () => {
        props.onClick()

        Swal.fire({
            title: "Do you want to accept this load?",
            showDenyButton: true,
            confirmButtonText: "Yes",
            denyButtonText: "No",
            customClass: {
                confirmButton: styles.collection,
                denyButton: styles.deny,
            }
        }).then((result) => {
            if(result.isConfirmed) {
                props.highlightRow(false)
            } else if(result.isDenied || result.isDismissed) {
                props.highlightRow(false)
            }
        })
    }

    return (
        <AddButton hasTooltip={true} tooltipTitle={t('accept_collection')} onClick={acceptCollectionHandler}>
            <span style={{ color: '#b7472a', fontSize: '22px', transform: 'rotate(225deg)' }} className="flex items-center justify-center">
                <i className="fa-solid fa-arrow-up-long"></i>
            </span>
        </AddButton>
    )
}

export default function CollapsibleTable({ collections }) {
    const { t } = useTranslation()

    const [pg, setpg] = React.useState(0);
    const [rpg, setrpg] = React.useState(10);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkLoading()
    }, [collections])

    const checkLoading = () => {
        if (collections.length > 0) {
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
                            <TableRow sx={{fontSize: "0.8rem"}}>
                                <TableCell sx={{ width: '5%', fontSize: "inherit" }}/>
                                <TableCell sx={{ width: '9.5%', fontSize: "inherit" }}>{t('order_no')}</TableCell>
                                <TableCell sx={{ width: '9.5%', fontSize: "inherit" }}>{t('trailer_no')}</TableCell>
                                <TableCell sx={{ width: '12%', fontSize: "inherit" }}>{t('vendor')}</TableCell>
                                <TableCell sx={{ width: '15%', fontSize: "inherit" }}>{t('address')}</TableCell>
                                <TableCell sx={{ width: '12%', fontSize: "inherit" }}>{t('city')}</TableCell>
                                <TableCell sx={{ width: '6%', fontSize: "inherit" }}>{t('state')}</TableCell>
                                <TableCell sx={{ width: '14%', fontSize: "inherit" }}>{t('requested_collection_date')}</TableCell>
                                <TableCell sx={{ width: '12%', fontSize: "inherit" }}>{t('status')}</TableCell>
                                <TableCell sx={{ width: '5%', fontSize: "inherit" }}/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {collections.length <= 0 ? loading ?
                                <TableRow><TableCell colSpan={10} sx={{ textAlign: 'center' }}><CircularProgress /></TableCell></TableRow> :
                                <TableRow><TableCell colSpan={10} sx={{ textAlign: 'center' }}>No data</TableCell></TableRow> : null}
                            {collections?.slice(pg * rpg, pg *
                                rpg + rpg).map((row) => (
                                    <Row key={row.id} row={row} />
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 15]}
                    component="div"
                    count={collections.length}
                    rowsPerPage={rpg}
                    page={pg}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </>
    );
}
