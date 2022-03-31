import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/HKDCoin.json";

function App() {
  //The first item in the array is a state variable that we use to store values we will need to refer later using the React useState() hook. The second item is a function that lets us change our state.
  //The parameters of the useState() function are our default values i.e. our wallet connection status is set to false by default.
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [inputValue, setInputValue] = useState({ walletAddress: "", transferAmount: "", burnAmount: "", mintAmount: "" });
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [error, setError] = useState(null);

  const ethers = require('ethers')
  const wallet = ethers.Wallet.createRandom()
  console.log('address:', wallet.address)
  console.log('mnemonic:', wallet.mnemonic.phrase)
  console.log('privateKey:', wallet.privateKey)

  const contractAddress = '0x8b8f781Dd984DC2b0335A2d9Db6004B7A80d69a9';
  const contractABI = abi.abi;

  //Now we have to see if our user has an Ethereum wallet (in this case MetaMask) and if that wallet exists, connect it to our DAPP.
  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) { //Ethereum wallets usually come in the form of browser extensions and when installed will inject a global variable called ethereum into the window object. On this line we check if ethereum is in the window object (window.ethereum) which means a wallet is likely present.
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) 
        //making a request to get an array of metamask accounts and line 5 we're grabbing the first account at index 0, 
        //which is the current connected account. 
        const account = accounts[0];
        // we set our wallet is connected to true, which will render the web3 functionalities of our dapp that we gated. .
        setIsWalletConnected(true);
        // we store the wallet address of the current connected account
        setYourWalletAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Install a MetaMask wallet to get our token.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }
  //checkIfWalletIsConnected() is being loaded as soon as our app loads via the useEffect() hook at line 147. You can read more details about this process in the official MetaMask docs.

  //Getter Functions (is free)
  const getTokenInfo = async () => {
    try {
      if (window.ethereum) { //checking if the ethereum object is present 
        //A provider lets us connect to the ethereum blockchain, in this case the Rinkeby testnet via an ethereum node. We're using MetaMask's provider which uses Infura behind the scenes. You can read more about providers here. It's important to know providers can only complete read only actions.
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        //Now with our provider we get a signer which is an abstraction of your MetaMask wallet that lets you interact with the blockchain without revealing your private keys. As a signer, you can write to the ethereum blockchain via transactions.
        const signer = provider.getSigner();
        ////Next we get our contract using our contract address, the ABI file, and a signer.
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        //We're then pulling the first account from MetaMask.
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        //we're pulling our token name, symbol, the owner of the token and the total supply. 
        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply) //we get this suppy and then format it so that it is readable for our users.
        //Then right after we're using our setter functions to set our initial state variables to these new values so they can be rendered into our app. I added an emoji for my token name as an extra touch and to save some gas. Remember these functions were inherited via OpenZeppelin.
        setTokenName(`${tokenName} 🐖`);
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);
        //What we're doing here is checking if the connected account is the token owner. If that is the case, they will unlock the functionality in our DAPP to burn tokens and mint new ones.
        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          setIsTokenOwner(true)
        }

        console.log("Token Name: ", tokenName);
        console.log("Token Symbol: ", tokenSymbol);
        console.log("Token Supply: ", tokenSupply);
        console.log("Token Owner: ", tokenOwner);
      }
    } catch (error) {
      console.log(error);
    }
  }
//Setter Functions
//We're using 3 setter fuctions in our code, transferToken() to send tokens to our friends, burnTokens() and mintTokens() so that we can control the supply of our tokens.
  const transferToken = async (event) => { //Remember setter functions cost gas and requires a signer to initiate it.
    event.preventDefault(); // event.preventDefault()  prevents our dapp from reloading everytime we submit our form.
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);


        // send tokens to our friends using the transfer() function, all we need is their address and the amount we want to send for our parameters.
        //Then we just wait for our Tokens to be transferred, note that it can take some time for the transaction to resolve, even on a testnet. 
        const txn = await tokenContract.transfer(inputValue.walletAddress, utils.parseEther(inputValue.transferAmount));
        console.log("Transfering tokens...");
        await txn.wait();
        //Then finally once our transaction is resolved, we console.log the hash which you can put in Etherscan to see the details of your transaction.
        console.log("Tokens Transfered", txn.hash);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }
//You might have heard of burning tokens and minting tokens, this has spawned the entire field of "Tokenomics". As the name implies burning a token destroys it for good. Depending on your needs you can control the inflation and deflation rates of your tokens. You can even burn a token to mint a new one, like Terra burns Luna to create UST (a stable coin), see here for more.
  const burnTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await tokenContract.burn(utils.parseEther(inputValue.burnAmount)); //calling the burn function from the OpenZeppelin Burnable library in our contract
        console.log("Burning tokens...");
        await txn.wait();
        console.log("Tokens burned...", txn.hash);
//right after our tokens are burned we get the new total supply of our token then update our token supply to the new total 
//and format it into a readable number using utils.formatEther().
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }
//Minting Tokens
//Perhaps our token is going viral and there is so much demand, we need to print more, then we can mint new tokens.
  const mintTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(tokenOwner, utils.parseEther(inputValue.mintAmount)); //we call the mint() function which comes out of the box with OpenZeppelin which actually checks to see if we're the owner of the contract before we can mint more by taking in the contract owner's address as a parameter, followed by the amount we want to mint. We use parseEther here to reverse it back to Wei (10*18). 
        console.log("Minting tokens...");
        await txn.wait();
        console.log("Tokens minted...", txn.hash);
//After our transaction is finished, we then wait for the new supply, format it as a readable number and update our token supply.
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }
//handleInputChange() lets us grab the value from our form inputs and pass it to our handler functions. 
  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }
//useEffect() is a react hook that loads up all of our functions when the dapp first loads. We're using it to check if the user has a wallet and then load the data for our token. 
  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenInfo();
  }, [])
//html styling
  return (
    <main className="main-container">
      <h2 className="headline">
        <span className="headline-gradient">Ayer Meme Coin Project</span>
        <img className="inline p-3 ml-2" src="https://i.imgur.com/5JfHKHU.png" alt="Ayer Meme Coin" width="60" height="30" />
      </h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          <span className="mr-5"><strong>Coin:</strong> {tokenName} </span>
          <span className="mr-5"><strong>Ticker:</strong>  {tokenSymbol} </span>
          <span className="mr-5"><strong>Total Supply:</strong>  {tokenTotalSupply}</span>
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-double"
              onChange={handleInputChange}
              name="walletAddress"
              placeholder="Wallet Address"
              value={inputValue.walletAddress}
            />
            <input
              type="text"
              className="input-double"
              onChange={handleInputChange}
              name="transferAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.transferAmount}
            />
            <button
              className="btn-purple"
              onClick={transferToken}>Transfer Tokens</button>
          </form>
        </div>
        {isTokenOwner && (
          <section>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="burnAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.burnAmount}
                />
                <button
                  className="btn-purple"
                  onClick={burnTokens}>
                  Burn Tokens
                </button>
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="mintAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.mintAmount}
                />
                <button
                  className="btn-purple"
                  onClick={mintTokens}>
                  Mint Tokens
                </button>
              </form>
            </div>
          </section>
        )}
        <div className="mt-5">
          <p><span className="font-bold">Contract Address: </span>{contractAddress}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Token Owner Address: </span>{tokenOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{yourWalletAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>

      </section>
    </main>
  );
}
export default App;
