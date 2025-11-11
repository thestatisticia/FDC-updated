# FDC Workflow: Complete Technical Documentation

## Overview

This document provides a detailed, step-by-step explanation of the Flare Data Connector (FDC) workflow, using the Star Wars API example. 

We use data from an external API, send it to a server to encode it and prepare an attestation request, after that there will be a voting round with validators fetching and verifying the data that was submitted to the FDC. Once the data has been verified and the voting round finalizes, we can request the DA Layer to fetch the proof. The proof is then sent to a smart contract that will verify the cryptographic proof, perform a basic calculation using the data from the API and store a list of enhanced information on the flare blockchain.

____
**The flow includes these steps:**

1. API Call (Star Wars API)
   ↓
2. JQ Processing (Extract character data)
   ↓
3. FDC Verification (Validators attest)
   ↓
4. Proof Generation (Cryptographic proof)
   ↓
5. Contract Deployment (StarWarsCharacterListV2)
   ↓
6. Data Submission (addCharacter function)
   ↓
7. On-chain Processing (BMI calculation)
   ↓
8. Permanent Storage (Blockchain)
____

## Table of Contents

1. [Step 1: Attestation Request Preparation & ABI Encoding](#step-1-attestation-request-preparation--abi-encoding)
2. [Step 2: Submit Attestation Request to FDC Hub](#step-2-submit-attestation-request-to-fdc-hub)
3. [Step 3: Wait for Voting Round & Retrieve Proof](#step-3-wait-for-voting-round--retrieve-proof)
4. [Step 4: Deploy Smart Contract](#step-4-deploy-smart-contract)
5. [Step 5: Use Proof with Smart Contract](#step-5-use-proof-with-smart-contract)
6. [Complete Workflow Summary](#complete-workflow-summary)
7. [Technical Deep Dive](#technical-deep-dive)

---

## Step 1: Attestation Request Preparation & ABI Encoding

### What Happens
You define what API to call, how to process the data, and what format you want. The verifier server converts your human-readable request into ABI-encoded binary format.

### Code Analysis

#### 1A: Define Request Parameters

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 18-25)

```typescript
const apiUrl = "https://swapi.info/api/people/3";
const postProcessJq = `{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split("/") | .[-1] | tonumber)}`;
const httpMethod = "GET";
const headers = "{}";
const queryParams = "{}";
const body = "{}";
const abiSignature = `{"components": [{"internalType": "string", "name": "name", "type": "string"},{"internalType": "uint256", "name": "height", "type": "uint256"},{"internalType": "uint256", "name": "mass", "type": "uint256"},{"internalType": "uint256", "name": "numberOfFilms", "type": "uint256"},{"internalType": "uint256", "name": "uid", "type": "uint256"}],"name": "task","type": "tuple"}`;
```

**Parameter Breakdown**:
- **`apiUrl`**: The external API endpoint to fetch data from
- **`postProcessJq`**: JQ filter to transform raw API response
- **`httpMethod`**: HTTP method (GET, POST, etc.)
- **`headers`**: HTTP headers (empty for this example)
- **`queryParams`**: URL query parameters (empty for this example)
- **`body`**: Request body (empty for GET requests)
- **`abiSignature`**: Defines the expected data structure for smart contracts

#### 1B: JQ Filter Explanation

**The JQ Filter**:
```jq
{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split("/") | .[-1] | tonumber)}
```

**What Each Part Does**:
- `name: .name` → Extract the "name" field
- `height: .height` → Extract the "height" field  
- `mass: .mass` → Extract the "mass" field
- `numberOfFilms: .films | length` → Count how many films the character appears in
- `uid: (.url | split("/") | .[-1] | tonumber)` → Extract ID from URL and convert to number

**Example Transformation**:
```json
// Raw API response from Star Wars API
{
  "name": "R2-D2",
  "height": "96",
  "mass": "32", 
  "films": ["url1", "url2", "url3", "url4", "url5", "url6"],
  "url": "https://swapi.info/api/people/3/"
}

// After JQ filter processing
{
  "name": "R2-D2",
  "height": "96",
  "mass": "32",
  "numberOfFilms": 6,
  "uid": 3
}
```

#### 1C: ABI Signature Explanation

**The ABI Signature**:
```json
{
  "components": [
    {"internalType": "string", "name": "name", "type": "string"},
    {"internalType": "uint256", "name": "height", "type": "uint256"},
    {"internalType": "uint256", "name": "mass", "type": "uint256"},
    {"internalType": "uint256", "name": "numberOfFilms", "type": "uint256"},
    {"internalType": "uint256", "name": "uid", "type": "uint256"}
  ],
  "name": "task",
  "type": "tuple"
}
```

**What This Defines**:
- The exact data structure your smart contract expects
- Data types for each field (string, uint256)
- Field names that will be used in your contract

#### 1D: Build Request Body

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 32-42)

```typescript
async function prepareAttestationRequest(apiUrl: string, postProcessJq: string, abiSignature: string) {
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
```

**What This Does**:
1. Assembles all parameters into a single request object
2. Sets the endpoint URL for the verifier server
3. Calls the base function that handles the HTTP request

#### 1E: Send to Verifier Server

**File**: `scripts/utils/fdc.ts` (Lines 25-50)

```typescript
export async function prepareAttestationRequestBase(
    url: string,
    apiKey: string,
    attestationTypeBase: string,
    sourceIdBase: string,
    requestBody: any
) {
    console.log("Url:", url, "\n");
    const attestationType = toUtf8HexString(attestationTypeBase);  // "Web2Json" → hex
    const sourceId = toUtf8HexString(sourceIdBase);                // "PublicWeb2" → hex

    const request = {
        attestationType: attestationType,
        sourceId: sourceId,
        requestBody: requestBody,
    };
    console.log("Prepared request:\n", request, "\n");

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });
    if (response.status != 200) {
        throw new Error(`Response status is not OK, status ${response.status} ${response.statusText}\n`);
    }
    console.log("Response status is OK\n");

    return await response.json();
}
```

**What the Verifier Server Does**:
1. Receives your human-readable request
2. Converts attestation type and source ID to hex format
3. Performs ABI encoding of the entire request
4. Returns the ABI-encoded binary data

**Real Output Example**:
```
Url: https://web2json-verifier-test.flare.rocks/Web2Json/prepareRequest

Prepared request:
{
  attestationType: '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId: '0x5075626c69635765623200000000000000000000000000000000000000000000',
  requestBody: {
    url: 'https://swapi.info/api/people/3',
    httpMethod: 'GET',
    headers: '{}',
    queryParams: '{}',
    body: '{}',
    postProcessJq: '{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split("/") | .[-1] | tonumber)}',
    abiSignature: '{"components": [...], "name": "task", "type": "tuple"}'
  }
}

Response status is OK

Data: {
  status: 'VALID',
  abiEncodedRequest: '0x576562324a736f6e000000000000000000000000000000000000000000000000...'
}
```

### Summary of Step 1
- **You define**: What API to call, how to process the data, and what format you want
- **You send**: Human-readable request to verifier server
- **Server converts**: Your request into ABI-encoded binary format
- **You receive**: Binary data ready for blockchain submission

---

## Step 2: Submit Attestation Request to FDC Hub

### What Happens
You submit the ABI-encoded request to the FDC Hub smart contract, pay a fee, and get a round ID for tracking the voting process.

### Code Analysis

#### 2A: Extract ABI-Encoded Request

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 85-87)

```typescript
const data = await prepareAttestationRequest(apiUrl, postProcessJq, abiSignature);
console.log("Data:", data, "\n");

const abiEncodedRequest = data.abiEncodedRequest;
const roundId = await submitAttestationRequest(abiEncodedRequest);
```

#### 2B: Submit to FDC Hub

**File**: `scripts/utils/fdc.ts` (Lines 72-85)

```typescript
export async function submitAttestationRequest(abiEncodedRequest: string) {
    const fdcHub = await getFdcHub();                    // 1. Get FDC Hub contract

    const requestFee = await getFdcRequestFee(abiEncodedRequest);  // 2. Calculate fee

    const transaction = await fdcHub.requestAttestation(abiEncodedRequest, {
        value: requestFee,                               // 3. Submit with fee
    });
    console.log("Submitted request:", transaction.tx, "\n");

    const roundId = await calculateRoundId(transaction); // 4. Calculate round ID
    console.log(
        `Check round progress at: https://${hre.network.name}-systems-explorer.flare.rocks/voting-round/${roundId}?tab=fdc\n`
    );
    return roundId;
}
```

**Step-by-Step Breakdown**:

1. **Get FDC Hub Contract**:
   ```typescript
   const fdcHub = await getFdcHub();
   ```
   - Retrieves the FDC Hub smart contract instance
   - This is the central contract that manages all FDC requests

2. **Calculate Request Fee**:
   ```typescript
   const requestFee = await getFdcRequestFee(abiEncodedRequest);
   ```
   - Determines how much FLARE tokens you need to pay
   - Fee varies based on the complexity of your request

3. **Submit Attestation Request**:
   ```typescript
   const transaction = await fdcHub.requestAttestation(abiEncodedRequest, {
       value: requestFee,
   });
   ```
   - Submits your ABI-encoded request to the FDC Hub contract
   - Pays the calculated request fee in FLARE tokens
   - Returns a blockchain transaction hash

#### 2C: Calculate Round ID

**File**: `scripts/utils/fdc.ts` (Lines 55-71)

```typescript
export async function calculateRoundId(transaction: any) {
    const blockNumber = transaction.receipt.blockNumber;
    const block = await ethers.provider.getBlock(blockNumber);
    const blockTimestamp = BigInt(block.timestamp);

    const flareSystemsManager: IFlareSystemsManagerInstance = await getFlareSystemsManager();
    const firsVotingRoundStartTs = BigInt(await flareSystemsManager.firstVotingRoundStartTs());
    const votingEpochDurationSeconds = BigInt(await flareSystemsManager.votingEpochDurationSeconds());

    console.log("Block timestamp:", blockTimestamp, "\n");
    console.log("First voting round start ts:", firsVotingRoundStartTs, "\n");
    console.log("Voting epoch duration seconds:", votingEpochDurationSeconds, "\n");

    const roundId = Number((blockTimestamp - firsVotingRoundStartTs) / votingEpochDurationSeconds);
    console.log("Calculated round id:", roundId, "\n");
    console.log("Received round id:", Number(await flareSystemsManager.getCurrentVotingEpochId()), "\n");
    return roundId;
}
```

**Round ID Calculation**:
```
roundId = (blockTimestamp - firstVotingRoundStartTs) / votingEpochDurationSeconds
```

**Real Output Example**:
```
Submitted request: 0x2a2754708bb1d2fad14a0aabad9211e017198f55b4b2b144aa35cf68abe3ab09

Block timestamp: 1754141799n
First voting round start ts: 1658430000n
Voting epoch duration seconds: 90n
Calculated round id: 1063464
Received round id: 1063464

Check round progress at: https://coston2-systems-explorer.flare.rocks/voting-round/1063464?tab=fdc
```

**What the Round ID Means**:
- **Voting Round**: A specific time period when validators will process your request
- **Round ID 1063464**: The 1,063,464th voting round since the system started
- **Duration**: Each round lasts 90 seconds
- **Validators**: During this round, all Flare validators will fetch data, apply JQ filters, and vote

### Summary of Step 2
- **You have**: ABI-encoded request from verifier server
- **You pay**: Request fee to FDC Hub contract
- **You submit**: Attestation request to blockchain
- **You get**: Round ID for tracking progress
- **You can monitor**: Progress at the systems explorer URL

---

## Step 3: Wait for Voting Round & Retrieve Proof

### What Happens
You wait for the voting round to complete, then retrieve the cryptographic proof from the Data Availability Layer.

### Code Analysis

#### 3A: Call Retrieve Function

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 90-90)

```typescript
const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);
```

#### 3B: Retrieve Data and Proof

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 44-48)

```typescript
async function retrieveDataAndProof(abiEncodedRequest: string, roundId: number) {
    const url = `${COSTON2_DA_LAYER_URL}api/v1/fdc/proof-by-request-round-raw`;
    console.log("Url:", url, "n");
    return await retrieveDataAndProofBaseWithRetry(url, abiEncodedRequest, roundId);
}
```

#### 3C: Wait for Round Finalization

**File**: `scripts/utils/fdc.ts` (Lines 95-105)

```typescript
export async function retrieveDataAndProofBase(url: string, abiEncodedRequest: string, roundId: number) {
    console.log("Waiting for the round to finalize...");
    // We check every 10 seconds if the round is finalized
    const relay: IRelayInstance = await getRelay();
    const fdcVerification: IFdcVerificationInstance = await getFdcVerification();
    const protocolId = await fdcVerification.fdcProtocolId();
    while (!(await relay.isFinalized(protocolId, roundId))) {
        await sleep(30000);  // Wait 30 seconds
    }
    console.log("Round finalized!\n");
```

**What Happens During This Waiting Period**:

1. **Validators are working**: During the 90-second voting round, all Flare validators:
   - Fetch data from `https://swapi.info/api/people/3`
   - Apply your JQ filter: `{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split("/") | .[-1] | tonumber)}`
   - Vote on the processed result
   - Submit their attestations to the Data Availability Layer

2. **Your script waits**: Checks every 30 seconds if the round is finalized
3. **Round finalizes**: When enough validators have voted and agreed

#### 3D: Request Proof from DA Layer

**File**: `scripts/utils/fdc.ts` (Lines 107-112)

```typescript
const request = {
    votingRoundId: roundId,
    requestBytes: abiEncodedRequest,
};
console.log("Prepared request:\n", request, "\n");

await sleep(10000);  // Wait 10 seconds
let proof = await postRequestToDALayer(url, request, true);
```

**Real Output Example**:
```
Url: https://ctn2-data-availability.flare.network/api/v1/fdc/proof-by-request-round-raw

Prepared request:
{
  votingRoundId: 1063464,
  requestBytes: '0x576562324a736f6e000000000000000000000000000000000000000000000000...'
}
```

#### 3E: Wait for Proof Generation

**File**: `scripts/utils/fdc.ts` (Lines 114-119)

```typescript
console.log("Waiting for the DA Layer to generate the proof...");
while (proof.response_hex == undefined) {
    await sleep(10000);  // Wait 10 seconds
    proof = await postRequestToDALayer(url, request, false);
}
console.log("Proof generated!\n");
```

**What Happens**:
1. **DA Layer processes**: Takes all validator attestations and generates a cryptographic proof
2. **Your script polls**: Checks every 10 seconds if the proof is ready
3. **Proof ready**: When `proof.response_hex` is defined

#### 3F: Return the Proof

**File**: `scripts/utils/fdc.ts` (Lines 121-122)

```typescript
console.log("Proof:", proof, "\n");
return proof;
```

**Real Output Example**:
```json
{
  "response_hex": "0x0000000000000000000000000000000000000000000000000000000000000020...",
  "attestation_type": "0x576562324a736f6e000000000000000000000000000000000000000000000000",
  "proof": [
    "0x95dde404dca2898a007e3a86b87b004ec427a9e9e0600612e10105a9078834f9",
    "0xcbd4f113c167c63ce14c4c1f8134ff0626da56d9f3d7df22f45f8732c6cbe07d",
    "0xbdcbf48251a8970a5a5503ed4f4fe53119686c5eda03070617c841de758c1cd4",
    "0x424b5a2db3354e6e7a789021a482878909b72f63b95f64ecd97e21d463c253e0"
  ]
}
```

**What Each Part of the Proof Means**:
1. **`response_hex`**: The processed data from the Star Wars API (after JQ filtering) in hex format
2. **`attestation_type`**: Identifies this as a Web2Json attestation
3. **`proof`**: Array of Merkle proof elements for cryptographic verification

#### 3G: Error Handling with Retry Logic

**File**: `scripts/utils/fdc.ts` (Lines 125-137)

```typescript
export async function retrieveDataAndProofBaseWithRetry(
    url: string,
    abiEncodedRequest: string,
    roundId: number,
    attempts: number = 10
) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await retrieveDataAndProofBase(url, abiEncodedRequest, roundId);
        } catch (e: any) {
            console.log(e, "\n", "Remaining attempts:", attempts - i, "\n");
            await sleep(20000);
        }
    }
    throw new Error(`Failed to retrieve data and proofs after ${attempts} attempts`);
}
```

**What This Does**:
- Tries up to 10 times to retrieve the proof
- Waits 20 seconds between attempts
- Handles network issues or temporary failures

### Summary of Step 3
1. **Wait for validators**: 90-second voting round where validators fetch and process data
2. **Check finalization**: Poll every 30 seconds until round is finalized
3. **Request proof**: Send request to Data Availability Layer API
4. **Wait for proof**: Poll every 10 seconds until proof is generated
5. **Get proof**: Receive cryptographic proof with processed data

**Total time from output**: ~161 seconds (about 2.7 minutes)

---

## Step 4: Deploy Smart Contract

### What Happens
You deploy the smart contract that will use the verified data to perform calculations and store results.

### Code Analysis

#### 4A: Deploy Contract

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 92-92)

```typescript
const characterList: StarWarsCharacterListV2Instance = await deployAndVerifyContract();
```

#### 4B: Deploy and Verify Function

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 50-62)

```typescript
async function deployAndVerifyContract() {
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
```

**What This Does**:
1. **Deploy contract**: Creates a new instance of `StarWarsCharacterListV2` on the blockchain
2. **Verify source code**: Automatically verifies the contract on the block explorer
3. **Return instance**: Returns the deployed contract instance

**Real Output Example**:
```
Successfully submitted source code for contract
contracts/fdcExample/Web2Json.sol:StarWarsCharacterListV2 at 0xE7f6ff7bD309621ae9e2339C829544E6C58bD8Ba     
for verification on the block explorer. Waiting for verification result...

Successfully verified contract StarWarsCharacterListV2 on the block explorer.
https://coston2-explorer.flare.network/address/0xE7f6ff7bD309621ae9e2339C829544E6C58bD8Ba#code

StarWarsCharacterListV2 deployed to 0xE7f6ff7bD309621ae9e2339C829544E6C58bD8Ba
```

### Summary of Step 4
- **Deploy contract**: Creates new smart contract instance
- **Verify source code**: Automatically verifies on block explorer
- **Get contract address**: Returns the deployed contract address
- **Ready for use**: Contract is ready to receive verified data

---

## Step 5: Use Proof with Smart Contract

### What Happens
You use the cryptographic proof with your smart contract to verify the data, perform calculations (like BMI), and store the results on the blockchain.

### Code Analysis

#### 5A: Call Interaction Function

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 94-94)

```typescript
await interactWithContract(characterList, proof);
```

#### 5B: Decode the Proof Data

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 66-70)

```typescript
async function interactWithContract(characterList: StarWarsCharacterListV2Instance, proof: any) {
    console.log("Proof hex:", proof.response_hex, "\n");

    // A piece of black magic that allows us to read the response type from an artifact
    const IWeb2JsonVerification = await artifacts.require("IWeb2JsonVerification");
    const responseType = IWeb2JsonVerification._json.abi[0].inputs[0].components[1];
    console.log("Response type:", responseType, "\n");

    const decodedResponse = web3.eth.abi.decodeParameter(responseType, proof.response_hex);
    console.log("Decoded proof:", decodedResponse, "\n");
```

**What This Does**:
- Takes the hex-encoded data from the proof
- Decodes it back into human-readable format
- Uses the ABI signature to understand the data structure

**Real Output Example**:
```
Decoded proof: [
  '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  '0x5075626c69635765623200000000000000000000000000000000000000000000',
  '1063464',
  '0',
  [
    'https://swapi.info/api/people/3',
    'GET',
    '{}',
    '{}',
    '{}',
    '{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split("/") | .[-1] | tonumber)}',
    '{"components": [...], "name": "task", "type": "tuple"}',
    url: 'https://swapi.info/api/people/3',
    httpMethod: 'GET',
    headers: '{}',
    queryParams: '{}',
    body: '{}',
    postProcessJq: '{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split("/") | .[-1] | tonumber)}',
    abiSignature: '{"components": [...], "name": "task", "type": "tuple"}'
  ],
  [
    '0x0000000000000000000000000000000000000000000000000000000000000020...',
    abiEncodedData: '0x0000000000000000000000000000000000000000000000000000000000000020...'
  ]
]
```

#### 5C: Call Smart Contract with Proof

**File**: `scripts/fdcExample/Web2Json.ts` (Lines 72-76)

```typescript
const transaction = await characterList.addCharacter({
    merkleProof: proof.proof,
    data: decodedResponse,
});
console.log("Transaction:", transaction.tx, "\n");
console.log("Star Wars Characters:\n", await characterList.getAllCharacters(), "\n");
```

**What This Does**:
- Calls the `addCharacter` function on your smart contract
- Passes the Merkle proof for verification
- Passes the decoded data for processing

**Real Output Example**:
```
Transaction: 0x2bb3b913bd7ffc8317386536b3ffce54ac7a67b0862fba07e7c32d5a4098d8eb
```

#### 5D: Smart Contract Verification & Processing

**File**: `contracts/fdcExample/Web2Json.sol` (Lines 25-45)

```solidity
function addCharacter(IWeb2Json.Proof calldata data) public {
    require(isJsonApiProofValid(data), "Invalid proof");

    DataTransportObject memory dto = abi.decode(
        data.data.responseBody.abiEncodedData,
        (DataTransportObject)
    );

    require(characters[dto.apiUid].apiUid == 0, "Character already exists");

    StarWarsCharacter memory character = StarWarsCharacter({
        name: dto.name,
        numberOfMovies: dto.numberOfMovies,
        apiUid: dto.apiUid,
        bmi: (dto.mass * 100 * 100) / (dto.height * dto.height)
    });

    characters[dto.apiUid] = character;
    characterIds.push(dto.apiUid);
}
```

**What the Smart Contract Does**:

1. **Verifies the proof**: Calls `isJsonApiProofValid(data)` which delegates to the FDC verification system
2. **Decodes the data**: Extracts the processed data from the proof
3. **Calculates BMI**: Uses the formula `(mass * 100 * 100) / (height * height)`
4. **Stores the character**: Saves the data on the blockchain

#### 5E: BMI Calculation Explanation

**The BMI Formula**:
```solidity
bmi: (dto.mass * 100 * 100) / (dto.height * dto.height)
```

**Why This Formula**:
- **Height** from Star Wars API is in **centimeters** (e.g., 96 cm)
- **Mass** from Star Wars API is in **kilograms** (e.g., 32 kg)
- **Standard BMI** expects height in **meters** (e.g., 0.96 m)

**The Conversion**:
```
BMI = (mass × 10,000) / height_in_cm²
```

**Example Calculation for R2-D2**:
- **Height**: 96 cm
- **Mass**: 32 kg
- **BMI Calculation**: `(32 × 10,000) / (96 × 96) = 320,000 / 9,216 = 34.72... ≈ 34`

#### 5F: Display the Results

**Real Output Example**:
```
Star Wars Characters:
[
  [
    'R2-D2',
    '6',
    '3', 
    '34',
    name: 'R2-D2',
    numberOfMovies: '6',
    apiUid: '3',
    bmi: '34'
  ]
]
```

### Summary of Step 5
1. **Decode proof data**: Convert hex data back to readable format
2. **Call smart contract**: Pass proof and data to contract
3. **Verify proof**: Smart contract verifies proof validity
4. **Calculate BMI**: Smart contract performs calculations
5. **Store results**: Save processed data on blockchain
6. **Display results**: Show the final calculated data

---

## Complete Workflow Summary

### The 5-Step FDC Process

1. **Step 1**: Prepare attestation request → Get ABI-encoded request
2. **Step 2**: Submit to FDC Hub → Get round ID
3. **Step 3**: Wait for voting & retrieve proof → Get cryptographic proof
4. **Step 4**: Deploy smart contract → Get contract instance
5. **Step 5**: Use proof with smart contract → Calculate BMI & store data

### What You've Accomplished

- **Fetched external data** from Star Wars API
- **Processed it with JQ filters** to extract specific fields
- **Verified it cryptographically** through decentralized validators
- **Used it in a smart contract** to calculate BMI
- **Stored the result** on the blockchain

**The final result**: R2-D2's BMI is 34! 🤖📊

---

## Technical Details

### Key Components

#### FDC Verifier Server
- **Purpose**: Converts human-readable requests to ABI-encoded binary format
- **Endpoint**: `https://web2json-verifier-test.flare.rocks/Web2Json/prepareRequest`
- **Function**: Acts as a "translator" between human specifications and blockchain format

#### FDC Hub Contract
- **Purpose**: Central contract that manages all FDC requests
- **Function**: Creates voting rounds and coordinates validator activities
- **Fee System**: Calculates and collects fees for attestation requests

#### Flare Validators
- **Purpose**: Decentralized nodes that independently verify data
- **Process**: Fetch data, apply JQ filters, vote on results
- **Consensus**: Must agree on processed data for proof generation

#### Data Availability Layer
- **Purpose**: Generates cryptographic proofs from validator attestations
- **Function**: Creates Merkle proofs for data verification
- **API**: Provides endpoints for proof retrieval

#### FDC Verification System
- **Purpose**: Verifies proof validity in smart contracts
- **Function**: Ensures data was properly attested by the network
- **Integration**: Called by smart contracts before using attested data


#### Retry Logic
- **Proof retrieval**: Up to 10 attempts with 20-second delays
- **Round finalization**: Polls every 30 seconds
- **Proof generation**: Polls every 10 seconds

### Performance Considerations

#### Timing
- **Voting round**: 90 seconds
- **Proof generation**: Variable (typically 10-30 seconds)
- **Total execution**: ~2-3 minutes

#### Network Requirements
- **Testnet tokens**: Required for transaction fees
- **API endpoints**: Must be accessible
- **Blockchain connectivity**: Stable connection to Flare network

### Security Features

#### Cryptographic Verification
- **Merkle proofs**: Ensure data integrity
- **Validator consensus**: Decentralized verification
- **Proof validation**: Smart contract verification

#### Trustless Operation
- **No central authority**: Decentralized validators
- **Independent verification**: Multiple validators confirm data
- **Cryptographic guarantees**: Mathematical proof of data authenticity

---


The FDC workflow provides a robust, trustless way to integrate external data with blockchain applications. By following these 5 steps, you can:

1. **Define data requirements** in human-readable format
2. **Submit requests** to the decentralized network
3. **Wait for verification** by independent validators
4. **Deploy smart contracts** to use the verified data
5. **Perform calculations** and store results on-chain

This system ensures that external data is verified, processed, and made available to smart contracts in a secure, decentralized manner, enabling complex applications that require real-world data integration.

---


