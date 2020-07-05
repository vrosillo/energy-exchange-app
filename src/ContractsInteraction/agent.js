import AgentContract from "../../build/contracts/Agent.json";
import contract from "truffle-contract";

export default async(provider,addressContract,from) =>{
    const agent=contract(AgentContract);
    agent.setProvider(provider);

    let instance = await agent.new(from,1,2,3,addressContract,{from});
    
    return instance;
};