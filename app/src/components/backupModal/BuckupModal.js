import React from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const BackupModal = ({closeModal, openPage, data, redirect}) => {

  return (
    <Dialog
      open={openPage}
      onClose={closeModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      >
    <DialogTitle id="alert-dialog-title">
      {"Open?"}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {(data.length < 1) ? "Bank of backups is empty" : "Choose your prefered backup"}
      </DialogContentText>
      <List>
        {
          data.map(elem => {
            return (
              <ListItem key={elem.file} disablePadding>
                <ListItemButton component="a" href="#" onClick={(e) => {
                  redirect(e, elem.file);
                  closeModal();
                }}>
                  <ListItemText primary={`Copy of: ${elem.time}`} />
                </ListItemButton>
              </ListItem>
            )
          })
        }
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeModal}>Cancel</Button>
    </DialogActions>
  </Dialog>
  )
}

export default BackupModal;