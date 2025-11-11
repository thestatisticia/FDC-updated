import { toUtf8HexString } from "../utils/core";

/**
 * Minimal playground example that shows how to prepare an attestation payload.
 *
 * Run with:
 * yarn hardhat run scripts/playground/helloFdc.ts --network coston2 --dry-run
 */

async function main() {
    const explain = process.argv.includes("--explain");
    const attestationType = toUtf8HexString("Web2Json");
    const sourceId = toUtf8HexString("PublicWeb2");

    const requestBody = {
        url: "https://swapi.dev/api/people/1/",
        httpMethod: "GET",
        headers: "{}",
        queryParams: "{}",
        body: "{}",
        postProcessJq: `{name: .name, height: .height}`,
        abiSignature:
            '{"components": [{"internalType": "string", "name": "name", "type": "string"},{"internalType": "uint256", "name": "height", "type": "uint256"}],"name": "task","type": "tuple"}',
    };

    const playgroundPayload = {
        attestationType,
        sourceId,
        requestBody,
    };

    console.log("Hello FDC 👋");
    console.log("Attestation payload (copy & tweak as needed):\n", JSON.stringify(playgroundPayload, null, 2));
    if (explain) {
        console.log(
            "Explain mode: `attestationType` and `sourceId` are hex-encoded identifiers expected by the verifier. Modify `postProcessJq` to reshape JSON responses."
        );
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Playground script failed:", error);
        process.exitCode = 1;
    });

