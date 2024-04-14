import { Contract, providers, utils, ethers } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";


export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // Define a new state to hold the metadata of the tokens
  const [tokenMetadatas, setTokenMetadatas] = useState({});

  /**
   * publicMint: Mint an NFT
   */
  const publicMint = async () => {
    try {
      //console.log("Public mint");
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the LW3Punks
      const tx = await nftContract.mint({
        // value signifies the cost of one Planet NFT which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Planet NFT!");
    } catch (err) {
      console.error(err);
    }
  };

  /*
        connectWallet: Connects the MetaMask wallet
      */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
  /* const getTokenIdsMinted = async () => {
     try {
       // Get the provider from web3Modal, which in our case is MetaMask
       // No need for the Signer here, as we are only reading state from the blockchain
       const provider = await getProviderOrSigner();
       // We connect to the Contract using a Provider, so we will only
       // have read-only access to the Contract
       const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
       // call the tokenIds from the contract
       const _tokenIds = await nftContract.tokenIds();
       let number = parseInt(_tokenIds);
       setNftNumber(number);
       console.log("NUMBER", nftNumber);
 
       console.log("tokenIds2", number);
       //console.log("tokenIds", _tokenIds);
       //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
       setTokenIdsMinted(_tokenIds.toString());
     } catch (err) {
       console.error(err);
     }
   };*/


  /**
   * getAllTokenMetadata: gets the metadata of tokenIds that have been minted
   */

  const getAllTokenMetadata = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      // convert number hex to decimal
      let number = parseInt(_tokenIds)
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
      // Initialize an empty object to hold the metadata
      const metadata = {};
      // Loop from 1 to nftNumber
      for (let i = 1; i <= number; i++) {
        // Get the tokenId for this index
        const tokenId = i;
        // Get the tokenURI for this tokenId
        const tokenURI = await nftContract.tokenURI(tokenId);
        //console.log("TokenURI", tokenURI);
        // Fetch the metadata from the tokenURI
        const response = await fetch(tokenURI);
        const metadataResponse = await response.json();
        // Save the metadata in the metadata object
        metadata[tokenId] = metadataResponse;
        //console.log("Metadata", metadata);
      }
      // Update the state with the new metadata
      setTokenMetadatas(metadata);
    } catch (err) {
      console.error(err);
    }
  };
  /**
   * getAllTokenMetadata: gets the metadata of tokenIds that have been minted
   */
  /*const getAllTokenMetadata = async () => {
    try {
      // Get the provider from web3Modal
      const provider = await getProviderOrSigner();
      // Connect to the Contract using a Provider
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // Call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      console.log("TokenIds", _tokenIds);
      let tokenIdNumber = _tokenIds[i].toNumber();
      // Initialize an empty object to hold the metadata
      const metadata = {};
      // Loop through all the tokenIds
      for (let i = 0; i < _tokenIds.length; i++) {
        const tokenId = _tokenIds[i];
        // Get the tokenURI for each tokenId
        const tokenURI = await nftContract.tokenURI(tokenId);
        console.lod("TokenURI", tokenURI);
        // Fetch the metadata from the tokenURI
        const response = await fetch(tokenURI);
        const metadataResponse = await response.json();
        // Save the metadata in the metadata object
        metadata[tokenId] = metadataResponse;
      }
      // Return the metadata object
      console.log("METAdata", metadata);
      return metadata;
    } catch (err) {
      console.error(err);
    }
  };*/





  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Sepolia network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 11155111) {
      window.alert("Change the network to Sepolia");
      throw new Error("Change network to Sepolia");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  // debounceTimer holds the identifier for the timeout
  let debounceTimer;
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
    }
  }, [walletConnected]);

  // Second effect for getting the NFT data
  useEffect(() => {
    // Initial call to getAllTokenMetadata to get the minted NFTs
    getAllTokenMetadata().then(metadatas => {
      if (metadatas) {
        setTokenMetadatas(metadatas);
      }
    }).catch(err => {
      console.error(err);
    });


    setInterval(async function () {
      // clearTimeout is used to cancel any pending call to getAllTokenMetadata()
      // This prevents multiple simultaneous calls to getAllTokenMetadata()
      clearTimeout(debounceTimer);

      // debounceTimer is a variable that stores the identifier for the timeout
      // It's used to delay the call to getAllTokenMetadata() until 5 seconds have passed since the last call
      debounceTimer = setTimeout(async () => {
        const metadatas = await getAllTokenMetadata();
        const currentMintedCount = metadatas.length;
        // Only update the data if the number of minted NFTs has changed
        if (parseInt(tokenIdsMinted) !== currentMintedCount) {
          setTokenMetadatas(metadatas);
          setTokenIdsMinted(currentMintedCount.toString());
        }
      }, 5 * 1000);
    }, 5 * 1000);
  }, []);

  /*
        renderButton: Returns a button based on the state of the dapp
      */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wallet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    return (
      <button className={styles.button} onClick={publicMint}>
        Public Mint 🚀
      </button>
    );
  };

  return (
    <div>
      <Head>
        <title>Planets Collection</title>
        <meta name="description" content="PlanetsCollection-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div className={styles.main_container}>
          <div className={styles.texts_main_container}>
            <h1 className={styles.title}>Welcome to Planets Collection!</h1>
            <div className={styles.description}>
              {/* Using HTML Entities for the apostrophe */}
              It&#39;s an NFT collection of posters published by NASA.
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/20 have been minted
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="/Galaxia_espiral_aplicacion_minteo_NFTs_planetas_NASA.jpg" />
          </div>
        </div>
        <div className={styles.description2}>
          Mint an NFT in Sepolia and be surprised with a <br />magnificent image of our solar system created by NASA
        </div>
        <div className={styles.nft_container} >
          {tokenMetadatas && Object.entries(tokenMetadatas).map(([tokenId, metadata], index) => (
            <div key={index}>
              <div><img className={styles.nft_image} src={metadata.image} /></div>
              ID: {tokenId}
              <div>Name: {metadata.name}</div>
              <div>Description: {metadata.description}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Juan Fuente</footer>
    </div>
  );
}