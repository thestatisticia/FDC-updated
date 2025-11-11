import hre, { ethers } from "hardhat";
import { toUtf8HexString, sleep } from "./core";
import { getContractAddressByName, getFlareSystemsManager, getFdcHub, getRelay, getFdcVerification } from "./getters";
import {
    IFlareSystemsManagerInstance,
    IFdcRequestFeeConfigurationsInstance,
    IRelayInstance,
    IFdcVerificationInstance,
} from "../../typechain-types";

const FdcRequestFeeConfigurations = artifacts.require("IFdcRequestFeeConfigurations");

type VerifierIdentifiers = {
    attestationType: string;
    sourceId: string;
};

const JSON_HEADERS = {
    "Content-Type": "application/json",
};

function logSection(message: string) {
    console.log(`\n[${message}]\n`);
}

function encodeIdentifiers(attestationTypeBase: string, sourceIdBase: string): VerifierIdentifiers {
    return {
        attestationType: toUtf8HexString(attestationTypeBase),
        sourceId: toUtf8HexString(sourceIdBase),
    };
}

function createVerifierRequest(identifiers: VerifierIdentifiers, requestBody: any) {
    return {
        attestationType: identifiers.attestationType,
        sourceId: identifiers.sourceId,
        requestBody,
    };
}

async function postJson<T>(
    url: string,
    payload: unknown,
    {
        headers = {},
        expectOk = true,
    }: {
        headers?: Record<string, string | undefined>;
        expectOk?: boolean;
    } = {}
): Promise<T> {
    const filteredHeaders = Object.entries({ ...JSON_HEADERS, ...headers }).reduce<Record<string, string>>(
        (acc, [key, value]) => {
            if (value) {
                acc[key] = value;
            }
            return acc;
        },
        {}
    );

    const response = await fetch(url, {
        method: "POST",
        headers: filteredHeaders,
        body: JSON.stringify(payload),
    });

    if (expectOk && !response.ok) {
        const body = await response.text();
        throw new Error(`Request to ${url} failed: ${response.status} ${response.statusText}\n${body}\n`);
    }

    return (await response.json()) as T;
}

export async function getFdcRequestFee(abiEncodedRequest: string) {
    const address: string = await getContractAddressByName("FdcRequestFeeConfigurations");
    const contract: IFdcRequestFeeConfigurationsInstance = await FdcRequestFeeConfigurations.at(address);
    return await contract.getRequestFee(abiEncodedRequest);
}

export async function prepareAttestationRequestBase(
    url: string,
    apiKey: string,
    attestationTypeBase: string,
    sourceIdBase: string,
    requestBody: any
) {
    logSection("Verifier request");
    console.log("Url:", url, "\n");
    const identifiers = encodeIdentifiers(attestationTypeBase, sourceIdBase);
    const request = createVerifierRequest(identifiers, requestBody);
    console.log("Prepared request:\n", request, "\n");

    const response = await postJson<any>(url, request, {
        headers: { "X-API-KEY": apiKey },
    });
    console.log("Response status is OK\n");
    return response;
}

async function calculateRoundIdFromBlock(blockTimestamp: bigint) {
    const flareSystemsManager: IFlareSystemsManagerInstance = await getFlareSystemsManager();
    const firstVotingRoundStartTs = BigInt(await flareSystemsManager.firstVotingRoundStartTs());
    const votingEpochDurationSeconds = BigInt(await flareSystemsManager.votingEpochDurationSeconds());

    console.log("Block timestamp:", blockTimestamp, "\n");
    console.log("First voting round start ts:", firstVotingRoundStartTs, "\n");
    console.log("Voting epoch duration seconds:", votingEpochDurationSeconds, "\n");

    return Number((blockTimestamp - firstVotingRoundStartTs) / votingEpochDurationSeconds);
}

export async function calculateRoundId(transaction: any) {
    const blockNumber = transaction.receipt.blockNumber;
    const block = await ethers.provider.getBlock(blockNumber);
    const roundId = await calculateRoundIdFromBlock(BigInt(block.timestamp));
    console.log("Calculated round id:", roundId, "\n");

    const flareSystemsManager: IFlareSystemsManagerInstance = await getFlareSystemsManager();
    console.log("Received round id:", Number(await flareSystemsManager.getCurrentVotingEpochId()), "\n");
    return roundId;
}

export async function submitAttestationRequest(abiEncodedRequest: string) {
    logSection("Submitting attestation request");
    const fdcHub = await getFdcHub();
    const requestFee = await getFdcRequestFee(abiEncodedRequest);
    console.log("Calculated request fee:", requestFee.toString(), "\n");

    const transaction = await fdcHub.requestAttestation(abiEncodedRequest, {
        value: requestFee,
    });
    console.log("Submitted request:", transaction.tx, "\n");

    const roundId = await calculateRoundId(transaction);
    console.log(
        `Track round: https://${hre.network.name}-systems-explorer.flare.rocks/voting-round/${roundId}?tab=fdc\n`
    );
    return roundId;
}

export async function postRequestToDALayer(url: string, request: any, watchStatus: boolean = false) {
    return await postJson<any>(url, request, { expectOk: watchStatus });
}

async function waitForRoundFinalization(protocolId: string, roundId: number) {
    const relay: IRelayInstance = await getRelay();
    const POLL_INTERVAL_MS = 30000;

    console.log(`Polling relay for round finalization (every ${POLL_INTERVAL_MS / 1000}s)...\n`);
    while (!(await relay.isFinalized(protocolId, roundId))) {
        await sleep(POLL_INTERVAL_MS);
    }
}

async function getFdcProtocolId(): Promise<string> {
    const fdcVerification: IFdcVerificationInstance = await getFdcVerification();
    return await fdcVerification.fdcProtocolId();
}

async function pollForProof(url: string, request: any) {
    let proof = await postRequestToDALayer(url, request, true);
    if (proof.response_hex !== undefined) {
        return proof;
    }

    console.log("Waiting for the DA Layer to generate the proof...");
    while (proof.response_hex === undefined) {
        await sleep(10000);
        proof = await postRequestToDALayer(url, request, false);
    }
    return proof;
}

export async function retrieveDataAndProofBase(url: string, abiEncodedRequest: string, roundId: number) {
    logSection("Proof retrieval");
    console.log("Waiting for the round to finalize...\n");
    const protocolId = await getFdcProtocolId();
    await waitForRoundFinalization(protocolId, roundId);
    console.log("Round finalized!\n");

    const request = {
        votingRoundId: roundId,
        requestBytes: abiEncodedRequest,
    };
    console.log("Prepared request:\n", request, "\n");

    const proof = await pollForProof(url, request);
    console.log("Proof generated!\n");
    console.log("Proof:", proof, "\n");
    return proof;
}

export async function retrieveDataAndProofBaseWithRetry(
    url: string,
    abiEncodedRequest: string,
    roundId: number,
    attempts: number = 10
) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await retrieveDataAndProofBase(url, abiEncodedRequest, roundId);
        } catch (error) {
            console.log(error, "\n", "Remaining attempts:", attempts - (i + 1), "\n");
            await sleep(20000);
        }
    }
    throw new Error(`Failed to retrieve data and proofs after ${attempts} attempts`);
}

