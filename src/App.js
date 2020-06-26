import React, { Component } from "react";
import getWeb3 from "./getWeb3";

//Import contracts and functions
import ExchangeContract from './ContractsInteraction/exchange';
import {ExchangeService} from './ContractsInteraction/exchangeService';

//Import Visual Components
import Panel from "./MyComponents/Panel";

//utility functions

const converter = (web3) =>{
  return (value) =>{
    return web3.utils.fromWei(value.toString(),'ether');
  }
}

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
          account: undefined,
          balance :0 
        };
    }  

    async componentDidMount(){
        //define our instaled version of Web3 as the libary to be run on the browser
        this.web3 = await getWeb3();

        //defines an instance of the contact exchange
        this.exchange = await ExchangeContract(this.web3.currentProvider);
        this.exchangeService = new ExchangeService(this.exchange);
        //utilities
        this.toEther = converter(this.web3);

        var account = (await this.web3.eth.getAccounts())[0];
        
        this.setState({
          account: account.toLowerCase()
        },()=>{
          this.load();
        });
    }

    async addOffer(){
      await this.exchangeService.newSell(this.state.account,10,10);
    }

    async getBalance(){
      let weiBalance = await this.web3.eth.getBalance(this.state.account);
      this.setState({
        balance:this.toEther(weiBalance)
      });
    
    }
    async load(){
      this.getBalance();
      this.addOffer();
    }

    render() {
        return (
          <React.Fragment>
          <div className="jumbotron">
              <h4 className="display-4">Welcome to the Exchange!</h4>
          </div>

          <div className="row">
              <div className="col-sm">
                  <Panel title="Balance">
                      <p><strong>Account: </strong>{this.state.account}</p>
                      <span><strong>Balance (ether): </strong>{this.state.balance}</span>
                  </Panel>
              </div>
              <div className="col-sm">
                  <Panel title="Agent Id">
                      <button onClick={()=> this.addOffer()}>AddSellOffer</button>
                      <p>´{this.state.agentDetails}</p>

                  </Panel>
              </div>
          </div>
      </React.Fragment>
          );
    }
}