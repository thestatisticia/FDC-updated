import { run, web3 } from "hardhat";
import { StarWarsCharacterListV2Instance } from "../../typechain-types";
import { buildMockWeb2JsonBundle, MockWeb2JsonBundle } from "../../utils/mockData";
import {
    prepareAttestationRequestBase,
    submitAttestationRequest,
    retrieveDataAndProofBaseWithRetry,
} from "../utils/fdc";

const StarWarsCharacterListV2 = artifacts.require("StarWarsCharacterListV2");

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL } = process.env;

// yarn hardhat run scripts/fdcExample/Web2Json.ts --network coston2

// Request data
// const apiUrl = "https://swapi.dev/api/people/3/";
// const postProcessJq = `{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split("/") | .[-2] | tonumber)}`;
const apiUrl = "https://swapi.info/api/people/3";
const postProcessJq = `{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split("/") | .[-1] | tonumber)}`;
const httpMethod = "GET";
// Defaults to "Content-Type": "application/json"
const headers = "{}";
const queryParams = "{}";
const body = "{}";
const abiSignature = `{"components": [{"internalType": "string", "name": "name", "type": "string"},{"internalType": "uint256", "name": "height", "type": "uint256"},{"internalType": "uint256", "name": "mass", "type": "uint256"},{"internalType": "uint256", "name": "numberOfFilms", "type": "uint256"},{"internalType": "uint256", "name": "uid", "type": "uint256"}],"name": "task","type": "tuple"}`;

// Configuration constants
const attestationTypeBase = "Web2Json";
const sourceIdBase = "PublicWeb2";
const verifierUrlBase = WEB2JSON_VERIFIER_URL_TESTNET;

type ExecutionOptions = {
    mode: "live" | "mock";
};

function parseExecutionOptions(): ExecutionOptions {
    const args = process.argv.slice(2);
    if (args.includes("--mock")) {
        console.log("⚙️  Running in mock mode. No live network requests will be made.\n");
        return { mode: "mock" };
    }
    return { mode: "live" };
}

function logStep(message: string) {
    console.log(`\n=== ${message} ===\n`);
}

async function prepareAttestationRequest(apiUrl: string, postProcessJq: string, abiSignature: string) {
    logStep("Preparing attestation request payload");
    const requestBody = {
        url: apiUrl,
        httpMethod: httpMethod,
        headers: headers,
        queryParams: queryParams,
        body: body,
        postProcessJq: postProcessJq,
        abiSignature: abiSignature,
    };

    const url = `${verifierUrlBase}Web2Json/prepareRequest`;
    const apiKey = VERIFIER_API_KEY_TESTNET;

    return await prepareAttestationRequestBase(url, apiKey, attestationTypeBase, sourceIdBase, requestBody);
}

async function retrieveDataAndProof(abiEncodedRequest: string, roundId: number) {
    logStep("Retrieving proof from the Data Availability layer");
    const url = `${COSTON2_DA_LAYER_URL}api/v1/fdc/proof-by-request-round-raw`;
    console.log("Request url:", url, "\n");
    return await retrieveDataAndProofBaseWithRetry(url, abiEncodedRequest, roundId);
}

async function deployAndVerifyContract() {
    logStep("Deploying StarWarsCharacterListV2");
    const args: any[] = [];
    const characterList: StarWarsCharacterListV2Instance = await StarWarsCharacterListV2.new(...args);
    try {
        await run("verify:verify", {
            address: characterList.address,
            constructorArguments: args,
        });
    } catch (e: any) {
        console.log(e);
    }
    console.log("StarWarsCharacterListV2 deployed to", characterList.address, "\n");
    return characterList;
}

async function decodeProof(proof: any) {
    logStep("Decoding proof payload");
    console.log("Proof hex:", proof.response_hex, "\n");

    // A piece of black magic that allows us to read the response type from an artifact
    const IWeb2JsonVerification = await artifacts.require("IWeb2JsonVerification");
    const responseType = IWeb2JsonVerification._json.abi[0].inputs[0].components[1];
    console.log("Response type:", responseType, "\n");

    const decodedResponse = web3.eth.abi.decodeParameter(responseType, proof.response_hex);
    console.log("Decoded proof:", decodedResponse, "\n");
    return decodedResponse;
}

async function storeCharacterFromProof(
    characterList: StarWarsCharacterListV2Instance,
    proof: any,
    decodedResponse: any
) {
    logStep("Storing character on chain");
    const transaction = await characterList.addCharacter({
        merkleProof: proof.proof,
        data: decodedResponse,
    });
    console.log("Transaction:", transaction.tx, "\n");
    console.log("Star Wars Characters:\n", await characterList.getAllCharacters(), "\n");
}

function runMockFlow(): MockWeb2JsonBundle {
    logStep("Generating mock attestation artefacts");
    const bundle = buildMockWeb2JsonBundle();
    console.log("Request body:", bundle.request, "\n");
    console.log("Mock round:", bundle.roundId, "\n");
    console.log("Mock proof:", bundle.proof, "\n");
    const bmi = Math.floor((bundle.decodedResponse.mass * 10000) / (bundle.decodedResponse.height ** 2));
    console.log("Calculated BMI (simulated):", bmi, "\n");
    console.log("Decoded response:", bundle.decodedResponse, "\n");
    console.log("Use this bundle to test downstream consumers without live network calls.\n");
    return bundle;
}

async function runLiveFlow() {
    const data = await prepareAttestationRequest(apiUrl, postProcessJq, abiSignature);
    console.log("Encoded request:", data, "\n");

    logStep("Submitting attestation request to FDC Hub");
    const abiEncodedRequest = data.abiEncodedRequest;
    const roundId = await submitAttestationRequest(abiEncodedRequest);
    console.log("Voting round id:", roundId, "\n");

    const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);

    const characterList: StarWarsCharacterListV2Instance = await deployAndVerifyContract();

    const decodedResponse = await decodeProof(proof);
    await storeCharacterFromProof(characterList, proof, decodedResponse);
}

async function main() {
    const options = parseExecutionOptions();
    if (options.mode === "mock") {
        runMockFlow();
        return;
    }
    await runLiveFlow();
}

void main().then(() => {
    process.exit(0);
});
