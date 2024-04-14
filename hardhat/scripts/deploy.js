require("hardhat");
require('dotenv').config({ path: '.env' });
const contractData = require("../contractData.js");
const bytecode = contractData.bytecode;
const abi = contractData.abi;
const { ethers } = require("ethers");

//este script NO ESTÁ FUNCIONANDO CORRECTAMENTE 

async function main() {

    // URL from where we can extract the metadata for the Planets Collection NFTs
    //const metadataURL = "https://ipfs.io/ipfs/QmVs1X2Mda8Lwh7372mxedtnqvhndXE3J2ncVC5eohtDnn/"; ERRONEA
    const metadataURL = "https://ipfs.io/ipfs/QmZ5aAZvEeaxX69e2idwuonYjzVNPVv8Rd7vfGJdK1c2kc/";
  
    const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
    
    const privateKey = process.env.PRIVATE_KEY;
    
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

    const contract = await contractFactory.deploy(metadataURL);

    await contract.deployed();

    console.log("Contrato desplegado en la dirección:", contract.address);
}

main().catch(console.error);