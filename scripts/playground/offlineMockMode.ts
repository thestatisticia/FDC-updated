import { ethers } from "hardhat";
import { mockCharacter, mockProof, mockRequest } from "../../utils/mockData";

/**
 * Offline mock mode:
 * - Prints the mock request that would be sent to the verifier.
 * - Decodes the mock response payload.
 * - Deploys SimpleProofVerifier to a local Hardhat network instance.
 * - Verifies the mock proof without reaching external services.
 *
 * Run with:
 * yarn hardhat run scripts/playground/offlineMockMode.ts --network hardhat
 */

async function main() {
    console.log("=== Offline Mock Mode ===\n");
    console.log("Request payload:", mockRequest);

    const responseBytes = ethers.getBytes(mockProof.responseHex);
    const decodedString = ethers.toUtf8String(responseBytes);

    console.log("Decoded mock response string:", decodedString);
    console.log("Mock character object:", mockCharacter);

    const expectedHash = ethers.keccak256(responseBytes);
    const SimpleProofVerifier = await ethers.getContractFactory(
        "contracts/mock/SimpleProofVerifier.sol:SimpleProofVerifier"
    );
    const verifier = await SimpleProofVerifier.deploy(expectedHash);
    await verifier.waitForDeployment();

    const isValid = await verifier.verify(responseBytes, mockProof.merkleProof);
    console.log("Proof valid:", isValid);

    if (!isValid) {
        throw new Error("Mock proof verification failed. Check mock data values.");
    }

    console.log("\nOffline flow complete. No external RPC calls were made.");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Offline mock mode failed:", error);
        process.exit(1);
    });

