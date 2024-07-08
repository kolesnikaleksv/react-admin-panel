import "../../helpers/iframeLoader.js";
import axios from "axios";
import React, {Component} from "react";
import DOMhelper from "../../helpers/dom-helper.js";
import EditorText from "../editor-text/editor-text.js";
import Spinner from "../spinner/spinner.js";
import ConfirmModal from "../confirm-modal/ConfirmModal.js";
import ChooseModal from "../choose-modal/ChooseModal.js";
import Panel from "../panel/Panel.js";
import BackupModal from "../backupModal/BuckupModal.js";
import EditorMeta from "../editor-meta/EditorMeta.js";
import EditorImages from "../editor-images/EditorImages.js";
import Login from "../login/Login.js";
import LogoutModal from "../logoutModal/logoutModal.js";

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
      openPage: false,
      backupList: [],
      openCloseBackup: false,
      alertModal: false,
      openCloseMetaModal: false,
      auth: false,
      loginError: false,
      loginLengthError: false,
      openCloseLogout: false
    }
    this.timer = null;
    this.isLoading = this.isLoading.bind(this);
    this.isLoaded = this.isLoaded.bind(this);
    this.loadBackupsList = this.loadBackupsList.bind(this);
    this.save = this.save.bind(this);
    this.init = this.init.bind(this);
    this.restoreBackup = this.restoreBackup.bind(this);
    this.handleAlertOpen = this.handleAlertOpen.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
  }

  componentDidMount() {
    this.checkAuth();
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.auth !== prevState.auth) {
      this.init(null, this.currentPage);
    }
  }

  checkAuth() {
    axios
      .get("./api/checkAuth.php")
      .then(res => {
        this.setState({
          auth: res.data.auth
        })
      })
  }

  login(pass) {
    if(pass.length > 5) {
      axios
        .post("./api/login.php", {"password": pass})
        .then(res => {
          this.setState({
            auth: res.data.auth,
            loginError: !res.data.auth,
            loginLengthError: false
          })
        })
    } else {
      this.setState({
        loginError: false,
        loginLengthError: true
      })
    }
  }
  
  logout() {
    axios
      .get("./api/logout.php")
      .then(() => {
        window.location.replace("/");
      })
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
    if(this.state.auth) {
      this.isLoading();
      this.iframe = document.querySelector('iframe');
      this.open(page, this.isLoaded);
      this.loadPageList();
      this.loadBackupsList();
    }
  }

  open(page, cb) {
    this.currentPage = page;

    axios
      .get(`../${page}?rnd=${Math.floor(Math.random() * 10)}`)      // got our page like string
      .then(res => DOMhelper.parseStrToDOM(res.data)) // parse page/string and rewrite to DOM obj
      .then(DOMhelper.wrapTextNode)                   // adding custom tag to each text node
      .then(DOMhelper.wrapImages)                   // adding custom tag to each img tag
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

    this.loadBackupsList();
  }

  async save() {
    this.isLoading();
    const newDom = this.virtualDom.cloneNode(this.virtualDom);
    DOMhelper.unwrapTextNodes(newDom);
    DOMhelper.unWrapImages(newDom);
    // now we need to save our data and send it to server.
    // we can't send DOM obj to server and we should rewrite our dom to string
    const html = DOMhelper.serializedDomToString(newDom);
    await axios
      .post("./api/savePage.php", {pageName: this.currentPage, html})
      .then(() => this.handleAlertOpen("success"))
      .catch(() => this.handleAlertOpen('warning'))
      .finally(this.isLoaded)

    this.loadBackupsList();
  }

  enableEditing() {
    this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
      const id = element.getAttribute("nodeId");
      const virtualElement = this.virtualDom.body.querySelector(`[nodeId="${id}"]`);
      new EditorText(element, virtualElement)
    })
    this.iframe.contentDocument.body.querySelectorAll("[editableimgid]").forEach(element => {
      const id = element.getAttribute("editableimgid");
      const virtualElement = this.virtualDom.body.querySelector(`[editableimgid="${id}"]`);
      new EditorImages(element, virtualElement, this.isLoading, this.isLoaded, this.handleAlertOpen);
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
      [editableimgid]:hover {
        outline: 3px solid orange;
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

  loadBackupsList() {
    axios
      .get("./backups/backups.json")
      .then(res => this.setState({backupList: res.data.filter(backup => {
        return backup.page === this.currentPage;
      })
    }))
  }
  
  restoreBackup(e, backup) {
    if(e) {
     e.preventDefault(); 
    }
    this.isLoading();
    axios
      .post("./api/restoreBackup.php", {"page": this.currentPage, "file": backup})
      .then(() => this.open(this.currentPage, this.isLoaded))
  }

  handleDialogOpen() {
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

  openBackupModal() {
    this.setState({openCloseBackup: true});
  }
  closeBackupModal() {
    this.setState({openCloseBackup: false});
  }

  openMetaModal() {
    this.setState({openCloseMetaModal: true});
  }

  closeMetaModal() {
    this.setState({openCloseMetaModal: false});
  }

  openLogoutModal() {
    this.setState({openCloseLogout: true});
  }

  closeLogoutModal() {
    this.setState({openCloseLogout: false});
  }
  
  
  render() {
    const {alert, message, 
      dialog, loading, 
      openPage, pageList, 
      openCloseBackup, backupList, 
      alertModal, openCloseMetaModal, 
      auth, loginError, 
      loginLengthError, openCloseLogout} = this.state;
    let spinner = loading ? <Spinner acitve /> : <Spinner />;

    if(!auth) {
      return <Login login={this.login} lengthErr={loginLengthError} logErr={loginError} />;
    }
   
    return (
      <> 
        <iframe src=""></iframe>
        <input id="img-upload" type="file" accept="image/*" style={{display: 'none'}} ></input>

        {spinner}

        <Panel 
          state={alert} 
          openPage={() => this.handlePageOpen()}
          openDialog={() => this.handleDialogOpen()}
          openCloseBackup={() => this.openBackupModal()}
          message={message}
          alert={alert}
          openMetaModal={() => this.openMetaModal()}
          openLogout={() => this.openLogoutModal()}
          />
       
        <ChooseModal 
          closeModal={() => this.handlePageClose()}
          method={() => this.save()}
          data={pageList}
          openPage={openPage}
          redirect={this.init}
          />

        <BackupModal 
          closeModal={() => this.closeBackupModal()}
          method={() => this.save()}
          data={backupList}
          openPage={openCloseBackup}
          redirect={this.restoreBackup}
          />

        <ConfirmModal 
          closeModal={() => this.handleClose()}
          method={() => this.save()}
          dialog={dialog}
          logout={"logout"}
          />

        <LogoutModal
          closeModal={() => this.closeLogoutModal()} 
          openCloseLogout={openCloseLogout}
          logout={() => this.logout()}
          />

        {
          this.virtualDom ?
          <EditorMeta 
          openCloseMetaModal={openCloseMetaModal} 
          closeMetaModal={() => this.closeMetaModal()}
          virtualDom={this.virtualDom}
          />:
          false
        }
      </>
    )
  }
}