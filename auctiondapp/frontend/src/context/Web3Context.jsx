import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ethers } from "ethers";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const providerInstance = new ethers.providers.Web3Provider(
          window.ethereum
        ); // ✅ Correct instantiation
        setProvider(providerInstance);

        const accounts = await providerInstance.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setSigner(providerInstance.getSigner());
        }
      }
    };

    initWeb3();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required!");
      return;
    }
    const providerInstance = new ethers.providers.Web3Provider(window.ethereum); // ✅ Fix applied
    setProvider(providerInstance);

    const accounts = await providerInstance.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    setSigner(providerInstance.getSigner());
  };

  return (
    <Web3Context.Provider value={{ provider, signer, account, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

Web3Provider.propTypes = {
  children: PropTypes.node.isRequired,
};
