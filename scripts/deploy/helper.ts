import { artifacts, ethers, network, run } from "hardhat";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type ReadLineInterface = ReturnType<typeof createInterface>;

interface ContractOption {
    label: string;
    fullyQualifiedName: string;
}

const STEP_PREFIX = {
    info: "[i]",
    step: "[>]",
    success: "[✓]",
    warning: "[!]",
    error: "[x]",
};

async function gatherContractOptions(): Promise<ContractOption[]> {
    const allContracts = await artifacts.getAllFullyQualifiedNames();
    const filtered = allContracts.filter(name => name.startsWith("contracts/"));

    return filtered.map(fqn => {
        const [, contractName] = fqn.split(":");
        return {
            label: contractName ?? fqn,
            fullyQualifiedName: fqn,
        };
    });
}

async function promptChoice(rl: ReadLineInterface, question: string, options: ContractOption[]): Promise<ContractOption> {
    if (options.length === 0) {
        throw new Error("No compiled contracts found. Please run `yarn hardhat compile` first.");
    }

    console.log(`${STEP_PREFIX.info} Available contracts:`);
    options.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.label} (${option.fullyQualifiedName})`);
    });

    while (true) {
        const answer = await rl.question(`${question} (enter number): `);
        const choice = Number.parseInt(answer.trim(), 10);
        if (!Number.isNaN(choice) && choice >= 1 && choice <= options.length) {
            return options[choice - 1]!;
        }
        console.log(`${STEP_PREFIX.warning} Please enter a number between 1 and ${options.length}.`);
    }
}

async function promptConstructorArgs(rl: ReadLineInterface): Promise<unknown[]> {
    const answer = await rl.question(
        `${STEP_PREFIX.info} Enter constructor arguments as JSON array (press enter for none): `
    );

    if (!answer.trim()) {
        return [];
    }

    try {
        const parsed = JSON.parse(answer);
        if (!Array.isArray(parsed)) {
            throw new Error("Constructor arguments must be an array.");
        }
        return parsed;
    } catch (error: any) {
        console.log(`${STEP_PREFIX.error} ${(error as Error).message}`);
        return promptConstructorArgs(rl);
    }
}

async function promptConfirm(rl: ReadLineInterface, question: string, defaultValue = true): Promise<boolean> {
    const suffix = defaultValue ? "[Y/n]" : "[y/N]";
    const answer = await rl.question(`${question} ${suffix}: `);
    const normalized = answer.trim().toLowerCase();

    if (!normalized) {
        return defaultValue;
    }

    if (["y", "yes"].includes(normalized)) {
        return true;
    }

    if (["n", "no"].includes(normalized)) {
        return false;
    }

    console.log(`${STEP_PREFIX.warning} Please answer with yes or no.`);
    return promptConfirm(rl, question, defaultValue);
}

async function promptConfirmations(rl: ReadLineInterface): Promise<number> {
    const answer = await rl.question(
        `${STEP_PREFIX.info} Wait for how many confirmations before continuing? (default 2): `
    );

    if (!answer.trim()) {
        return 2;
    }

    const parsed = Number.parseInt(answer.trim(), 10);
    if (Number.isNaN(parsed) || parsed < 0) {
        console.log(`${STEP_PREFIX.warning} Please enter a non-negative number.`);
        return promptConfirmations(rl);
    }

    return parsed;
}

async function verifyDeployment(address: string, constructorArguments: unknown[]) {
    console.log(`${STEP_PREFIX.step} Verifying contract on block explorer...`);
    try {
        await run("verify:verify", {
            address,
            constructorArguments,
        });
        console.log(`${STEP_PREFIX.success} Verification successful.`);
    } catch (error: any) {
        console.log(`${STEP_PREFIX.warning} Verification skipped or failed: ${(error as Error).message}`);
    }
}

async function checkOnChainCode(address: string) {
    const code = await ethers.provider.getCode(address);
    if (code === "0x") {
        throw new Error("No code found at deployed address. Deployment may have failed.");
    }
}

async function main() {
    console.log(`${STEP_PREFIX.info} Network: ${network.name}`);

    const rl = createInterface({ input, output });

    try {
        const options = await gatherContractOptions();
        const selectedContract = await promptChoice(rl, "Select contract to deploy", options);
        const constructorArgs = await promptConstructorArgs(rl);

        console.log(`${STEP_PREFIX.step} Getting contract factory for ${selectedContract.fullyQualifiedName}...`);
        const factory = await ethers.getContractFactory(selectedContract.fullyQualifiedName);

        console.log(`${STEP_PREFIX.step} Deploying contract...`);
        const contract = await factory.deploy(...constructorArgs);
        await contract.waitForDeployment();

        const deploymentTx = contract.deploymentTransaction();
        if (!deploymentTx) {
            throw new Error("Failed to retrieve deployment transaction.");
        }

        const confirmations = await promptConfirmations(rl);
        console.log(`${STEP_PREFIX.step} Waiting for ${confirmations} confirmation(s)...`);
        await deploymentTx.wait(confirmations);

        const contractAddress = await contract.getAddress();
        await checkOnChainCode(contractAddress);

        console.log(`${STEP_PREFIX.success} Deployment successful!`);
        console.log(`${STEP_PREFIX.info} Contract address: ${contractAddress}`);
        console.log(`${STEP_PREFIX.info} Transaction hash: ${deploymentTx.hash}`);

        const shouldVerify = await promptConfirm(rl, "Attempt verification now?", true);
        if (shouldVerify) {
            await verifyDeployment(contractAddress, constructorArgs);
        }

        const showSummary = await promptConfirm(rl, "Show deployment summary?", true);
        if (showSummary) {
            console.log("\nDeployment Summary");
            console.log("------------------");
            console.log(`Network: ${network.name}`);
            console.log(`Contract: ${selectedContract.label}`);
            console.log(`Address: ${contractAddress}`);
            console.log(`Tx Hash: ${deploymentTx.hash}`);
            console.log(`Constructor args: ${JSON.stringify(constructorArgs) || "[]"}`);
        }
    } finally {
        rl.close();
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(`${STEP_PREFIX.error} Deployment helper failed:`, error);
        process.exitCode = 1;
    });


