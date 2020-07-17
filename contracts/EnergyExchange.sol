pragma solidity ^0.4.24;

import "./Ownable.sol";
import "./Agent.sol";

contract EnergyExchange is Ownable{
    
    /////////
    //Agent//
    /////////
    
    struct Agent1{
        uint agentId;
        address agentAddress;
        address agentContractAddress;
        bool agentIsMember;
     }
     
    mapping (address => Agent1) public agents; 
    
     struct Info {
        Agent ainstance;
    }
    mapping (address => Info) public contractInstance;
    
    //////////////////
    //Sell variables//
    //////////////////
    
    struct sellOrder{
        uint id; 
        address agent;
        uint unit;
        uint pricePerUnit;
        uint totalPrice;
        bool isAvailable;
     }
     
    mapping (uint => sellOrder) private sellOrders;
    uint sellOrderId;
    uint[] sellOrdersLenght;
    
    /////////////////
    //Buy variables//
    /////////////////
    
    struct buyOrder {
        uint id;
        address buyer;
        uint unit;
        uint pricePerUnit;
        uint totalPrice;
        uint sellOrderId;
    }
    
    mapping (uint => buyOrder) private buyOrders;
    uint buyOrderId;
    uint[] buyOrdersLenght;
    
    
   
    
    ///////////////////////
    //Agents registration//
    ///////////////////////
    //event onAgentContractCreated(uint a,address b,/*address c,*/bool d);
    
    function createAgentContract(uint _agentID/*,uint _agentCreationDate, uint _agentAvailableEnergyToSell*/) public{
        //check that the agent has not been registered already
        require(agents[msg.sender].agentIsMember==false,"The agent is already registered");
        
        //Create new contract Agent
        //address newAgent =new Agent(msg.sender,_agentID,_agentCreationDate,_agentAvailableEnergyToSell,this);
        
        //Store the agent address and the address of the created contract in the system
        Agent1 storage newAgent1 = agents[msg.sender];
        
        newAgent1.agentId = _agentID;
        newAgent1.agentAddress = msg.sender;
        //newAgent1.agentContractAddress=newAgent;
        newAgent1.agentIsMember = true;
        
        //emit the event
        //emit onAgentContractCreated(_agentID,msg.sender,/*newAgent,*/true);
      
    }
   
    
    function getDeployedContractAgentDetails() public view returns(uint,address,address,bool){
        return (agents[msg.sender].agentId,agents[msg.sender].agentAddress,agents[msg.sender].agentContractAddress,agents[msg.sender].agentIsMember);
    }
    
    
    function getRegistrationStatus(address _agent) external view returns (bool){
        return (agents[_agent].agentIsMember);
    }

    function addAgentContractInstance(Agent _contractInstance) public{
        contractInstance[msg.sender].ainstance = _contractInstance;
       
    }
    
    function getAgentContractInstance() public view returns (Agent){
        //return contractInstance[msg.sender];
        return contractInstance[msg.sender].ainstance;
    }

    
    //////////////////
    //Sell functions//
    //////////////////
    
    event onSellOrderSaved(uint a,address b,uint c,uint d,uint e,bool f);
    
    function saveSellOrder(address _agentAddr,uint _pricePerUnit, uint _unit) public {
      //check offer unit is bigger than 0
      require(_unit>0, "You cannot sell 0 units of energy");
      
      sellOrderId++;
       
      sellOrder storage newSellOrder = sellOrders[sellOrderId];
      
      newSellOrder.id = sellOrderId;
      newSellOrder.agent = _agentAddr;
      newSellOrder.unit = _unit;
      newSellOrder.pricePerUnit = _pricePerUnit;
      newSellOrder.totalPrice = _unit*_pricePerUnit;
      newSellOrder.isAvailable = true;
      
      //we add the new order id into the validSellOrderIds array
      sellOrdersLenght.push(sellOrderId);
      
      //emit the event
      emit onSellOrderSaved(sellOrderId,_agentAddr,_unit,_pricePerUnit,_unit*_pricePerUnit,true);
      
    }
    
    function getSellOffers() external view returns (uint[],address[],uint[],uint[],uint[],bool[]){
        
        uint size = sellOrdersLenght.length;
        
        uint[] memory arrSellOrderId = new uint[](size);
        address[] memory arrSellOrderAgent = new address[](size);
        uint[] memory arrSellOrderUnit = new uint[](size);
        uint[] memory arrSellOrderPricePerUnit = new uint[](size);
        uint[] memory arrSellOrderTotalPrice = new uint[](size);
        bool[] memory arrSellOrderIsAvailable = new bool[] (size);
        
        for(uint i=0;i<size;i++){
            uint id= sellOrdersLenght[i];
            
            arrSellOrderId[i]=sellOrders[id].id;
            arrSellOrderAgent[i]=sellOrders[id].agent;
            arrSellOrderUnit[i]=sellOrders[id].unit;
            arrSellOrderPricePerUnit[i]=sellOrders[id].pricePerUnit;
            arrSellOrderTotalPrice[i]=sellOrders[id].totalPrice;
            arrSellOrderIsAvailable[i]=sellOrders[id].isAvailable;
        }
        
        return (arrSellOrderId,arrSellOrderAgent,arrSellOrderUnit,arrSellOrderPricePerUnit,arrSellOrderTotalPrice,arrSellOrderIsAvailable);
    }
    
    event onSellOrderCanceled(uint a);
    
    function cancelSellOrder(address _agent,uint _sellOrderId) external{
        require(sellOrders[_sellOrderId].agent==_agent, "Only who create the order can cancel it");
        sellOrders[_sellOrderId].isAvailable = false;
        
        //emit the event
        emit onSellOrderCanceled(_sellOrderId);
    }
    
    /////////////////
    //Buy functions//
    /////////////////
    
    event onBuyOrderSaved(address a,uint b,uint c,uint d,uint e);
    
    function saveBuyOrder(address _buyerAddress,uint _unit,uint _pricePerUnit, uint _totalPrice,uint _sellOrderId) external{
        buyOrderId++;
      
        buyOrder storage newBuyOrder = buyOrders[buyOrderId];
      
        newBuyOrder.id=buyOrderId;
        newBuyOrder.buyer=_buyerAddress;
        newBuyOrder.unit=_unit;
        newBuyOrder.pricePerUnit=_pricePerUnit;
        newBuyOrder.totalPrice=_totalPrice;
        newBuyOrder.sellOrderId=_sellOrderId;
        
        //we add the new order id into the validSellOrderIds array
        buyOrdersLenght.push(buyOrderId);
        
        //we remove the sell order that has been covered
        sellOrders[_sellOrderId].isAvailable = false;
        
        //emit event
        emit onBuyOrderSaved(_buyerAddress,_unit,_pricePerUnit,_totalPrice,_sellOrderId);
    }
    
    function getBuyOffers() external view returns (uint[],address[],uint[],uint[],uint[],uint[]){
        uint size = buyOrdersLenght.length;
        
        uint[] memory arrBuyOrderId = new uint[](size);
        address[] memory arrBuyOrderBuyer = new address[](size);
        uint[] memory arrBuyOrderUnit = new uint[](size);
        uint[] memory arrBuyOrderPricePerUnit = new uint[](size);
        uint[] memory arrBuyOrderTotalPrice = new uint[](size);
        uint[] memory arrBuyOrderSellId = new uint[](size);
        
        for(uint i=0;i<size;i++){
            
            uint id= buyOrdersLenght[i];
            
            arrBuyOrderId[i]=buyOrders[id].id;
            arrBuyOrderBuyer[i]=buyOrders[id].buyer;
            arrBuyOrderUnit[i]=buyOrders[id].unit;
            arrBuyOrderPricePerUnit[i]=buyOrders[id].pricePerUnit;
            arrBuyOrderTotalPrice[i]=buyOrders[id].totalPrice;
            arrBuyOrderSellId[i]=buyOrders[id].sellOrderId;
            
        }
        
        return (arrBuyOrderId,arrBuyOrderBuyer,arrBuyOrderUnit,arrBuyOrderPricePerUnit,arrBuyOrderTotalPrice,arrBuyOrderSellId);
    }
    
    
    //////////////////////
    //Internal functions//
    //////////////////////
    
    function getTotalPriceSpecificOffer(uint _sellOrderId) external view returns(uint){
        //Check that the sell order exists
        require(sellOrders[_sellOrderId].id==_sellOrderId, "sellOrderId does not exist");
         
        return (sellOrders[_sellOrderId].unit*sellOrders[_sellOrderId].pricePerUnit);
    }
    
    function getUnitSpecificOffer(uint _sellOrderId) external view returns(uint){
        //Check that the sell order exists
        require(sellOrders[_sellOrderId].id==_sellOrderId, "sellOrderId does not exist");
         
        return (sellOrders[_sellOrderId].unit);
    }
    
     function getAvailabilitySpecificOffer(uint _sellOrderId) external view returns(bool){
        //Check that the sell order exists
        require(sellOrders[_sellOrderId].id==_sellOrderId, "sellOrderId does not exist");
         
        return (sellOrders[_sellOrderId].isAvailable);
    }
   
    
}