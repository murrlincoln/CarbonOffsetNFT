import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './App.css';
import CallViewMethodButton from './components/CallViewMethodButton';
import ConnectToMetamaskButton from './components/ConnectToMetamaskButton';
import Pending from "./components/Pending";
// Update contract.abi.json to contain your contract's ABI
import contractAbi from './contract.abi.json';
import useConnection from './hooks/Connection';

// Modify this to be your contract's address
const contractAddress = '0xE38F44544D868D0cECc3fc197555A3b81Fc36098';

//determines if there is a current pending transaction
let hasPendingTransactions;

var network = ethers.providers.getNetwork("kovan")


//provider depends on whether or not metamask is installed
let provider;
let contract;

if (window.ethereum) {
  provider = new ethers.providers.Web3Provider(window.ethereum);

  contract = new ethers.Contract(
    contractAddress,
    contractAbi,
    provider.getSigner(0),
  );
} else {
  provider = new ethers.providers.getDefaultProvider(network);
  contract = new ethers.Contract(
    contractAddress,
    contractAbi,
  );
}



function updateSupply(getSupply) {
  setInterval(getSupply, 5000)
}

function App() {
  // Custom React hook that listens to MetaMask events
  // Check it out in ./hooks/Connection.js
  const { isConnected, address } = useConnection();

  // A few state variables just to demonstrate different functionality of the ethers.js library
  const [supply, setSupply] = useState('');
  const [balance, setBalance] = useState('');


  useEffect(() => {
    if (isConnected) {
      if (isConnected) {
        contract.on('Mint', (to, tokenID) => {
          console.log('Mint', to, tokenID)
          alert('Transaction completed!')
          hasPendingTransactions = false;
        })
      }
    }
  }, [isConnected, address]);

  // Read-only method call
  const getSupply = async () => {
    if (isConnected) {
      setSupply((await contract.totalSupply()).toString());
    }
  };

  // Read-only method call, returns a BigNumber
  const getBalance = async () => {
    if (isConnected) {
      setBalance((await contract.balanceOf(address)).toString());
    }
  };

  // Write method with attached ETH
  const mintNFT = async () => {
    const valueStr = prompt(
      'How much would you like to offset?',
      'Value in ether (Must be greater than 0.00019662 ether)',
    );

    if (valueStr !== null) {
      // This promise will reject if the user cancels the transaction
      hasPendingTransactions = true;
      await contract.mintNFT(('https://raw.githubusercontent.com/murrlincoln/CarbonOffsetNFT/main/NFTURI.json'), {
        // Attach additional value to this transaction
        value: ethers.utils.parseEther(valueStr),
      });


    }
  };





  return (
    <main>
      <div className="div">
        <h1 className="title">Carbon Neutralized</h1>
        <h3>Join {supply} others on the journey to carbon neutrality</h3>
        {updateSupply(getSupply)}

        {!window.ethereum ? (
          <>
            <p>
              Please install a Web3 provider like{' '}
              <a href="https://metamask.io/">MetaMask</a> to use this app.
            </p>
          </>
        ) : (
          <div className="connected">
            {isConnected ? (
              <>
                <p>You are connected to a web3 provider.</p>
                <p>Your current wallet address is {address}.</p>
                <p style={{ color: "red" }}>WARNING: CURRENTLY IN BETA, ONLY WORKING ON KOVAN TESTNET</p>
                <CallViewMethodButton
                  name="Your balance"
                  onUpdate={getBalance}
                  value={balance}
                />

                <button type="button" onClick={mintNFT}>
                  Offset your carbon footprint!
                </button>

                {hasPendingTransactions ? (
                  <>
                    <h1 className="pending">Pending...</h1>
                  </>) : (<> </>)}
              </>
            ) : (
              <ConnectToMetamaskButton />
            )}
          </div>

        )}

      </div>
      <div className="faqSection">
        <h1 className="faq">Frequently Asked Questions</h1>
        <h2 className="question">What is this website?</h2>
        <p className="answer">Carbon Neutralized allows Ethereum users to take control of their carbon footprint. One of the biggest arguments against Ethereum is that it is environmentally unfriendly due to the mining process. Even though this will be mitigated with ETH 2.0, there is still many years of carbon emissions that Ethereum has been responsible for. By offseting your transaction, you can rest assured that you are carbon neutral and are helping to create a more sustainable blockchain</p>
        <h2 className="question">How does it work?</h2>
        <p className="answer">Carbon Neutralized takes advantage of two main technologies. First, it uses Universal Protocol's <a href="https://universalcarbon.com/">UPC02 token</a>, which is a carbon credit based on the blockchain that represents one ton of carbon emissions. Second, it uses Uniswap in order to swap ETH to these tokens, and burn them so they are completely out of circulation. By doing this, you are effectively buying a carbon credit and using it to offset any emissions you may have caused through your transactions.</p>
        <h2 className="question">What is a carbon credit?</h2>
        <p className="answer">From Investopedia: A carbon credit is a permit that allows the company that holds it to emit a certain amount of carbon dioxide or other greenhouse gases. One credit permits the emission of a mass equal to one ton of carbon dioxide. <br></br>We are taking advantage of these credits to allow users to voluntary offset their carbon emissions</p>
        <h2 className="question">Where can I find the GitHub repo for this project?</h2>
        <p className="answer">Great question! It can be found <a href="https://github.com/murrlincoln/CarbonOffsetNFT">here</a>.</p>
      </div>
    </main>
  )

}

export default App;
