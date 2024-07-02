import React from "react";
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Spinner from "../spinner/spinner";

const Panel = ({alert, message, openPage, openDialog, openCloseBackup}) => {
  return (
    <div className="panel">
      <Spinner />
      {alert ? <Alert className="alert-success" variant="outlined" severity={alert}>
        {message}
      </Alert> : <></>}
      <Button variant="outlined" onClick={openPage}>
        Open
      </Button>
      <Button variant="outlined" onClick={openDialog}>
        Publish changes
      </Button>
      <Button variant="contained" onClick={openCloseBackup}>
        Backup
      </Button>
    </div>
  )
}

export default Panel;