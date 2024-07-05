import React, { Component, createElement } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

export default class EditorMeta extends Component {
  constructor(props) {
    super(props)

    this.state = {
      meta: {
        title: '',
        keywords: '',
        description: ''
      }
    }
  }

  componentDidMount() {
    this.getMeta(this.props.virtualDom);
  }

  componentDidUpdate(prevProps) {
    if(this.props.virtualDom !== prevProps.virtualDom) {
      this.getMeta(this.props.virtualDom)
    }
  }

  getMeta(virtualDom) {
     this.title = virtualDom.head.querySelector('title') || virtualDom.head.appendChild(virtualDom.createElement('title'));
     this.keywords = virtualDom.head.querySelector('meta[name="keywords"]');
    if(!this.keywords) {
      this.keywords = virtualDom.head.appendChild(virtualDom.createElement('meta'));
      this.keywords.setAttribute('name', 'keywords');
      this.keywords.setAttribute('content', '');

    }

     this.description = virtualDom.head.querySelector('meta[name="description"]');
    if(!this.description) {
      this.description = virtualDom.head.appendChild(virtualDom.createElement('meta'));
      this.description.setAttribute('name', 'description');
      this.keywords.setAttribute('content', '');
    }


    this.setState({
      meta: {
        title: this.title.innerHTML,
        keywords: this.keywords.getAttribute("content"),
        description: this.description.getAttribute("content")
      }
    })
  }

  applyMeta() {
    this.title.innerHTML = this.state.meta.title;
    this.keywords.setAttribute('content', this.state.meta.keywords);
    this.description.setAttribute('content', this.state.meta.description);
  }

  onValueChange(e) {
    console.log(e.target.id)
    if(e.target.id === 'meta-title') {
      e.persist();
      this.setState(({meta}) => {
        const newMeta = {
          ...meta,
          title: e.target.value
        }
        return {
          meta: newMeta
        }
      })
    } else if(e.target.id === 'meta-key') {
      e.persist();
      this.setState(({meta}) => {
        const newMeta = {
          ...meta,
          keywords: e.target.value
        }
        return {
          meta: newMeta
        }
      })
    } else {
      this.setState(({meta}) => {
      e.persist();
        const newMeta = {
          ...meta,
          description: e.target.value
        }
        return {
          meta: newMeta
        }
      })
    }
  }

  render() {
    const {closeMetaModal, openCloseMetaModal} = this.props; 
    const {title, keywords, description} = this.state.meta;
    
    return (
      <Dialog
        open={openCloseMetaModal}
        onClose={closeMetaModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">
          {"Edit meta tags"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure that you want to save changes?
          </DialogContentText>
          <form>
            <TextField
              id="meta-title"
              label="Enter meta title" 
              variant="outlined" 
              style={{ width: "200px", margin: "5px" }}
              type="text"
              value={title}
              onChange={(e) => this.onValueChange(e)}
              />
            <TextField
              id="meta-key"
              style={{ width: "400px", margin: "5px" }}
              type="text"
              label="Key words"
              variant="outlined"
              multiline
              rows={7}
              value={keywords}
              onChange={(e) => this.onValueChange(e)}
            />
            <TextField
              id="meta-descr"
              style={{ width: "400px", margin: "5px" }}
              type="text"
              label="Description"
              variant="outlined"
              multiline
              rows={7}
              value={description}
              onChange={(e) => this.onValueChange(e)}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMetaModal}>Disagree</Button>
          <Button 
            onClick={() => {
              this.applyMeta();
              closeMetaModal();
            }}
            autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
