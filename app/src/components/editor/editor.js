import "../../helpers/iframeLoader.js";
import axios from "axios";
import React, {Component} from "react";
import DOMhelper from "../../helpers/dom-helper.js";
import EditorText from "../editor-text/editor-text.js";
import Spinner from "../spinner/spinner.js";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';

export default class Editor extends Component {
  constructor() {
    super();

    this.currentPage = "index.html";
    this.state = {
      pageList: [],
      pageName: "",
      dialog: false,
      alert: false,
      message: "",
      loading: true
    }
    this.timer = null;
    this.isLoading = this.isLoading.bind(this);
    this.isLoaded = this.isLoaded.bind(this);

  }

  componentDidMount() {
    this.init(this.currentPage);
  }
  
  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  init(page) {
    this.iframe = document.querySelector('iframe');
    this.open(page, this.isLoaded);
    this.loadPageList();
  }

  open(page, cb) {
    this.currentPage = page;

    axios
      .get(`../${page}?rnd=${Math.floor(Math.random() * 10)}`)                         // got our page like string
      .then(res => DOMhelper.parseStrToDOM(res.data)) // parse page/string and rewrite to DOM obj
      .then(DOMhelper.wrapTextNode)                   // adding custom tag to each text node
      .then(dom => {                             //copied clear copy to virtual dom
        this.virtualDom = dom;
        return dom;
      })
      .then(DOMhelper.serializedDomToString)                           //rewrite our DOM obj to string
      .then(html => axios.post("./api/saveTempPage.php", {html})) //send our page to temporary file
      .then(() => this.iframe.load("../temp.html"))               //load our page into our iframe
      .then(() => this.enableEditing())                           //turn on contentEditable to = true
      .then(() => this.injectStyles())
      .then(cb)
  }

  save() {
    this.isLoading();
    const newDom = this.virtualDom.cloneNode(this.virtualDom);
    DOMhelper.unwrapTextNodes(newDom);
    // now we need to save our data and send it to server.
    // we can't send DOM obj to server and we should rewrite our dom to string
    const html = DOMhelper.serializedDomToString(newDom);
    axios
      .post("./api/savePage.php", {pageName: this.currentPage, html})
      .then(() => this.handleAlertOpen("success"))
      .catch(() => this.handleAlertOpen('warning'))
      .finally(this.isLoaded)
  }

  enableEditing() {
    this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
      const id = element.getAttribute("nodeId");
      const virtualElement = this.virtualDom.body.querySelector(`[nodeId="${id}"]`);
      new EditorText(element, virtualElement)
    })
  }

  injectStyles() {
    const style = this.iframe.contentDocument.createElement("style");
    style.innerHTML = `
      text-editor:hover {
        outline: 3px solid orange;
        outline-offset: 8px;
      }
      text-editor:focus {
        outline: 3px solid red;
        outline-offset: 8px;
      }
    `;
    this.iframe.contentDocument.head.appendChild(style);
  }

  loadPageList() {
    axios
      .get('./api')
      .then(res => this.setState({ pageList: res.data }))
  };

  createNewFile() {
    axios.post('./api/createNewFile.php', {
      name: this.state.pageName
    })
    .then(() => this.setState({pageName: ''}))
    .then(this.loadPageList())
    .catch(() => {
      alert("The page already exist!")
    })
  }

  delePage(page) {
    axios.post("./api/deletePage.php", {"name": page})
      .then(res => console.log(res))
      .then(this.loadPageList())
      .catch(() => {
        alert("There are no such a page!")
      })
  }

  handleClickOpen() {
    this.setState({ dialog: true });
  }

  handleClose() {
    this.setState({ dialog: false });
  };
  
  handleAlertOpen(status) {
    if(status === 'success') {
      this.setState({alert: 'success', message: "Your changes has changed successfully!"})
      const timer = setTimeout(() => {
        this.setState({alert: false})
      }, 3000)
    } else if (status === 'warning') {
      this.setState({alert: 'warning', message: "Something went wrong!"})
      const timer = setTimeout(() => {
        this.setState({alert: false})
      }, 3000)
    }
  };

  isLoading() {
    this.setState({
      loading: true
    })
  }

  isLoaded() {
    this.setState({
      loading: false
    })
  }

  render() {
    const {alert, message, dialog, loading} = this.state;
    let spinner = loading ? <Spinner acitve /> : <Spinner />;
    
    return (
      <>
        <iframe src={this.currentPage}></iframe>

        {spinner}

        <div className="panel">
          <Spinner />
          {this.state.alert ? <Alert className="alert-success" variant="outlined" severity={alert}>
            {message}
          </Alert> : <></>}
          <Button variant="outlined" onClick={() => this.handleClickOpen()}>
            Publish changes
          </Button>
        </div>
       
        <Dialog
          open={dialog}
          onClose={() => this.handleClose()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          >
          <DialogTitle id="alert-dialog-title">
            {"Saving changes"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure that you want to save changes?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {this.handleClose()}}>Disagree</Button>
            <Button 
              onClick={() => {
                this.handleClose();
                this.save();
              }} 
              autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
}