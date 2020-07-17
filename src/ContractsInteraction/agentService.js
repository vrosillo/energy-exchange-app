export class AgentService{
    constructor(contract){
        this.contract=contract;
    }

    ///////////////////
    //Agent functions//
    ///////////////////
    async getAgentDetails(){
        let agentDetails = await this.contract.getAgentDetails();

        const {0:agentAddress,1:agentID,2:agentCreationDate,3:agentAvailableEnergyToSell} = agentDetails;

      

        return agentAvailableEnergyToSell;
        
    }
    //////////////////
    //Sell functions//
    //////////////////

    async newSell(from){
        await this.contract.addSellOrder(10,10,{from});
    }

    /////////////////
    //Buy functions//
    /////////////////
    async newBuy(from){
    await this.contract.buyEnergy(4, 0x6b50d7cd0dfdcddf9987477286f6a83dd537543c , {from} );
    }
}