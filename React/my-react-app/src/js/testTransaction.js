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
const ABI = [
    
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "collectible_name",
				"type": "string"
			},
			{
				"internalType": "int256",
				"name": "tag",
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
				"internalType": "int256",
				"name": "tag",
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
				"internalType": "int256",
				"name": "tag",
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


// function getAbi() {
//   try {
//     const abiPath = './abi.txt'
//     const raw = fs.readFileSync(abiPath, 'utf8');
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }

async function main() {
  // if (!getAbi()) {
  //   console.error('Missing: set REACT_APP_CONTRACT_ADDRESS and TEST_PRIVATE_KEY in .env; ensure abi.txt contains valid JSON ABI');
  //   process.exit(1);
  // }

  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

//   const fakeObject = {
//     collectible_name: 'Test Collectible',
//     tag: 3,
//     price: 23,
//   };

//   console.log('Sending transaction...', fakeObject);
//   const tx = await contract.add_collectible_ledger(
//     fakeObject.collectible_name,
//     fakeObject.tag,
//     fakeObject.price
//   );
//   console.log('Tx hash:', tx.hash);
//   await tx.wait();
//   console.log('Success');

 
  
  console.log('Printing every collectible in array:');
  await printAllCollectibles(contract);

}

export async function printAllCollectibles(contract) {
  if (!contract) {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  }
  const length = await contract.get_array_length();

  console.log(`Total collectibles: ${length.toString()}`);

  const allCollectibles = [];

  for (let i = 0; i < length; i++) {
    const c = await contract.collectibles_array(i);

    const collectible = {
      index: i,
      unique_ID: c[0],
      collectible_name: c[1],
      tag: Number(c[2]),
      ownership: c[3],
      price: Number(c[4])
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