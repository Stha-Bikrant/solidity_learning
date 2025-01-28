"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ContractAddress from "@/contracts/contract-address.json";
import abi from "@/contracts/Tracker.json";

interface StateType {
  provider: ethers.BrowserProvider | null;
  signer: any | null;
  contract: ethers.Contract | null;
}

interface Transaction {
  receiver: string;
  amount: string; // Converted to string for display
  timestamp: string; // Converted to a readable date
}

const trackerContractAddress = ContractAddress.Tracker;
const contractABI = abi.abi;
const SEPOLIA_NETWORK_ID = "11155111";

export default function Home() {
  const [state, setState] = useState<StateType>({
    provider: null,
    signer: null,
    contract: null,
  });
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [accounts, setAccounts] = useState("None");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const { ethereum } = window;

        if (ethereum) {
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });
          // if (ethereum.networkVersion === HARDHAT_NETWORK_ID) {
          if (ethereum.networkVersion === SEPOLIA_NETWORK_ID) {
            const account = await ethereum.request({
              method: "eth_requestAccounts",
            });

            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
              trackerContractAddress,
              contractABI,
              signer
            );
            setAccounts(account);
            setUserAddress(account[0]);
            setState({ provider, signer, contract });
          } else {
            setUserAddress("Other Network");
          }
        } else {
          alert("Please install metamask");
        }
      } catch (error) {
        console.log(error);
      }
    };
    connectWallet();
  }, []);

  const processTransaction = async () => {
    const { contract } = state;

    if (!contract) {
      console.error("Contract is not initialized yet!");
      return;
    }

    try {
      const receiver = (document.getElementById("receiver") as HTMLInputElement).value;
      const amount = (document.getElementById("amount") as HTMLInputElement).value;

      const tx = await contract.sendTransaction(receiver, ethers.parseEther(amount), {
        value: ethers.parseEther(amount),
      });
      console.log("Transaction sent, waiting for confirmation...");
      await tx.wait();
      console.log("Transaction confirmed:", tx);
    } catch (error) {
      console.error("Error processing transaction:", error);
    }
  };

  const getAllTransaction = async () => {
    const { contract } = state;

    if (!contract) {
      console.error("Contract is not initialized yet!");
      return;
    }

    if (!userAddress) {
      console.error("User address is not set!");
      return;
    }

    try {
      // Fetch transactions from the contract for the current user
      const txs = await contract.getAllTransactions();

      // Format the transactions for easier display
      const formattedTxs = txs.map((tx: any) => ({
        receiver: tx.receiver,
        amount: ethers.formatEther(tx.amount),
        timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
      }));

      setTransactions(formattedTxs); // Store transactions in state
      console.log("Transactions fetched:", formattedTxs);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Failed to fetch transactions.");
    }
  };
  return (
    <div>
      <input id="receiver" placeholder="receiver" />
      <input id="amount" placeholder="amount" />
      <button onClick={processTransaction}>Send</button>
      
      <h2>Transaction Tracker</h2>

<div>
  <button onClick={getAllTransaction}>Get My Transactions</button>
</div>

<h3>Transaction List:</h3>
{transactions.length > 0 ? (
  <ul>
    {transactions.map((tx, index) => (
      <li key={index}>
        <p>Receiver: {tx.receiver}</p>
        <p>Amount: {tx.amount} ETH</p>
        <p>Timestamp: {tx.timestamp}</p>
      </li>
    ))}
  </ul>
) : (
  <p>No transactions found for your address.</p>
)}
    </div>
  );


}