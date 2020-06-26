import ExchangeContract from "../../build/contracts/EnergyExchange.json";
import contract from "truffle-contract";

export default async(provider) =>{
    const exchange=contract(ExchangeContract);
    exchange.setProvider(provider);

    let instance = await exchange.deployed();
    return instance;
};