import React, { Component } from "react";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

import Login from './component/authAdmin/Login';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path="/admin/login" component={Login}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
