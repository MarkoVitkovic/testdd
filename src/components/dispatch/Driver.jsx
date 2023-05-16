import React, { useEffect, useRef, useState } from 'react'

import { useDrag, useDrop } from "react-dnd"
import update from 'immutability-helper'
import CallMadeIcon from '@mui/icons-material/CallMade'
import CallReceivedIcon from '@mui/icons-material/CallReceived'

import { COLUMN_NAMES } from '../../constants/constants'
import ViewOrder from './ViewOrder'

const Driver = ({ type, shipments, index, driverItems, setDriverItems }) => {


    const ref = useRef(null)
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
        setOpen(!open)
    }

    useEffect(() => {
        console.log(driverItems);
    }, [driverItems])


    /* const [, drop] = useDrop(
        () => ({
            accept: [COLUMN_NAMES.SHIPMENTS, COLUMN_NAMES.COLLECTIONS],
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
                canDrop: !!monitor.canDrop(),
            }),
            hover(item, monitor) {

                console.log(ref.current);
                if (!ref.current) {
                    return;
                }
                const dragIndex = item.index;
                const hoverIndex = index;
                // Don't replace driverItems with themselves
                if (dragIndex === hoverIndex) {
                    return;
                }
                // Determine rectangle on screen
                const hoverBoundingRect = ref.current?.getBoundingClientRect();
                // Get vertical middle
                const hoverMiddleY =
                    (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
                // Determine mouse position
                const clientOffset = monitor.getClientOffset();
                // Get pixels to the top
                const hoverClientY = clientOffset.y - hoverBoundingRect.top;
                // Only perform the move when the mouse has crossed half of the driverItems height
                // When dragging downwards, only move when the cursor is below 50%
                // When dragging upwards, only move when the cursor is above 50%
                // Dragging downwards
                if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                    return;
                }
                // Dragging upwards
                if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                    return;
                }
                // Time to actually perform the action
                moveCard(dragIndex, hoverIndex)
                // Note: we're mutating the monitor item here!
                // Generally it's better to avoid mutations,
                // but it's good here for the sake of performance
                // to avoid expensive index searches.
                item.index = hoverIndex;
            }
        }),
        [driverItems],
    ) */

/*
    const moveCard = (dragIndex, hoverIndex) => {
        const dragItem = driverItems[dragIndex];
        console.log("item koji povlacimi");

        if(dragItem) {
            setDriverItems((prevState) => {
                update(prevState, {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, prevState[dragIndex]]
                    ]
                })
            })
        }
    } */

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: type,
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
            item: () => {
                return { ...shipments, index: 0 }
            }
        }),
        [],
    )


    return (
        <>
            <div ref={shipments.so_status_id == '8' ? null : drag} onClick={handleOpen} style={{ opacity: isDragging ? 0.5 : 1 }} className={`p-4 flex justify-between hover:bg-[#f6f6f6] ${shipments.so_status_id == '8' ? '' : 'cursor-pointer'}`}>
                <p>{shipments.so_number || shipments.po_number} - index = {index} </p>
                {
                    shipments.order_type === 'SHIPMENTS' ?
                        shipments.so_status_id != '8' ?
                            <span style={{ color: '#336195' }}>
                                <CallMadeIcon />
                            </span>
                            :
                            <span className='arrow-up' style={{ color: '#336195' }}>
                                <CallMadeIcon />
                            </span>
                        :
                        shipments.po_status_id != '2' ?
                            <span style={{ color: '#b7472a' }}>
                                <CallReceivedIcon />
                            </span>
                            :
                            <span className='arrow-down' style={{ color: '#b7472a' }}>
                                <CallReceivedIcon />
                            </span>
                }
            </div>
            <ViewOrder order={shipments} open={open} handleOpen={handleOpen} />
        </>
    )
}

export default Driver
