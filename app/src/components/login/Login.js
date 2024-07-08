import React, { Component } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pass: ""
    }
  }

  onPasswordChange(e) {
    this.setState({
      pass: e.target.value
    })
  }
  render() {
    const {pass} = this.state;
    const {login, logErr, lengthErr} = this.props;

    let renderLogErr, renderLengthErr;
    logErr ? renderLogErr = <span className="login-error">You enter the wrong password!</span> : null;
    lengthErr ? renderLengthErr = <span className="login-error">The password must be at least 6 characters long!</span> : null;
    
    return (
      <div className="login-container">
        <div className="login">
          <h2>Authorization</h2>
          <TextField 
            id="auth-password" 
            label="password" 
            variant="outlined"
            color="success"
            value={pass}
            style={{ width: "400px", margin: "5px" }}
            onChange={(e) => this.onPasswordChange(e)} />
            {renderLengthErr}
            {renderLogErr}
          <Button 
            variant="text"
            onClick={() => login(pass)}
          >Enter</Button>
        </div>
      </div>
    )
  }
}