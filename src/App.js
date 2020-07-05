import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import ReactDOM from "react-dom";

//Import contracts and functions
import ExchangeContract from './ContractsInteraction/exchange';
import {ExchangeService} from './ContractsInteraction/exchangeService';

import AgentContract from './ContractsInteraction/agent';
import {AgentService} from './ContractsInteraction/agentService';

//Import Visual Components
import Panel from "./MyComponents/Panel";
import AppHeader from "./MyComponents/AppHeader";
import AppFooter from "./MyComponents/AppFooter";

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
          sellOffers: [],
          agentSellOffers:[],
          isMember: 'false',
          display:false,
          //inputs elements
          inputUnitsOfEnergy: undefined,
          inputPricePerUnit: undefined,
          inputSellOrderId: undefined,
          inputSellerOrderAddress: undefined,
          inputCancelSellOrderId:undefined,
          //agentInstance
          agentInstance:undefined,
          agentInstances :[],
          agentInstanceObject : {
            account:undefined,
            instance:undefined
          },
          //agents elements
          availableEnergyToSell:undefined
          
        };
      
        

       


        //input change instance
        this.unitsOfEnergyChange=this.unitsOfEnergyChange.bind(this);
        this.pricePerUnitChange=this.pricePerUnitChange.bind(this);
        this.sellOrderIdChange=this.sellOrderIdChange.bind(this);
        this.sellerOrderAddressChange=this.sellerOrderAddressChange.bind(this);
        this.cancelSellOrderIdChange=this.cancelSellOrderIdChange.bind(this);

    }  


    async componentDidMount(){
        //define our instaled version of Web3 as the libary to be run on the browser
        this.web3 = await getWeb3();

        //defines an instance of the contact exchange
        this.exchange = await ExchangeContract(this.web3.currentProvider);
        console.log("the address of the echange contract is:" + this.exchange.address)
        this.exchangeService = new ExchangeService(this.exchange);
        
        //utilities
        this.toEther = converter(this.web3);

        var account = (await this.web3.eth.getAccounts())[0];

        //index of current instance
        
        let index = this.state.agentInstances.findIndex(x => x.account === this.state.account);

        console.log('the showed load instances are'+this.state.agentInstances);

        console.log('the index of the current instance is: '+index);

        //metamask method that refresh the active account in the web
        this.web3.currentProvider.publicConfigStore.on('update',async function(event){
          this.setState({
            account: event.selectedAddress.toLowerCase()
          },()=>{
            this.load();
          });
        }.bind(this));
        
        this.setState({
          account: account
        },()=>{
          this.load();
        });
        
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

    async getDeployedContractDetails(){
      await this.exchangeService.getAgentContracts(this.state.account);
    }

    async getRegStatus(){
      let isMember= await this.exchangeService.getRegistrationStatus(this.state.account);
      let display;
      if(isMember==true){
        isMember='true';
        display=true;
      }else{
        isMember='false';
        display=false;
      }
      this.setState({
        isMember,
        display
      });
      
    }


    async newAgent(){
      
      /* 1) Create new agent contract */
            
      //await this.exchangeService.createAgentContract(this.state.account);

      //await this.exchange.createAgentContract(1,15041993,50,{from:this.state.account});
      //this.agent = await AgentContract(this.web3.currentProvider);
      
      let agentInstance = await AgentContract(this.web3.currentProvider,this.exchange.address,this.state.account);

      this.state.agentInstanceObject.account = this.state.account;
      this.state.agentInstanceObject.instance = agentInstance;
      this.state.agentInstances.push(this.state.agentInstanceObject);

      console.log(" the new contract instance is : "+this.state.agentInstances);

      /* 2) Interact with the new agent deployed contract by getting its details(luego podria interactuar con la dirección del nuevo contrato desde afuera)*/

      let agentDetails = await agentInstance.getAgentDetails({from:this.state.account});
      const {0:agentAddress,1:agentId,2:agentCreationDate,3:agentAvailableEnergyToSell}=agentDetails;
      console.log('the agent details of the deployed agent contract are agentAddress,agentID,agentCreationDate,agentAvailableEnergyToSell:  '+ agentDetails);
      
      /* 3) Register the new agent contract in the exchange and get its details
            It should return that the agent is register and no contract address is informed because we commented 
            that part on the EnergyExchange contract*/
     
      await this.exchange.createAgentContract(agentId,{from:this.state.account});
      let deployedAgentContractDetails = await this.exchange.getDeployedContractAgentDetails({from:this.state.account});
      console.log('the deployedagentcontract details agentId,agentAddress, agentContractAddress,agentIsMember: ' +deployedAgentContractDetails);
      
      
      /* 4) Add a new sell from the agent contract*/

      await agentInstance.addSellOrder(10,10,{from:this.state.account});
      
      /* old code to be removed when i am ready
      //let adagent = await this.getAgentContractAddress();
      let deployedagentdetails = await this.exchange.getDeployedContractAgentDetails();
      console.log('new agent deployed details: agentId, agentAddress,agentContractAddress, agentIsMember:  '+deployedagentdetails)
      
      //let agentC = await AgentContract.at(adagent);
      /*let agent= await AgentContract(this.web3.currentProvider,adagent,this.state.account);
      
      let agentcontractdetails = await agent.getAgentDetails();
      console.log('detalles del contrato agente desplegado'+agentcontractdetails);
      //this.agentService = new AgentService(this.agent);
      console.log('cuenta agente que llama sellorder'+this.state.account);

      await agent.addSellOrder(10,10,{from:this.state.account});
  
      
      //await this.agentService.newBuy(this.state.account);
      
     */
    }

    //////////////////
    //Sell functions//
    //////////////////

    async addOffer(){
      await this.exchangeService.newSell(this.state.account,this.state.inputUnitsOfEnergy,this.state.inputPricePerUnit,this.state.account);
    }

    async getOffer() {
      let sellOffers = await this.exchangeService.getSellOffers();
      this.setState({
        sellOffers
      });
    }

    async getAgentContractAddress(){
      return await this.exchangeService.getAgentContracts();
    }

    //functions from agent contract//

    async agentAddOffer(){
      
      console.log(this.state.agentInstance);
      await this.state.agentInstance.addSellOrder(20,10,{from:this.state.account});

      console.log(agentInstances);
      
      
      
    }

    async agentGetDetails(){
      if(this.state.availableEnergyToSell!= undefined)
      {
      let availableEnergyToSell = await this.agentService.getAgentDetails();
      console.log('available energy to sell: ' + availableEnergyToSell );
      this.setState({
        availableEnergyToSell
      });
      }
    }

    //////////////////////////
    //Input update functions//
    //////////////////////////
    
    
    
    
    unitsOfEnergyChange(event) {
      this.setState({inputUnitsOfEnergy: event.target.value})      
    }

    pricePerUnitChange(event) {
      this.setState({inputPricePerUnit: event.target.value})     
    }

    sellOrderIdChange(event) {
      this.setState({inputSellOrderId: event.target.value})   
    }

    sellerOrderAddressChange(event) {
      this.setState({inputSellerOrderAddress: event.target.value})     
    }

    cancelSellOrderIdChange(event) {
      this.setState({inputCancelSellOrderId: event.target.value})    
    }
    
    /*updateUnitsOfEnergy = event =>{
      console.log('event.target.value',event.target.value);
    }*/

    ////////
    //load--execute a function at the beggining of everything//
    ////////
     
    async load(){
      this.getBalance();
      this.getOffer();
      this.getRegStatus();
      this.agentGetDetails();
      this.getDeployedContractDetails();
      
    }

    render() {

      let noShowAgent = (<div>
        <button onClick={()=> this.newAgent()}>Register</button>  
        <p>Please register yourself to start the interaction with the Exchange</p>
      </div>);

      if(this.state.display){
        noShowAgent=null;
      }

      let showAgent = (<div>
        <div className="agent-dashboard">
          <h2><strong>Agent Operation Dashboard</strong></h2>
          <div className="row">
              <div className="col-sm">
                  <h4>Price per unit of energy</h4>
                  <input type="text" name="pricePerUnit" value ={this.state.inputPricePerUnit}
                    onChange={this.pricePerUnitChange}
                  />
                  <h4>Units of energy</h4>
                  <input type="text" name="unitsOfEnergy" value ={this.state.inputUnitsOfEnergy}
                    onChange={this.unitsOfEnergyChange}
                  />
                  <br></br>
                  <button onClick={()=> this.agentAddOffer()}>AddSellOffer</button>   
              </div>
              <div className="col-sm">
                  <h4>Sell Order Id</h4>
                  <input type="text" name="sellOrderId" value ={this.state.inputSellOrderId}
                    onChange={this.sellOrderIdChange}
                  />
                  <h4>Seller agent address</h4>
                  <input type="text" name="sellOrderAddress" value ={this.state.inputSellerOrderAddress}
                    onChange={this.sellerOrderAddressChange}
                  />
                  <br></br>
                  <button>Buy energy</button>
              </div>
              <div className="col-sm">
                  <h4>Sell Order Id</h4>
                  <input type="text" name="cancelSellorderId" value ={this.state.inputCancelSellOrderId}
                    onChange={this.cancelSellOrderIdChange}
                  />
                  <br></br>
                  <button>Cancel sell offer</button>
              </div>
          </div>
          
        </div> 
        
        <br/>
         
        <div className="agent-dashboard">

          <h2><strong>Agent Details Dashboard</strong></h2>

          <div className="row">

            <div className="col-sm">
              <h3>Agent</h3>
              <br/>
              <br/>
              <div className="col-sm">
                <span><strong>Id</strong></span>
              </div>
              <div className="col-sm">
                <span><strong>Contract Address</strong></span>
              </div>
              <div className="col-sm">
                <span><strong>Energy available to sell</strong></span>
              </div>          
            </div>

            
            <div className="col-sm">
              <h3>Smart Meter Real Time Data</h3>
              <div className="col-sm">
                <h4>Sell Order Id</h4>
                
                <button>Update energy available to sell</button>
              </div>
              
            </div>
          </div>
        </div>   
      </div>
      );

      if(!this.state.display){
        showAgent=null;
      }

      return <React.Fragment>
        <AppHeader/>

        <br/>

        <div className="market-dashboard">

          <h2><strong>Market Dashboard</strong></h2>

          <div className="row">

            <div className="col-sm">
              <h3>Agent</h3>
              <br/>
              <br/>
              <div className="col-sm">
                <span><strong>Account</strong>: {this.state.account}</span>
              </div>
              <div className="col-sm">
                <span><strong>Balance</strong>: {this.state.balance}</span>
              </div>
              <div className="col-sm">
                <span><strong>Is Member?</strong> {this.state.isMember}</span>
              </div>    
              <div className="col-sm">
                
                {noShowAgent}
              </div>       
            </div>

            
            <div className="col-sm">
              <h3>Orders</h3>
              <div className="col-sm">
              <Panel title="Sell Orders">
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
              <div className="col-sm">
                <Panel title="Buy Orders"/>
              </div>
            </div>
          </div>
        </div>      
        
        <br/>

        {showAgent}

        

        <br/>
        <AppFooter/>   
          
      </React.Fragment>
  }
}