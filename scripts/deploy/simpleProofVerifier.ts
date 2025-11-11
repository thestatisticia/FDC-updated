import { ethers } from "hardhat";
import { mockProof } from "../../utils/mockData";

/**
 * Deploys the SimpleProofVerifier contract.
 *
 * Usage:
 * yarn hardhat run scripts/deploy/simpleProofVerifier.ts --network <network>
 *
 * Flags:
 *   --expected <hex>  Optional custom payload hex whose hash will be pinned in the contract.
 */

function parseExpectedHex(): string {
    const flagIndex = process.argv.indexOf("--expected");
    if (flagIndex >= 0 && process.argv[flagIndex + 1]) {
        return process.argv[flagIndex + 1]!;
    }
    return mockProof.responseHex;
}

async function main() {
    const payloadHex = parseExpectedHex();
    const payloadBytes = ethers.getBytes(payloadHex);
    const expectedHash = ethers.keccak256(payloadBytes);

    const factory = await ethers.getContractFactory("contracts/mock/SimpleProofVerifier.sol:SimpleProofVerifier");
    const contract = await factory.deploy(expectedHash);
    await contract.waitForDeployment();

    console.log("SimpleProofVerifier deployed at:", await contract.getAddress());
    console.log("Pinned payload hash:", expectedHash);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Failed to deploy SimpleProofVerifier:", error);
        process.exit(1);
    });

