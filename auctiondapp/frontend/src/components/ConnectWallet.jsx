import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";

const ConnectWallet = () => {
  const { account, connectWallet } = useContext(Web3Context);

  return (
    <div>
      {account ? (
        <p>
          Connected: {account.substring(0, 6)}...{account.slice(-4)}
        </p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;
