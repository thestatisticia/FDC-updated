# Deployment Helper Script

The deployment helper provides an interactive way to deploy any compiled contract and optionally
run block explorer verification. It is designed for beginners who want a guided experience without
having to remember every Hardhat command.

## Features

- Presents an indexed list of compiled contracts to deploy.
- Prompts for constructor arguments and waits for configurable confirmations.
- Verifies the deployed contract via `verify:verify` when desired.
- Prints a deployment summary showing the network, contract address, transaction hash, and arguments.

## Prerequisites

1. Install dependencies (`yarn install` or `npm install`).
2. Compile the contracts you want to deploy:  
   ```bash
   yarn hardhat compile
   ```
3. Configure your `.env` with the private key and RPC details for the target network.

## Usage

```bash
yarn hardhat run scripts/deploy/helper.ts --network <network-name>
```

Example:

```bash
yarn hardhat run scripts/deploy/helper.ts --network coston2
```

The script will:

1. Show the available compiled contracts.
2. Ask for constructor arguments (JSON array).
3. Deploy the selected contract.
4. Wait for your chosen number of confirmations.
5. Offer to verify the contract.
6. Present a final deployment summary.

## Tips

- Leave the constructor argument prompt empty if the constructor does not require parameters.
- If verification fails because the contract is already verified, the script simply prints the error and continues.
- To add more networks or explorer API keys, update `hardhat.config.ts` as usual.


