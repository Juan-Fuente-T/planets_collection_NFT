const hre = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
    // URL from where we can extract the metadata for a LW3Punks
    //const metadataURL = "https://ipfs.io/ipfs/QmVs1X2Mda8Lwh7372mxedtnqvhndXE3J2ncVC5eohtDnn/"; ERRONEA
    const metadataURL = "https://ipfs.io/ipfs/QmZ5aAZvEeaxX69e2idwuonYjzVNPVv8Rd7vfGJdK1c2kc/";
    /*
    DeployContract in ethers.js is an abstraction used to deploy new smart contracts,
    so lw3PunksContract here is a factory for instances of our LW3Punks contract.
    */
    // here we deploy the contract
    const planetsContract = await hre.ethers.deployContract("PlanetsCollection", [
        metadataURL
    ]);

    await planetsContract.waitForDeployment();

    // print the address of the deployed contract
    console.log("PlanetsCollection Contract Address:", planetsContract.target);
}

// Call the main function and catch if there is any error
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });