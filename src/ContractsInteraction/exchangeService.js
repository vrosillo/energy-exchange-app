export class ExchangeService{
    constructor(contract){
        this.contract=contract;
    }

      
    //////////////////
    //Sell functions//
    //////////////////

    async newSell(_agentAddr,_pricePerUnit,_unit,from){
        await this.contract.saveSellOrder(_agentAddr,_pricePerUnit,_unit,{from});
    }

    async getSellOffers(){
        
        //get sell offers
        let sellOffers = await this.contract.getSellOffers();
        const {0:arrSellOrderId,1:arrSellOrderAgent,2:arrSellOrderUnit,
            3:arrSellOrderPricePerUnit,4:arrSellOrderTotalPrice,5:arrSellOrderIsAvailable}=sellOffers;

        //get total number of sell offers  
        let total = arrSellOrderId.length;

        //descompose sell offers into objects
        let offers = [];
        for (var i = 0; i < total; i++) {
            let offer = {
                OrderId:arrSellOrderId[i].toNumber(),
                OrderAgent:arrSellOrderAgent[i],
                OrderUnit:arrSellOrderUnit[i].toNumber(),
                OrderPricePerUnit:arrSellOrderPricePerUnit[i].toNumber(),
                OrderTotalPrice:arrSellOrderTotalPrice[i].toNumber(),
                OrderIsAvailable:arrSellOrderIsAvailable[i].toString()
            }
            
            offers.push(offer);
        }

        //log
        //console.log(sellOffers);
        //console.log(offers);

        return offers;
    }

 
   
    ///////////////////
    //Agent functions//
    ///////////////////
    async getAgentContracts(from){
        let agentDetails = await this.contract.getDeployedContractAgentDetails({from});

        const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=agentDetails;
        //console.log(agentId.toNumber(),agentAddress,agentContractAddress,agentIsMember);
        return agentContractAddress;
        
    }

   /* async createAgentContract(from){
        await this.contract.createAgentContract(1,1,50,{from});
    }*/

    async getRegistrationStatus(agentAddress){
        let status= await this.contract.getRegistrationStatus(agentAddress);
        return status;

    }

    /////////////////////////////////
    //functions from agent contract//
    /////////////////////////////////
    /*
    async agentGetSellOffers(abi){
        let agentDetails = await this.contract.getDeployedContractAgentDetails();

        const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=agentDetails;
        
        //we instanciate the new contract agent to be able to interact with it
        var agentContract = web3.eth.contract(abi).at(agentContractAddress);

        
        //get sell offers
        let sellOffers = await agentContract.getSellOffers();;
        const {0:arrSellOrderId,1:arrSellOrderAgent,2:arrSellOrderUnit,
            3:arrSellOrderPricePerUnit,4:arrSellOrderTotalPrice,5:arrSellOrderIsAvailable}=sellOffers;

        //get total number of sell offers  
        let total = arrSellOrderId.length;

        //descompose sell offers into objects
        let offers = [];
        for (var i = 0; i < total; i++) {
            let offer = {
                OrderId:arrSellOrderId[i].toNumber(),
                OrderAgent:arrSellOrderAgent[i],
                OrderUnit:arrSellOrderUnit[i].toNumber(),
                OrderPricePerUnit:arrSellOrderPricePerUnit[i].toNumber(),
                OrderTotalPrice:arrSellOrderTotalPrice[i].toNumber(),
                OrderIsAvailable:arrSellOrderIsAvailable[i].toString()
            }
            
            offers.push(offer);
        }

        //log
        console.log(sellOffers);
        console.log(offers);

        return offers;
    }
*/

}