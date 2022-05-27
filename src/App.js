import React, { useEffect, useState } from 'react'; // TODO: what does useEffect do?
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

// Statics
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from './idl.json';
import kp from './keypair.json';

// Constants
const TWITTER_HANDLE = 'vl307';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
  'https://media.giphy.com/media/oNFP9kltPi7fp8TUAV/giphy.gif', // to the moon!
	'https://media.giphy.com/media/5efT9uLuaJoM3lGKIt/giphy.gif', // just hold it
	'https://media.giphy.com/media/d0DdMCREQChi3jGymW/giphy.gif', // diamond hands
	'https://media.giphy.com/media/evB90wPnh5LxG3XU5o/giphy.gif', // apes together strong
  'https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif', // stonks
  'https://media.giphy.com/media/Y2ZUWLrTy63j9T6qrK/giphy.gif', // money printer goes brrr
]

// SystemProgram is the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create keypair for the GIF data account
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = Keypair.fromSecretKey(secret);

// Get our program ID
const programId = new PublicKey(idl.metadata.address);

// Set the network to devnet
const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}


const App = () => {
  const [walletAddress, setWalletAddress] = useState(null); // Define state for wallet address
  const [inputValue, setInputValue] = useState(''); // Define state for input value
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    /**
     * Checks if a Phanton Wallet is connected to the browser.
     */
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');

          // Calling the connect function will trigger the wallet to connect to the browser.
          const response = await solana.connect({ onlyIfTrusted: true }); // Reference: https://docs.phantom.app/integrating/establishing-a-connection#eagerly-connecting
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString('hex') // TODO: compare toString() with toString('hex')
          );

          setWalletAddress(response.publicKey.toString('hex')); // Store the wallet address for later use
        }
      }
      else {
        alert ('Solana object not found! Get a Phantom Wallet at https://phantom.app/');
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    // No longer just a placeholder!
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString('hex'));
      setWalletAddress(response.publicKey.toString('hex'));
    }
    
  };
  
  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, window.solana, opts.preflightCommitment);
    return provider;
  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  )

  const renderConnectedContainer = () => {
    // Check if program account has been created or not, if not, create it
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Create GIF Account (one-time init only!) 🏃‍♂️
          </button>
        </div>
      )
    }
    // If created, then proceed as normal
    else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
            <input 
              type="text" 
              placeholder="Enter GIF link (ending in .gif)"
              value={inputValue}
              onChange={onInputChange}
              ></input>
            <button type="submit" className="cta-button submit-gif-button">Submit</button>
          </form>
          <div className="gif-grid">
            {gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} />
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  /**
   * Runs the checkIfWalletIsConnected function when the component mounts.
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log('Got the account:', account);
      setGifList(account.gifList);
    } catch (error) {
      console.log('Erorr found in getGifList: ', error);
      setGifList(null);
    }
  };

  const createGifAccount = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
      console.log("Ping! 🏓")
      
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      })
      console.log('Created new BaseAccount:', baseAccount.publicKey.toString());
      await getGifList()
    }
    catch (error) {
      console.log('Error creating BaseAccount: ', error);
    }
  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log('No input value! 🤔');
      return;
    }
    setInputValue('');
    console.log('Gif link:', inputValue);

    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
      console.log("Ping! 🏓")

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      })
      console.log('GIF sent to program: ', inputValue);
      await getGifList()
    } catch (error) {
      console.log('Error sending GIF: ', error);
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      // TODO: Add Solana program
      getGifList()
      // Set state: setGifList(TEST_GIFS);
    }
  }, [walletAddress]);


  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>  {/* Styling fanciness */}
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨ <br/> Money Printer Goes Brrr! 💵🖨️🔥🔥🔥
          </p>
          {/* Add the condition to show this only if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
          {/* Add the condition to show this only if we do have a wallet address */}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
