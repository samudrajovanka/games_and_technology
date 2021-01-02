import React, { Component } from "react";
import {Route, Switch} from 'react-router-dom'
import './styles/App.scss';

import Login from './pages/Login';

class App extends Component {
  render() {
    return (
        <div className="App">
          <Switch>
            <Route path="/admin/login" component={Login}/>
          </Switch>
        </div>
    );
  }
}

export default App;
