import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import ExchangeContract from "./exchange";

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
          account: undefined
        };
    }

    async componentDidMount(){
        this.web3 = await getWeb3();
        this.exchange = await ExchangeContract(this.web3.currentProvider);

        console.log(this.ExchangeContract.createAgentContract);

        var account = (await this.web3.eth.getAccounts())[0];
        
        this.setState({
          account: account.toLowerCase()
        },()=>{
          this.load();
        });
    }

    async load(){

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