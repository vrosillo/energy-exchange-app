import React, { Component } from "react";
import getWeb3 from "./getWeb3";

export class App extends Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount(){
        this.web3 = await getWeb3();
        console.log(this.web3.version);
    }

    render() {
        return (
            <div className="App">
              <header className="App-header">
                <p>
                  empezamos?
                </p>
              </header>
            </div>
          );
    }
}