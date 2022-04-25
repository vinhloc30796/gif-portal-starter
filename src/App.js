import React, { useEffect } from 'react'; // TODO: what does useEffect do?
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = 'vl307';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
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
          const response = await solana.connect({ onlyIfTrusted: true}); // Reference: https://docs.phantom.app/integrating/establishing-a-connection#eagerly-connecting
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString('hex') // TODO: compare toString() with toString('hex')
          )
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
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
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
