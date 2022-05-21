import React, { useEffect, useState } from 'react'; // TODO: what does useEffect do?
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

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

  const sendGif = async () => {
    if (inputValue.length > 0 & inputValue.endsWith('.gif')) {
      console.log('Gif link:', inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue('');
    }
    else {
      alert('Please enter a valid GIF link!');
    }
  }
  
  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  )

  const renderConnectedContainer = () => (
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
        {gifList.map((gif, index) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={`Gif ${index}`} />
          </div>
        ))}
      </div>
    </div>
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

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      // TODO: Add Solana program
      // Set state
      setGifList(TEST_GIFS);
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
