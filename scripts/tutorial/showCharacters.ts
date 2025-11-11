import { ethers } from "ethers";
import { mockStarWarsCharacters } from "../../utils/mockData";

const ABI = [
    "function getAllCharacters() view returns (tuple(string name,uint256 numberOfMovies,uint256 apiUid,uint256 bmi)[])",
];

type Options = {
    rpcUrl: string;
    contractAddress: string | undefined;
    useMock: boolean;
};

function parseArgs(): Options {
    const args = process.argv.slice(2);
    return {
        rpcUrl: process.env.RPC_URL ?? "https://coston2-api.flare.network/ext/C/rpc",
        contractAddress: args.find((value) => value.startsWith("0x")),
        useMock: args.includes("--mock"),
    };
}

async function loadCharactersFromChain(rpcUrl: string, contractAddress: string) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, ABI, provider);
    const characters = await contract.getAllCharacters();
    return characters.map((item: any) => ({
        name: item.name,
        numberOfMovies: Number(item.numberOfMovies),
        apiUid: Number(item.apiUid),
        bmi: Number(item.bmi),
    }));
}

async function main() {
    const options = parseArgs();

    if (options.useMock || !options.contractAddress) {
        console.log("Using mock data:\n", mockStarWarsCharacters);
        return;
    }

    console.log(`Fetching characters from ${options.contractAddress} via ${options.rpcUrl}`);
    const characters = await loadCharactersFromChain(options.rpcUrl, options.contractAddress);
    console.log(JSON.stringify(characters, null, 2));
}

void main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});



