/**
 * Mock attestation verifier
 *
 * Demonstrates how to take a fake proof payload and run simple checks.
 * Replace `mockProof` with real data when you are ready.
 *
 * Run with:
 * yarn hardhat run scripts/playground/mockAttestation.ts --network coston2 --dry-run
 */

interface MockProof {
    roundId: number;
    responseHex: string;
    merkleProof: string[];
}

const mockProof: MockProof = {
    roundId: 123456,
    responseHex: "0xabcdef",
    merkleProof: ["0xaaa", "0xbbb", "0xccc"],
};

function validateProof(proof: MockProof) {
    if (!proof.responseHex.startsWith("0x")) {
        throw new Error("Response must be hex-prefixed with 0x.");
    }
    if (proof.merkleProof.length === 0) {
        throw new Error("Merkle proof array cannot be empty.");
    }
}

async function main() {
    const explain = process.argv.includes("--explain");
    console.log("Mock attestation verification starting...");
    console.log("Received proof:", mockProof);

    try {
        validateProof(mockProof);
        console.log("Proof looks structurally valid ✅");
    } catch (error) {
        console.error("Proof check failed:", (error as Error).message);
    }

    if (explain) {
        console.log(
            "Explain mode: a real proof comes from the DA layer. Always validate format locally before passing it to smart contracts."
        );
    }

    console.log("Next step: swap in real proof values from scripts/fdcExample/Web2Json.ts output.");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Mock attestation playground failed:", error);
        process.exitCode = 1;
    });

