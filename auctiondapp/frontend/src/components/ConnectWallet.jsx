import { useEffect, useState } from "react";
import { createContext } from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  // Function to connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await web3Provider.getSigner();
      const account = await signer.getAddress();

      // Save account to localStorage
      localStorage.setItem("connectedAccount", account);

      setProvider(web3Provider); //safaridaofaucet.vercel.app/
      https: setSigner(signer);
      setAccount(account);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }

    Web3Provider.propTypes = {
      children: PropTypes.node.isRequired,
    };
  };

  // Check for existing connection on page load
  useEffect(() => {
    const reconnectWallet = async () => {
      const savedAccount = localStorage.getItem("connectedAccount");
      if (savedAccount && window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();
        setProvider(web3Provider);
        setSigner(signer);
        setAccount(savedAccount);
      }
    };

    reconnectWallet();
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, account, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};
