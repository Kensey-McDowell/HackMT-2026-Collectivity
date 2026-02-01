import { ethers } from 'ethers';

// Vite exposes only env vars prefixed with VITE_ from .env (no dotenv package).
// Restart the dev server (npm run dev) after changing .env.
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
const SEPOLIA_RPC = import.meta.env.VITE_SEPOLIA_RPC;

if (!CONTRACT_ADDRESS || !SEPOLIA_RPC) {
  const missing = [];
  if (!CONTRACT_ADDRESS) missing.push('VITE_CONTRACT_ADDRESS');
  if (!SEPOLIA_RPC) missing.push('VITE_SEPOLIA_RPC');
  throw new Error(
    `Missing env: ${missing.join(', ')}. Add them to .env in the React app root (same folder as package.json) and restart the dev server (npm run dev).`
  );
}
const ABI = 
	
	[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "collectible_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "int256",
				"name": "category",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "status",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "price",
				"type": "int256"
			}
		],
		"name": "add_collectible_ledger",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "unique_ID",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "collectible_name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "category",
				"type": "int256"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "status",
				"type": "int256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "ownership",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "price",
				"type": "int256"
			}
		],
		"name": "Collectible_Added",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "collectibles_array",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "unique_ID",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "collectible_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "int256",
				"name": "category",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "status",
				"type": "int256"
			},
			{
				"internalType": "address",
				"name": "ownership",
				"type": "address"
			},
			{
				"internalType": "int256",
				"name": "price",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "get_array_length",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}

]

/* When set, contract is connected via MetaMask signer. Cleared on disconnect. */
let walletContract = null;

/* Connect MetaMask. Returns the connected account address. */
export async function connectWallet() {
  if (!window?.ethereum) throw new Error('MetaMask not installed');
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  walletContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  return await signer.getAddress();
}

/* Disconnect wallet (clears stored signer/contract). */
export function disconnectWallet() {
  walletContract = null;
}

/* Get current wallet contract when connected via MetaMask, or null. */
export function getWalletContract() {
  return walletContract;
}

/* Create a write-capable contract from env PRIVATE_KEY. Throws if PRIVATE_KEY is missing. */
function createWalletContract() {
  if (!PRIVATE_KEY) throw new Error('Connect MetaMask or set VITE_PRIVATE_KEY to add a collectible');
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

/* Resolve to a write-capable contract: use provided contract, else MetaMask, else env PRIVATE_KEY. */
function getWriteContract(contract) {
  return contract ?? getWalletContract() ?? createWalletContract();
}

/* Resolve to a contract for reads: use provided contract or create read-only from RPC. */
function getReadOnlyContract(contract) {
  if (contract) return contract;
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

/* Add a single collectible. Ledger shape: { collectible_name, description, category, status, price } (category/status/price as numbers). */
export async function addCollectible(contract, collectible_name, description, category, status, price) {
  contract = getWriteContract(contract);
  const tx = await contract.add_collectible_ledger(
    collectible_name,
    description,
    Number(category),
    Number(status),
    Number(price)
  );
  await tx.wait();
  console.log('Collectible added');
  return tx;
}

/* Add multiple collectibles from a ledger (array of ledger-shaped objects). */
export async function addCollectiblesFromLedger(contract, ledger) {
  contract = getWriteContract(contract);
  const txs = [];
  for (const item of ledger) {
    const tx = await contract.add_collectible_ledger(
      item.collectible_name,
      item.description,
      Number(item.category),
      Number(item.status),
      Number(item.price)
    );
    await tx.wait();
    txs.push(tx);
    console.log('Collectible added:', item.collectible_name);
  }
  return txs;
}


async function main() {
  const contract = createWalletContract();
  console.log('Printing every collectible in array:');
  await printAllCollectibles(contract);
}

export async function printAllCollectibles(contract) {
  contract = getReadOnlyContract(contract);
  const length = await contract.get_array_length();
  const totalLength = Number(length);

  console.log(`Total collectibles: ${length.toString()}`);

  const allCollectibles = [];

  for (let i = 0; i < totalLength; i++) {
    const c = await contract.collectibles_array(i);


	// const tags_input = await contract.print_tag(i);
    const collectible = {
		index: i,
		unique_ID: c[0],
		collectible_name: c[1],
		description: c[2],

		// tags: tags_input.map(t => t.toString()),

		category: c[3].toString(), 
		status: c[4].toString(),
		ownership: c[5],
		price: c[6].toString()
    };

    //console.log(collectible);
    allCollectibles.push(collectible);
  }

  return allCollectibles;
}



main().catch((err) => {
  console.error(err);
  process.exit(1);
});