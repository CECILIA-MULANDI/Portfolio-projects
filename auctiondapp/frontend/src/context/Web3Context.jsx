import { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState(null);

  // Detect wallet type
  const detectWalletType = () => {
    if (window.ethereum?.isBraveWallet) {
      return "brave";
    } else if (window.ethereum?.isMetaMask) {
      return "metamask";
    } else if (window.ethereum) {
      return "other";
    }
    return null;
  };

  // Function to connect wallet
  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      // Detect wallet type
      const detectedWalletType = detectWalletType();
      setWalletType(detectedWalletType);

      if (!detectedWalletType) {
        alert("Please install MetaMask or use a Web3-compatible browser!");
        setIsConnecting(false);
        return;
      }

      // For Brave Wallet, use a lower-level and more direct approach
      if (detectedWalletType === "brave") {
        try {
          // Request accounts directly from ethereum provider
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          if (!accounts || accounts.length === 0) {
            throw new Error("No accounts available");
          }

          // Create provider using ethers.js v5 Web3Provider
          const web3Provider = new ethers.providers.Web3Provider(
            window.ethereum
          );

          // Get the signer directly
          const connectedAccount = accounts[0];

          // Store connection info
          localStorage.setItem("connectedAccount", connectedAccount);
          localStorage.setItem("walletType", detectedWalletType);

          setAccount(connectedAccount);
          setProvider(web3Provider);

          // Get signer separately after provider is set up
          try {
            const signerObj = web3Provider.getSigner();
            setSigner(signerObj);
          } catch (signerError) {
            console.warn(
              "Could not get signer, but continuing with account:",
              signerError
            );
          }
        } catch (braveError) {
          console.error("Brave wallet connection error:", braveError);
          throw new Error(
            `Brave wallet error: ${braveError.message || "Connection failed"}`
          );
        }
      } else {
        // Standard approach for MetaMask and others
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

        // Request accounts
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const signerObj = web3Provider.getSigner();
        const connectedAccount = await signerObj.getAddress();

        // Save connection info
        localStorage.setItem("connectedAccount", connectedAccount);
        localStorage.setItem("walletType", detectedWalletType);

        setProvider(web3Provider);
        setSigner(signerObj);
        setAccount(connectedAccount);
      }

      // Set up event listeners for both wallet types
      setupEventListeners();
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert(`Failed to connect wallet: ${err.message || "Unknown error"}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Set up event listeners
  const setupEventListeners = () => {
    if (window.ethereum) {
      // Remove any existing listeners first to avoid duplicates
      window.ethereum.removeAllListeners?.("accountsChanged");
      window.ethereum.removeAllListeners?.("chainChanged");

      // Add new listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (!accounts || accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else if (accounts[0] !== account) {
      // User switched accounts
      try {
        const currentWalletType =
          localStorage.getItem("walletType") || detectWalletType();

        if (currentWalletType === "brave") {
          // For Brave, just update the account
          setAccount(accounts[0]);
          localStorage.setItem("connectedAccount", accounts[0]);

          // Try to get a new provider and signer
          try {
            const web3Provider = new ethers.providers.Web3Provider(
              window.ethereum
            );
            setProvider(web3Provider);

            const signerObj = web3Provider.getSigner();
            setSigner(signerObj);
          } catch (error) {
            console.warn("Error updating signer after account change:", error);
          }
        } else {
          // Standard approach for other wallets
          const web3Provider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          const signerObj = web3Provider.getSigner();

          localStorage.setItem("connectedAccount", accounts[0]);
          setProvider(web3Provider);
          setSigner(signerObj);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error handling account change:", error);
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    localStorage.removeItem("connectedAccount");
    localStorage.removeItem("walletType");
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setWalletType(null);

    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", () => {});
    }
  };

  // Get current chain ID
  const getChainId = async () => {
    if (!provider) return null;
    try {
      // In ethers v5, chainId is a property of the network
      const network = await provider.getNetwork();
      return network.chainId;
    } catch (error) {
      console.error("Error getting chain ID:", error);
      return null;
    }
  };

  // Check for existing connection on page load
  useEffect(() => {
    const reconnectWallet = async () => {
      const savedAccount = localStorage.getItem("connectedAccount");
      const savedWalletType = localStorage.getItem("walletType");

      if (!window.ethereum || !savedAccount) return;

      try {
        // Check if the wallet is available
        const detectedWalletType = detectWalletType();

        if (!detectedWalletType) {
          localStorage.removeItem("connectedAccount");
          localStorage.removeItem("walletType");
          return;
        }

        // If wallet type has changed, don't auto-connect
        if (savedWalletType && savedWalletType !== detectedWalletType) {
          localStorage.removeItem("connectedAccount");
          localStorage.removeItem("walletType");
          return;
        }

        // For Brave, just check if the account is still available
        if (detectedWalletType === "brave") {
          try {
            const accounts = await window.ethereum.request({
              method: "eth_accounts",
            });

            if (accounts && accounts.includes(savedAccount)) {
              const web3Provider = new ethers.providers.Web3Provider(
                window.ethereum
              );
              setProvider(web3Provider);
              setAccount(savedAccount);
              setWalletType(detectedWalletType);

              // Try to get signer but don't fail if we can't
              try {
                const signerObj = web3Provider.getSigner();
                setSigner(signerObj);
              } catch (signerError) {
                console.warn("Could not get signer on reconnect:", signerError);
              }

              // Set up event listeners
              setupEventListeners();
            } else {
              // Account no longer available
              localStorage.removeItem("connectedAccount");
              localStorage.removeItem("walletType");
            }
          } catch (braveError) {
            console.error("Brave reconnect error:", braveError);
            localStorage.removeItem("connectedAccount");
            localStorage.removeItem("walletType");
          }
        } else {
          // Standard approach for other wallets
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts && accounts.includes(savedAccount)) {
            const web3Provider = new ethers.providers.Web3Provider(
              window.ethereum
            );
            const signerObj = web3Provider.getSigner();

            setProvider(web3Provider);
            setSigner(signerObj);
            setAccount(savedAccount);
            setWalletType(detectedWalletType);

            // Set up event listeners
            setupEventListeners();
          } else {
            localStorage.removeItem("connectedAccount");
            localStorage.removeItem("walletType");
          }
        }
      } catch (error) {
        console.error("Failed to reconnect wallet:", error);
        localStorage.removeItem("connectedAccount");
        localStorage.removeItem("walletType");
      }
    };

    reconnectWallet();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        connectWallet,
        disconnectWallet,
        isConnecting,
        walletType,
        getChainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

Web3Provider.propTypes = {
  children: PropTypes.node.isRequired,
};
