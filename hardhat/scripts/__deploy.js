const hre = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
    // URL from where we can extract the metadata for the Planets Collection NFTs
    //const metadataURL = "https://ipfs.io/ipfs/QmVs1X2Mda8Lwh7372mxedtnqvhndXE3J2ncVC5eohtDnn/"; ERRONEA
    const metadataURL = "https://ipfs.io/ipfs/QmZ5aAZvEeaxX69e2idwuonYjzVNPVv8Rd7vfGJdK1c2kc/";
    /*
    DeployContract in ethers.js is an abstraction used to deploy new smart contracts,
    so planetsContract here is a factory for instances of our PlanetsCollection contract.
    */
    // here we deploy the contract
    /*const planetsContract = await hre.ethers.deployContract("PlanetsCollection", [
        metadataURL
    ]);

    await planetsContract.waitForDeployment();

    
    console.log("PlanetsCollection Contract Address:", planetsContract.target);
*/
    // Obtener la fábrica del contrato
    const PlanetsCollection = await hre.ethers.getContractFactory("PlanetsCollection");

    // Desplegar el contrato
    const planetsContract = await PlanetsCollection.deploy(metadataURL);
     
    // Esperar a que la transacción de despliegue se complete
    await planetsContract.waitForDeployment();

    const receipt = await planetsContract.deployTransaction.wait();
    console.log(receipt.logs);

    // Imprimir la dirección del contrato desplegado
    console.log("Dirección del contrato PlanetsCollection:", planetsContract.getAddress());
}

// Call the main function and catch if there is any error
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });