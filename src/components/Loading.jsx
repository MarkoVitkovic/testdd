import React from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import style from '../styles/style';

const Loading = () => {
  return (
    <div style={style} className='flex justify-center items-center whole'>
        {/* <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div> */}
        <CircularProgress size={80} />
    </div>
  )
}

export default Loading
