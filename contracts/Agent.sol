pragma solidity ^0.4.24;


import "./EnergyExchange.sol";

contract Agent{
    
    EnergyExchange private ee;
    
    address private agentAddress;
    uint private agentID;
    uint private agentCreationDate;
    uint private agentAvailableEnergyToSell;
 
    constructor(address _agentAddress,uint _agentID,uint _agentCreationDate, uint _agentAvailableEnergyToSell, EnergyExchange _exchangeAddress) public{
         agentAddress=_agentAddress;
         agentID=_agentID;
         agentCreationDate=_agentCreationDate;
         agentAvailableEnergyToSell=_agentAvailableEnergyToSell;
         
         ee=_exchangeAddress;
    }
    
    ///////////////////////////
    //Agent details functions//
    ///////////////////////////
    
    event onAvailableEnergyToSellUpdated (uint a);
    
    function updateAvailableEnergyToSell(uint _agentAvailableEnergyToSell) public isOwner{
        agentAvailableEnergyToSell=_agentAvailableEnergyToSell;
        
        emit onAvailableEnergyToSellUpdated(_agentAvailableEnergyToSell);
    }
    
    
    function getAgentDetails() public view isOwner returns(address,uint,uint,uint){
        return (agentAddress,agentID,agentCreationDate,agentAvailableEnergyToSell);
        
    }
 
     //////////////////////////
     //Registration functions//
     //////////////////////////
     
    function getExchangeRegistrationStatus() private view isOwner returns(bool) {

        return (ee.getRegistrationStatus(agentAddress));

    }
    

    
    //////////////////
    //Sell Functions//
    //////////////////
    
    
    function addSellOrder(uint _pricePerUnit, uint _unit) public isOwner{
        //check the agent has been accepted on the eexchange
        require(getExchangeRegistrationStatus()==true, "You are not a member of the exchange");
        
        //check the seller has enough energy to sell
        require(_unit<=agentAvailableEnergyToSell, "Insufficient amount of energy available to sell");
        
        ee.saveSellOrder(agentAddress, _pricePerUnit, _unit);
        
        //after the offer is placed, the energyAmount to sell is reduced
        agentAvailableEnergyToSell -= _unit;
    }
     
    
    function getSellOffers() public view isOwner returns(uint[], address[],uint[],uint[],uint[],bool[]){
        //check the agent has been accepted on the exchange
        require(getExchangeRegistrationStatus()==true, "You are not a member of the exchange");
        
        uint[] memory arrSellOrderId = new uint[](100);
        address[] memory arrSellOrderAgent = new address[](100);
        uint[] memory arrSellOrderUnit = new uint[](100);
        uint[] memory arrSellOrderPricePerUnit = new uint[](100);
        uint[] memory arrSellOrderTotalPrice = new uint[](100);
        bool[] memory arrSellOrderIsAvailable = new bool[] (100);
        
        (arrSellOrderId,arrSellOrderAgent,arrSellOrderUnit,arrSellOrderPricePerUnit,arrSellOrderTotalPrice,arrSellOrderIsAvailable) = ee.getSellOffers();

        return (arrSellOrderId,arrSellOrderAgent,arrSellOrderUnit,arrSellOrderPricePerUnit,arrSellOrderTotalPrice,arrSellOrderIsAvailable);
    }
    
    function cancelAddedSellOrder(uint _sellOrderId) public isOwner{
        ee.cancelSellOrder(agentAddress,_sellOrderId);
    }
    
    /////////////////
    //Buy functions//
    /////////////////
    function buyEnergy(uint _sellOrderId, address _sellerAddress ) public payable isOwner{
        uint totalPrice=getTotalPriceOffer(_sellOrderId);
        uint unit = getUnitOffer(_sellOrderId);
        uint pricePerUnit = totalPrice/unit;
    
        //check the agent has been accepted on the exchange
        require(getExchangeRegistrationStatus()==true, "You are not a member of the exchange");
        
        //check the offer is still available
        require(getAvailabilityOffer(_sellOrderId)==true, "The sell offer is no longer available");
        
        //check the buyer is sending the required amount of money (no less or more)
        
        require(msg.value == totalPrice, "Please, send the exact amount of money");
        
        //make the payment
        _sellerAddress.transfer(msg.value);
        
        //register the buy operation in the exchange
        ee.saveBuyOrder(agentAddress,unit, pricePerUnit,totalPrice,_sellOrderId);
    }
    
    ////////////////////////
    //Supportive functions//
    ////////////////////////
    
    modifier isOwner(){
        require(msg.sender == agentAddress,"You are not the owner of this contract");
        _;
    }
    
    function getTotalPriceOffer(uint _sellOrderId) private  view returns(uint){
        
         return (ee.getTotalPriceSpecificOffer(_sellOrderId));
    }
    
    function getUnitOffer(uint _sellOrderId) private view  returns(uint){
        
         return (ee.getUnitSpecificOffer(_sellOrderId));
    }
    
    function getAvailabilityOffer(uint _sellOrderId) private view  returns(bool){
        
         return (ee.getAvailabilitySpecificOffer(_sellOrderId));
    }
    
}
