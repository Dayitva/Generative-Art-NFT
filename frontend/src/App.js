import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import GenArtNft from "./utils/GenArtNFT.json";

// Constants
const BUILDSPACE_TWITTER_HANDLE = "_buildspace";
const BUILDSPACE_TWITTER_LINK = `https://twitter.com/${BUILDSPACE_TWITTER_HANDLE}`;
const MY_TWITTER_HANDLE = "Dayitva_Goel";
const MY_TWITTER_LINK = `https://twitter.com/${MY_TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x0985Bb89918B6f0b6A0aF4849A45a543d1e8C8B6";
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/squarenft-timpnxqcwn";
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [openseaLink, setOpenseaLink] = useState("");
  const [minted, setMinted] = useState(false);
  const [mintCount, setMintCount] = useState(0);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("You need MetaMask to access this website!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        setupEventListener();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getNFTCollectionStats = async () => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        GenArtNft.abi,
        signer
      );
      
      let NFTsMinted = await connectedContract.getTotalNFTsMintedSoFar();

      setMintCount(parseInt(NFTsMinted));
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          GenArtNft.abi,
          signer
        );

        connectedContract.on("NewGenArtNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setOpenseaLink(
            `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          setMinted(true);
          getNFTCollectionStats();
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          GenArtNft.abi,
          signer
        );

        let chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("Connected to chain " + chainId);

        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = "0x4";
        if (chainId !== rinkebyChainId) {
          alert("Please connect to Rinkeby Test Network!");
          return;
        }

        setMinted(false);

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeGenArtNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );

        setupEventListener();
      } else {
        console.log("Ethereum object doesn't exist!");
        alert("You need MetaMask to access this!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getNFTCollectionStats();
  }, []);

  // Render Methods
  const renderConnectButtonContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      Mint NFT
    </button>
  );

  const renderCollectionButtonUI = () => (
    <button className="cta-button connect-wallet-button">
      <a
        className="footer-text"
        href={OPENSEA_LINK}
        target="_blank"
        rel="noreferrer"
      >
        🌊 View Collection on OpenSea
      </a>
    </button>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === ""
            ? renderConnectButtonContainer()
            : renderMintUI()}
          <p className="sub-text">
            {minted && (
              <div>
                Hey there! We have minted your NFT and sent it to your wallet.
                Click{" "}
                <a href={openseaLink} target="_blank" rel="noreferrer">
                  here
                </a>{" "}
                to see.
              </div>
            )}
          </p>
          <p className="sub-text">
            {minted && (
              <div>
                {" "}
                It may be blank right now as it can take a max of 10 min to show
                up on OpenSea.{" "}
              </div>
            )}
          </p>
          {renderCollectionButtonUI()}
          <p className="sub-text">{mintCount}/{TOTAL_MINT_COUNT} NFTs minted so far</p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={BUILDSPACE_TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${BUILDSPACE_TWITTER_HANDLE}`}</a>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={MY_TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Find me @${MY_TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
