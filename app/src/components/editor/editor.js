import "../../helpers/iframeLoader.js";
import axios from "axios";
import React, {Component} from "react";

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
    this.currentPage = `../${page}`;
    this.iframe.load(this.currentPage, () => {
    const body = this.iframe.contentDocument.body;
    let textNodes = [];

    function recursy(element) {
      element.childNodes.forEach(node => {
        
        if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {
          textNodes.push(node);
        } else {
          recursy(node);
        }
      })
    }

    recursy(body);

    textNodes.forEach(node => {
      const wrapper = this.iframe.contentDocument.createElement("text-editor");
      node.parentNode.replaceChild(wrapper, node);
      wrapper.appendChild(node);
      wrapper.contentEditable = "true";
    })
    })
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
      // <>
      //   <input value={pageName} type="text" onChange={(e) => this.setState({pageName: e.target.value})}/>
      //   <button onClick={() => this.createNewFile()}>Create new html file</button>
      //   {pages}
      // </>
      <iframe src={this.currentPage}></iframe>
    )
  }
}