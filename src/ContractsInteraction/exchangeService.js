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


        async getBuyOffers(){
        
            //get buy offers
            let buyOffers = await this.contract.getBuyOffers();
            const {0:arrBuyOrderId,1:arrBuyOrderBuyer,2:arrBuyOrderUnit,
                3:arrBuyOrderPricePerUnit,4:arrBuyOrderTotalPrice,5:arrBuySellOrderId}=buyOffers;

               
    
            //get total number of buy offers  
            let total = arrBuyOrderId.length;
    
            //descompose buy offers into objects
            let offers = [];
            for (var i = 0; i < total; i++) {
                let offer = {
                    OrderId:arrBuyOrderId[i].toNumber(),
                    OrderBuyer:arrBuyOrderBuyer[i],
                    OrderUnit:arrBuyOrderUnit[i].toNumber(),
                    OrderPricePerUnit:arrBuyOrderPricePerUnit[i].toNumber(),
                    OrderTotalPrice:arrBuyOrderTotalPrice[i].toNumber(),
                    OrderSellId:arrBuySellOrderId[i].toNumber()
                }
                
                offers.push(offer);
            }
    
            //log
            //console.log(sellOffers);
            //console.log(offers);
    
            return offers;
        }

}