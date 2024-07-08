import React from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const LogoutModal = ({closeModal, openCloseLogout, logout}) => {
  const handleAgreeClick = () => {
    logout();
    closeModal();
  };
  return (
    <Dialog
      open={openCloseLogout}
      onClose={closeModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      >
      <DialogTitle id="alert-dialog-title">
        {"Saving changes"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure that you want to leave admit panel?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Disagree</Button>
        <Button 
          onClick={handleAgreeClick}
          autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LogoutModal;