const EnergyExchange = artifacts.require('EnergyExchange');
const Agent = artifacts.require("Agent");


let instance;

//we want to deploy a fresh new contract everytime before each test
//to avoid being conditionated for the contract status
beforeEach(async () => {
    instance = await EnergyExchange.new();
});

contract('EnergyExchange', accounts => {

    /////////////////////////////////
    //EnergyExchange contract tests//
    /////////////////////////////////

        //////////////////////
        //Registration tests//
        //////////////////////

        //Test 1: Agent creation: We create an Agent contract from an account, and then we see if that Agent Contract 
        //is registered in the Exchange. (to do so, the getDeployedContractAgentDetails() should be executed by the agent account that created the contract)
        
        it('should return the deployed agent contract details', async() =>{

            await instance.createAgentContract(1,22062020,50, {from:accounts[1]});

            let result1 = await instance.getDeployedContractAgentDetails({from:accounts[1]});
            
            const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=result1;

            assert(agentId==1, 'AgentId should be equal to 1');
            assert(agentAddress==accounts[1],'Agent address should be equal to accounts[1]');
            assert(agentContractAddress!='0x0000000000000000000000000000000000000000', 'Agent Contract Address should be different to 0x0000000000000000000000000000000000000000');
            assert(agentIsMember==true,'AgentIsMember should be equal to true');
            
        });

        //Test 2: Registration status: We pass the address of an agent to see its status
        //we will register agent with accounts[1], and ask for the status of the agent with accounts[1] and accounts[2]

        it('should return the agent contract deployed status', async() =>{

            await instance.createAgentContract(1,22062020,50, {from:accounts[1]});

            let result2 = await instance.getRegistrationStatus(accounts[1]);
            let result3 = await instance.getRegistrationStatus(accounts[2]);  

            assert(result2==true, 'AgentIsMember should be equal to true');
            assert(result3==false,'AgentIsMember should be equal to false');
            
        });

        //////////////////
        //Sell functions//
        //////////////////

        //Test 3: Save sell order: An agent save a few sell order and then we see if it they were registered correctly in the exchange
        it('should return the saved sell order', async() =>{

            await instance.saveSellOrder(accounts[1],10,10);
            await instance.saveSellOrder(accounts[1],45,50);
            
            let result4 = await instance.getSellOffers();
        
            const {0:arrSellOrderId,1:arrSellOrderAgent,2:arrSellOrderUnit,
                3:arrSellOrderPricePerUnit,4:arrSellOrderTotalPrice,5:arrSellOrderIsAvailable}=result4;
            
            assert(arrSellOrderId[0]==1 && arrSellOrderId[1]==2, 'SellOrderId has not been saved properly');
            assert(arrSellOrderAgent[0]==accounts[1] && arrSellOrderAgent[1]==accounts[1], 'arrSellOrderAgent has not been saved properly');
            assert(arrSellOrderUnit[0]==10 && arrSellOrderUnit[1]==50, 'arrSellOrderUnit has not been saved properly');
            assert(arrSellOrderPricePerUnit[0]==10 && arrSellOrderPricePerUnit[1]==45, 'arrSellOrderPricePerUnit has not been saved properly');
            assert(arrSellOrderTotalPrice[0]==arrSellOrderUnit[0]*arrSellOrderPricePerUnit[0] && arrSellOrderTotalPrice[1]==arrSellOrderUnit[1]*arrSellOrderPricePerUnit[1], 'arrSellOrderTotalPrice has not been saved properly');
            assert(arrSellOrderIsAvailable[0]==true && arrSellOrderIsAvailable[1]==true, 'arrSellOrderIsAvailable has not been saved properly');
            
        });

        //Test 4: Cancel sell order: An agent save a sell order and then cancels it. The variable IsAvailable of that offer should be equal to false
        it('should return the saved sell order with status == cancel', async() =>{

            await instance.saveSellOrder(accounts[1],10,10,{from:accounts[1]});
            await instance.cancelSellOrder(accounts[1],1);
            
            let result5 = await instance.getSellOffers();
        
            const {0:arrSellOrderId,1:arrSellOrderAgent,2:arrSellOrderUnit,
                3:arrSellOrderPricePerUnit,4:arrSellOrderTotalPrice,5:arrSellOrderIsAvailable}=result5;
            
            assert(arrSellOrderIsAvailable[0]==false, 'arrSellOrderIsAvailable has not been saved properly');
            
        });

        /////////////////
        //Buy functions//
        /////////////////

        //Test 5: Save a buy order: An agent creates a sell order, a different agent buy that offer and we see that this was saved properly in the exchange
        it('should return the created buy offer', async() =>{

            await instance.saveSellOrder(accounts[1],10,10,{from:accounts[1]});
            await instance.saveBuyOrder(accounts[2],10,10,100,1,{from:accounts[2]});
            
            let result6 = await instance.getBuyOffers();
        
            const {0:arrBuyOrderId,1:arrBuyOrderBuyer,2:arrBuyOrderUnit,
                3:arrBuyOrderPricePerUnit,4:arrBuyOrderTotalPrice,5:arrBuyOrderSellId}=result6;
            
            assert(arrBuyOrderId[0]==1, 'arrBuyOrderId has not been saved properly');
            assert(arrBuyOrderBuyer[0]==accounts[2], 'arrBuyOrderBuyer has not been saved properly');
            assert(arrBuyOrderUnit[0]==10, 'arrBuyOrderUnit has not been saved properly');
            assert(arrBuyOrderPricePerUnit[0]==10, 'arrBuyOrderPricePerUnit has not been saved properly');
            assert(arrBuyOrderTotalPrice[0]==100, 'arrBuyOrderTotalPrice has not been saved properly');
            assert(arrBuyOrderSellId[0]==1, 'arrBuyOrderSellId has not been saved properly');
            
        });
    
        /////////////////////////////////
    //EnergyExchange contract tests//
    /////////////////////////////////
    
        //////////////////////
        //Agent Details tests//
        //////////////////////

        //Test 6: Get agent details: We create an Agent contract from an account, and then we see if the Agent Contract 
        //details are recorded properly
        
        it('should return the deployed agent details', async() =>{
            //we create the new contract in the exchange
            await instance.createAgentContract(1,22062020,50, {from:accounts[1]});

            let result7 = await instance.getDeployedContractAgentDetails({from:accounts[1]});
            
            const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=result7;

            //we instanciate the new contract agent to be able to interact with it
            let agentContract = await Agent.at(agentContractAddress);

            //get the agent details
            let result8= await agentContract.getAgentDetails({from:accounts[1]});

            let {0:_agentAddress,1:_agentID,2:_agentCreationDate,3:_agentAvailableEnergyToSell}= result8;

            assert(_agentAddress==accounts[1],"the _agentAddress has not been saved properly");
            assert(_agentID==1,"the _agentID has not been saved properly");
            assert(_agentCreationDate==22062020,"the _agentCreationDate has not been saved properly");
            assert(_agentAvailableEnergyToSell==50,"the _agentAvailableEnergyToSell has not been saved properly");
            
        });

        //Test 7: Update available energy to sell: We create an Agent contract from an account and we update the available energy to sell
        //and then we see if the transaction has been properly recorded
        
        
        it('should return the updated available energy to sell', async() =>{
            //we create the new contract in the exchange
            await instance.createAgentContract(1,22062020,50, {from:accounts[1]});

            let result9 = await instance.getDeployedContractAgentDetails({from:accounts[1]});
            
            const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=result9;

            //we instanciate the new contract agent to be able to interact with it
            let agentContract = await Agent.at(agentContractAddress);
            
            //we update the available energy to sell
            await agentContract.updateAvailableEnergyToSell(89,{from:accounts[1]});

            
            //get the agent details
            let result10= await agentContract.getAgentDetails({from:accounts[1]});

            let {0:_agentAddress,1:_agentID,2:_agentCreationDate,3:_agentAvailableEnergyToSell}= result10;

            assert(_agentAvailableEnergyToSell==89,"the _agentAvailableEnergyToSell has not been saved properly");
            
        });


        ////////////////////
        //Agent Sell tests//
        ////////////////////

        //Test 8: Add sell order from agent account: We create an Agent contract from an account, and then we create a new sell order from the
        //agent account
        
        it('should return the new added sell offer', async() =>{
            //we create the new contract in the exchange
            await instance.createAgentContract(1,22062020,50, {from:accounts[1]});

            let result11 = await instance.getDeployedContractAgentDetails({from:accounts[1]});
            
            const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=result11;

            //we instanciate the new contract agent to be able to interact with it
            let agentContract = await Agent.at(agentContractAddress);

            
            //we add the new sell order from the agent account
            await agentContract.addSellOrder(10,10,{from:accounts[1]});

            //we get the sell offers
            let result12 = await instance.getSellOffers();
        
            const {0:arrSellOrderId,1:arrSellOrderAgent,2:arrSellOrderUnit,
                3:arrSellOrderPricePerUnit,4:arrSellOrderTotalPrice,5:arrSellOrderIsAvailable}=result12;

            assert(arrSellOrderId[0]==1,'arrSellOrderId has not been saved properly');
            assert(arrSellOrderAgent[0]==accounts[1],'arrSellOrderAgent has not been saved properly');
            assert(arrSellOrderUnit[0]==10,'arrSellOrderUnit has not been saved properly');
            assert(arrSellOrderPricePerUnit[0]==10,'arrSellOrderPricePerUnit has not been saved properly');               
            assert(arrSellOrderTotalPrice[0]==100,'arrSellOrderTotalPrice has not been saved properly');
            assert(arrSellOrderIsAvailable[0]==true,'arrSellOrderIsAvailable has not been saved properly');       
           
        });
        

        //Test 9: Add sell order from not the agent account: We create an Agent contract from an account, and then we create a new sell order from
        //not the agent account, but another one. This should not be possible

        it('should not add the sell offer', async() =>{
            //we create the new contract in the exchange
            await instance.createAgentContract(1,22062020,50, {from:accounts[1]});

            let result13 = await instance.getDeployedContractAgentDetails({from:accounts[1]});
            
            const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=result13;

            //we instanciate the new contract agent to be able to interact with it
            let agentContract = await Agent.at(agentContractAddress);

            
            //we add the new sell order from not the agent account
           
            let err = null

            try {
            await agentContract.addSellOrder(10,10,{from:accounts[2]});
            } catch (error) {
            err = error
            }

            assert.ok(err instanceof Error)
           
        });

        ///////////////////
        //Agent buy tests//
        ///////////////////
        
        //Test 10: Add buy order from agent account: We create an Agent contract from an account, we create a sell offer and then we create a new buy order from the
        //agent account

        it('should let us buy energy', async() =>{
            //we create the new contract in the exchange
            await instance.createAgentContract(1,22062020,50, {from:accounts[1]});

            let result14 = await instance.getDeployedContractAgentDetails({from:accounts[1]});
            
            const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=result14;

            //we instanciate the new contract agent to be able to interact with it
            let agentContract = await Agent.at(agentContractAddress);

            
            //we add the new sell order from the agent account
            await agentContract.addSellOrder(10,10,{from:accounts[1]});

            //we buy the created sell offer
            await agentContract.buyEnergy(1,accounts[1],{from:accounts[1],value:100});
           
        });
        

        //Test 11: Add buy order from agent account with insufficient amount of money: We create an Agent contract from an account, we create a sell offer and then we create a new buy order from the
        //agent account

        it('should not let us buy energy', async() =>{
            //we create the new contract in the exchange
            await instance.createAgentContract(1,22062020,50, {from:accounts[1]});

            let result15 = await instance.getDeployedContractAgentDetails({from:accounts[1]});
            
            const {0:agentId,1:agentAddress,2:agentContractAddress,3:agentIsMember}=result15;

            //we instanciate the new contract agent to be able to interact with it
            let agentContract = await Agent.at(agentContractAddress);

            
            //we add the new sell order from the agent account
            await agentContract.addSellOrder(10,10,{from:accounts[1]});

            //we buy the created sell offer but with not enough value sent
            let err = null

            try {
                await agentContract.buyEnergy(1,accounts[1],{from:accounts[1],value:40});
            } catch (error) {
            err = error
            }

            assert.ok(err instanceof Error)
            
           
        });

});