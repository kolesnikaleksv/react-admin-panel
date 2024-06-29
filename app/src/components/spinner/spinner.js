import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const Spinner = ({acitve}) => {
  return (
    <div className={acitve ? "spinner active": "spinner"}>
      <CircularProgress color="success" />
    </div>
  )
}

export default Spinner;