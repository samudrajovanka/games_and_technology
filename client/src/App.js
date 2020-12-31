import React, { Component } from "react";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import './styles/App.scss';

import Login from './pages/Login';

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
