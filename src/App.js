import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import ReactDOM from "react-dom";

//Import contracts and functions
import ExchangeContract from './ContractsInteraction/exchange';
import {ExchangeService} from './ContractsInteraction/exchangeService';

import AgentContract from './ContractsInteraction/agent';

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
          inputAvailableEnergyToSell:undefined,
          //agentInstance
          agentInstance:undefined,
          
          //agents elements
          agentAvailableEnergyToSell:undefined,
          agentId:undefined,
          agentAddress:undefined,
          agentCreationDate:undefined
          
        };
      
        //input change instance
        this.unitsOfEnergyChange=this.unitsOfEnergyChange.bind(this);
        this.pricePerUnitChange=this.pricePerUnitChange.bind(this);
        this.sellOrderIdChange=this.sellOrderIdChange.bind(this);
        this.sellerOrderAddressChange=this.sellerOrderAddressChange.bind(this);
        this.cancelSellOrderIdChange=this.cancelSellOrderIdChange.bind(this);
        this.availableEnergyToSellChange=this.availableEnergyToSellChange.bind(this);

    }  

    async componentDidMount(){
        //define our instaled version of Web3 as the libary to be run on the browser
        this.web3 = await getWeb3();

        //defines an instance of the contact exchange
        this.exchange = await ExchangeContract(this.web3.currentProvider);
        //console.log("the address of the echange contract is:" + this.exchange.address)
        this.exchangeService = new ExchangeService(this.exchange);
        
        //utilities
        this.toEther = converter(this.web3);

        var account = (await this.web3.eth.getAccounts())[0];

        //this feature is no longer available
        /*

        //metamask method that refresh the active account in the web
        this.web3.currentProvider.publicConfigStore.on('update',async function(event){
          this.setState({
            account: event.selectedAddress.toLowerCase()
          },()=>{
            this.load();
          });
        }.bind(this));

        */

        
        
        this.setState({
          account: account
        },()=>{
          this.load();
        });

        
        this.setState({
          agentInstance: await this.exchange.getAgentContractInstance({from:this.state.account})
        },()=>{
          this.load();
        });
          

    }

    //////////////////////////////
    //Market Dashboard functions//
    //////////////////////////////

    async getBalance(){
      let weiBalance = await this.web3.eth.getBalance(this.state.account);
      this.setState({
        balance:this.toEther(weiBalance)
      });
    }

    async getOffer() {
      let sellOffers = await this.exchangeService.getSellOffers();
      this.setState({
        sellOffers
      });
    }

    //getBuyOffers()

    async newAgent(){
      
      console.log('step 0 completed');
      /* 1) Create new agent contract */
      let agentInstance = await AgentContract(this.web3.currentProvider,this.exchange.address,this.state.account,{from:this.state.account});

      console.log('step 1 completed');

      /* 2) Save the instance in the contractIntance mapping on the blockchain */
      await this.exchange.addAgentContractInstance(agentInstance.address,{from:this.state.account});     

      console.log('step 2 completed');

      /* 3) Register the new agent contract in the exchange*/
      let agentDetails = await agentInstance.getAgentDetails({from:this.state.account});
      const {0:agentAddress,1:agentId,2:agentCreationDate,3:agentAvailableEnergyToSell}=agentDetails;
      await this.exchange.createAgentContract(agentId,{from:this.state.account});

      console.log('step 3 completed');

    }
    /////////////////////////////
    //Agent Operation Dashboard//
    /////////////////////////////

    async agentAddOffer(){

      let contractInstance = await this.getAgentInstance();

      await contractInstance.addSellOrder(this.state.inputUnitsOfEnergy,this.state.inputPricePerUnit,{from:this.state.account},function(error,result){
        if (error){
          console.log("Error",error);
        }
        else {

          console.log('successfull sell');
                 
        }
      });
      
      //to be removed at the end. this was the old version without the callback
      //await contractInstance.addSellOrder(this.state.inputUnitsOfEnergy,this.state.inputPricePerUnit,{from:this.state.account});
      
    }

    async agentBuyEnergy(){

      //parece ser que la nueva release a machacado el añadir el value en metamask

      let contractInstance = await this.getAgentInstance();

      await contractInstance.buyEnergy(this.state.inputSellOrderId,this.state.inputSellerOrderAddress,{from:this.state.account},function(error,result){
        if (error){
          console.log("Error",error);
        }
        else {

          console.log('successfull buy');
                 
        }
      });

      console.log(this.state.inputSellOrderId,this.state.inputSellerOrderAddress);

      //await contractInstance.buyEnergy(this.state.inputSellOrderId,this.state.inputSellerOrderAddress,{from:this.state.account});
      
    }

    async agentCancelSellOffer(){

      let contractInstance = await this.getAgentInstance();

      await contractInstance.cancelAddedSellOrder(this.state.inputCancelSellOrderId,{from:this.state.account},function(error,result){
        if (error){
          console.log("Error",error);
        }
        else {

          console.log('successfull sell');
                 
        }
      });

      
      
    }

    ///////////////////////////
    //Agent Details Dashboard//
    ///////////////////////////

    async updateEnergytoSell(){
      let contractInstance = await this.getAgentInstance();

      await contractInstance.updateAvailableEnergyToSell(this.state.inputAvailableEnergyToSell,{from:this.state.account},function(error,result){
        if (error){
          console.log("Error",error);
        }
        else {

          console.log('successfull sell');
                 
        }
      });
    }
    
    async agentGetDetails(){
      
      
      let contractInstance = await this.getAgentInstance();
      console.log(contractInstance);
      
      await contractInstance.getAgentDetails({from:this.state.account},function(error,result){
        if (error){
          console.log("Error",error);
        }
        else {

          const {0:_agentAddress,1:_agentId,2:_agentCreationDate,3:_agentAvailableEnergyToSell}=result;

          console.log('the agent get details are: ',result,_agentAddress,_agentId.toNumber());
          this.setState({

            agentId:_agentId.toNumber(),
            agentAddress:_agentAddress,
            agentCreationDate:_agentCreationDate.toNumber(),
            agentAvailableEnergyToSell:_agentAvailableEnergyToSell.toNumber()

          });         
        }
      }.bind(this));
      
    }

    ////////////////////////
    //Supportive functions//
    ////////////////////////

    async getAgentInstance(){
      
      var AgentContract =  web3.eth.contract([
        {
          "inputs": [
            {
              "name": "_agentAddress",
              "type": "address"
            },
            {
              "name": "_agentID",
              "type": "uint256"
            },
            {
              "name": "_agentCreationDate",
              "type": "uint256"
            },
            {
              "name": "_agentAvailableEnergyToSell",
              "type": "uint256"
            },
            {
              "name": "_exchangeAddress",
              "type": "address"
            }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "name": "a",
              "type": "uint256"
            }
          ],
          "name": "onAvailableEnergyToSellUpdated",
          "type": "event"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_agentAvailableEnergyToSell",
              "type": "uint256"
            }
          ],
          "name": "updateAvailableEnergyToSell",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "getAgentDetails",
          "outputs": [
            {
              "name": "",
              "type": "address"
            },
            {
              "name": "",
              "type": "uint256"
            },
            {
              "name": "",
              "type": "uint256"
            },
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_pricePerUnit",
              "type": "uint256"
            },
            {
              "name": "_unit",
              "type": "uint256"
            }
          ],
          "name": "addSellOrder",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "getSellOffers",
          "outputs": [
            {
              "name": "",
              "type": "uint256[]"
            },
            {
              "name": "",
              "type": "address[]"
            },
            {
              "name": "",
              "type": "uint256[]"
            },
            {
              "name": "",
              "type": "uint256[]"
            },
            {
              "name": "",
              "type": "uint256[]"
            },
            {
              "name": "",
              "type": "bool[]"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_sellOrderId",
              "type": "uint256"
            }
          ],
          "name": "cancelAddedSellOrder",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_sellOrderId",
              "type": "uint256"
            },
            {
              "name": "_sellerAddress",
              "type": "address"
            }
          ],
          "name": "buyEnergy",
          "outputs": [],
          "payable": true,
          "stateMutability": "payable",
          "type": "function"
        }
      ]);
      return await AgentContract.at(this.state.agentInstance);
    };

    async getDeployedContractDetails(){
      await this.exchangeService.getAgentContracts(this.state.account);
    };

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

    availableEnergyToSellChange(event) {
      this.setState({inputAvailableEnergyToSell: event.target.value})  
    }
    
    /*updateUnitsOfEnergy = event =>{
      console.log('event.target.value',event.target.value);
    }*/

    ////////
    //load--execute a function at the beggining of everything//
    ////////
     
    async load(){
      this.getBalance();
      this.getRegStatus();
      this.getOffer();

      
      if(this.state.isMember=='true'){
        this.agentGetDetails();
      }
      
      
      //this.getDeployedContractDetails(); 
 
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
                  <button onClick={()=> this.agentBuyEnergy()}>Buy energy</button>   
              </div>
              <div className="col-sm">
                  <h4>Sell Order Id</h4>
                  <input type="text" name="cancelSellorderId" value ={this.state.inputCancelSellOrderId}
                    onChange={this.cancelSellOrderIdChange}
                  />
                  <br></br>
                  <button onClick={()=> this.agentCancelSellOffer()}>Cancel sell offer</button>  
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
                <span><strong>Id</strong>: {this.state.agentId}</span>
              </div>
              <div className="col-sm">
                <span><strong>Contract Address</strong>: {this.state.agentAddress}</span>
              </div>
              <div className="col-sm">
                <span><strong>Agent Creation Date</strong>: {this.state.agentCreationDate}</span>
              </div>
              <div className="col-sm">
                <span><strong>Energy available to sell</strong>: {this.state.agentAvailableEnergyToSell}</span>
              </div>          
            </div>

            
            <div className="col-sm">
              <h3>Smart Meter Real Time Data</h3>
              <div className="col-sm">
                <h4>Units of energy</h4>
                  <input type="text" name="unitsOfEnergy" value ={this.state.inputAvailableEnergyToSell}
                    onChange={this.availableEnergyToSellChange}
                  />
                  <br></br>
                <button onClick={()=> this.updateEnergytoSell()}>Update energy available to sell</button>   
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