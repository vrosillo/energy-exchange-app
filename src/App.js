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
          balance :0,
          sellOffers: []
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
          account: account
        },()=>{
          this.load();
        });
    }

    /////////////////////
    //Account functions//
    /////////////////////

    async getBalance(){
      let weiBalance = await this.web3.eth.getBalance(this.state.account);
      this.setState({
        balance:this.toEther(weiBalance)
      });
    }
    ///////////////////
    //Agent functions//
    ///////////////////

    async getAgents() {
      await this.exchangeService.getAgentContracts();

    }

  

    async newAgent(){
      await this.exchangeService.createAgentContract(this.state.account);
    }

    //////////////////
    //Sell functions//
    //////////////////

    async addOffer(){
      await this.exchangeService.newSell(this.state.account,10,10,this.state.account);
    }

    /*
    async getOffer(){
      await this.exchangeService.getSellOffers();
    }
    */

    async getOffer() {
      let sellOffers = await this.exchangeService.getSellOffers();
      this.setState({
        sellOffers
      });
  }

    ////////
    //load--execute a function at the beggining of everything//
    ////////
    
    async load(){
      this.getBalance();
      this.getOffer();
      
    }

    render() {
      return <React.Fragment>
          <div className="jumbotron">
              <h4 className="display-4">Welcome to the Exchange!</h4>
          </div>

          <div className="row">
              <div className="col-sm">
                  <Panel title="Balance">
                        <p><strong>{this.state.account}</strong></p>
                        <span><strong>Balance</strong>: {this.state.balance}</span>
                  </Panel>
              </div>
              <div className="col-sm">
                  <Panel title="2">
                      
                  </Panel>
              </div>
          </div>
          <div className="row">
              <div className="col-sm">
                  <Panel title="Agents">
                    <span>Deployed agents</span>
                    <button onClick={()=> this.getAgents()}>GetAgentDetails</button>
                    <button onClick={()=> this.newAgent()}>AddNewAgent</button>   
                                
                  </Panel>
              </div>
              <div className="col-sm">
                  <Panel title="Sells">
                      <button onClick={()=> this.getOffer()}>GetSellOffer</button>
                      <button onClick={()=> this.addOffer()}>SaveOffer</button>   
                  </Panel>
              </div>
          </div>
          <div className="row">
              <div className="col-sm">
                  <Panel title="Buy">
                      <span>Buy orders</span>
                      <button>Add new buy</button>
                  </Panel>
              </div>
              <div className="col-sm">
                  <Panel title="List of sells">
                  {this.state.sellOffers.map((offer, i) => {
                            return <div key={i}>
                                <span>Id:{offer.OrderId}  </span>
                                <span>Agent:{offer.OrderAgent}  </span>
                                <span>Unit:{offer.OrderUnit}</span>
                                <span>Price:{offer.OrderPricePerUnit}  </span>
                                <span>TotalPrice:{offer.OrderTotalPrice}  </span>
                                <span>IsAvailable:{offer.OrderIsAvailable}  </span>
                               
                            </div>
                        })}
                  </Panel>
              </div>
          </div>
      </React.Fragment>
  }
}