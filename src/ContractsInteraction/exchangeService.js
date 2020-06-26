export class ExchangeService{
    constructor(contract){
        this.contract=contract;
    }

    ///////////////////
    //Agent functions//
    ///////////////////
    
    //////////////////
    //Sell functions//
    //////////////////

    async newSell(_agentAddr,_pricePerUnit,_unit){
        return this.contract.saveSellOrder(_agentAddr,_pricePerUnit,_unit);
    }

}