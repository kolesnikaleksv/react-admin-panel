import "../../helpers/iframeLoader.js";
import axios from "axios";
import React, {Component} from "react";
import DOMhelper from "../../helpers/dom-helper.js";
import EditorText from "../editor-text/editor-text.js";

export default class Editor extends Component {
  constructor() {
    super();

    this.currentPage = "index.html";
    this.state = {
      pageList: [],
      pageName: ''
    }
  }

  componentDidMount() {
    this.init(this.currentPage)
  }
  
  init(page) {
    this.iframe = document.querySelector('iframe');
    this.open(page);
    this.loadPageList();
  }

  open(page) {
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
  }

  save() {
    const newDom = this.virtualDom.cloneNode(this.virtualDom);
    DOMhelper.unwrapTextNodes(newDom);
    // now we need to save our data and send it to server.
    // we can't send DOM obj to server and we should rewrite our dom to string
    const html = DOMhelper.serializedDomToString(newDom);
    axios
      .post("./api/savePage.php", {pageName: this.currentPage, html})
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

  render() {
    // const {pageList, pageName} = this.state;
    // const pages = pageList.map((page, key) => {
    //   return(
    //     <h1 key={key}>
    //       {page}
    //       <a 
    //         onClick={() => this.delePage(page)}
    //         href="#">(X)</a>
    //     </h1>
    //   )
    // })
    return (
      <>
        <button style={{zIndex: 100, padding: "20px", background: "green",cursor: "pointer", position: "absolute", borderRadius: "8px", opacity: 0.5, top: "100px"}} onClick={() => this.save()}>Save</button>
        <iframe src={this.currentPage}></iframe>
      </>
      // <>
      //   <input value={pageName} type="text" onChange={(e) => this.setState({pageName: e.target.value})}/>
      //   <button onClick={() => this.createNewFile()}>Create new html file</button>
      //   {pages}
      // </>
      // <iframe src={this.currentPage}></iframe>
    )
  }
}