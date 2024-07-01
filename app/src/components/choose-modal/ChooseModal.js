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

const ChooseModal = ({closeModal, method, openPage, data, redirect}) => {

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
        Choose your prefered page
      </DialogContentText>
      <List>
        {
          data.map(elem => {
            return (
              <ListItem key={elem} disablePadding>
                <ListItemButton component="a" href="#" onClick={(e) => {
                  redirect(e, elem);
                  closeModal();
                }}>
                  <ListItemText primary={elem} />
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

export default ChooseModal;