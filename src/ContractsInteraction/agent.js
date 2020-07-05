import AgentContract from "../../build/contracts/Agent.json";
import contract from "truffle-contract";

export default async(provider,ExchangeContractAddress,from) =>{
    const agent=contract(AgentContract);
    agent.setProvider(provider);

    //to create a new instance we need to pass to the constructor:
    // agentAddress,agentId, agentCreationDate,agentAvailableEnergyToSell, ExchangeContractAddress, {agentAddress}
    let instance = await agent.new(from,1,15041993,50,ExchangeContractAddress,{from});
    
    return instance;
};