import "../../helpers/iframeLoader.js";
import axios from "axios";
import React, {Component} from "react";
import DOMhelper from "../../helpers/dom-helper.js";
import EditorText from "../editor-text/editor-text.js";
import Spinner from "../spinner/spinner.js";
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ConfirmModal from "../confirm-modal/ConfirmModal.js";
import ChooseModal from "../choose-modal/ChooseModal.js";

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
      loading: true,
      openPage: false
    }
    this.timer = null;
    this.isLoading = this.isLoading.bind(this);
    this.isLoaded = this.isLoaded.bind(this);
    this.save = this.save.bind(this);
    this.init = this.init.bind(this);
  }

  componentDidMount() {
    this.init(null, this.currentPage);
  }
  
  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  init(e, page) {
    if(e) {
      e.preventDefault();
    }
    this.isLoading();
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
      .then(() => this.iframe.load("../wertqwer_34wsdfs.html"))              //load our page into our iframe
      .then(() => axios.post("./api/deleteTempPage.php"))
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
      .get('./api/pageList.php')
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

  deletePage(page) {
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

  handlePageOpen() {
    this.setState({openPage: true})
  }

  handlePageClose() {
    this.setState({openPage: false})
  }

  render() {
    const {alert, message, dialog, loading, openPage, pageList} = this.state;
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
          <Button sx={{mr:3}} variant="outlined" onClick={() => this.handlePageOpen()}>
            Open
          </Button>
          <Button variant="outlined" onClick={() => this.handleClickOpen()}>
            Publish changes
          </Button>
        </div>
       
        <ChooseModal 
          closeModal={() => this.handlePageClose()}
          method={() => this.save()}
          data={pageList}
          openPage={openPage}
          redirect={this.init}
          />

        <ConfirmModal 
          closeModal={() => this.handleClose()}
          method={() => this.save()}
          dialog={dialog}
          />
      </>
    )
  }
}