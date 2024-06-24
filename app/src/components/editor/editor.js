import axios from "axios";
import React, {Component} from "react";

export default class Editor extends Component {
  constructor() {
    super();

    this.state = {
      pageList: [],
      pageName: ''
    }
  }

  componentDidMount() {
    this.loadPageList()
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
    .then(this.loadPageList())
    .catch(() => {
      alert("The page already exist!")
    })
  }
  render() {
    const {pageList, pageName} = this.state;
    const pages = pageList.map((page, key) => {
      return(
        <h1 key={key}>{page}</h1>
      )
    })
    return (
      <>
        <input type="text" onChange={(e) => this.setState({pageName: e.target.value})}/>
        <button onClick={() => this.createNewFile()}>Create new html file</button>
        {pages}
      </>
    )
  }
}