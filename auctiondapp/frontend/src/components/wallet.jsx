import useWallet from "./ConnectWallet";

const WalletComponent = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      {account ? (
        <>
          <p>Connected: {account}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletComponent;
