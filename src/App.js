import React, { useEffect, useState } from 'react'; // TODO: what does useEffect do?
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = 'vl307';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null); // Define state for wallet address

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
    
  }  

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  )

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


  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>  {/* Styling fanciness */}
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {/* Add the condition to show this only if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
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
