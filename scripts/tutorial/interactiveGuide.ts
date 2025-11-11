import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { spawn } from "node:child_process";
import { buildMockWeb2JsonBundle } from "../../utils/mockData";

type TutorialStep = {
    title: string;
    description: string;
    command?: string;
};

type TutorialOptions = {
    mock: boolean;
    autoRun: boolean;
};

const STEPS: TutorialStep[] = [
    {
        title: "Install dependencies",
        description: "Ensures Hardhat and script tools are available. Skips if already installed.",
        command: "yarn install",
    },
    {
        title: "Compile contracts",
        description: "Builds Solidity artifacts before executing scripts.",
        command: "npx hardhat compile",
    },
    {
        title: "Run Web2Json script",
        description:
            "Executes scripts/fdcExample/Web2Json.ts. Use --mock to avoid live submissions while exploring.",
        command: "yarn hardhat run scripts/fdcExample/Web2Json.ts --network coston2",
    },
    {
        title: "Inspect stored data",
        description: "Reads the characters saved on-chain. Requires a deployed contract address.",
        command: "npx ts-node scripts/tutorial/showCharacters.ts --mock",
    },
];

function parseOptions(): TutorialOptions {
    const args = process.argv.slice(2);
    return {
        mock: args.includes("--mock"),
        autoRun: args.includes("--auto-run"),
    };
}

async function runCommand(command: string) {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(command, {
            shell: true,
            stdio: "inherit",
        });
        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command "${command}" exited with code ${code}`));
            }
        });
    });
}

async function walkThrough(options: TutorialOptions) {
    const rl = readline.createInterface({ input, output });
    console.log("\n🌟 Welcome to the FDC interactive tutorial!");
    console.log(
        "You'll be guided through the full Web2Json flow. Press enter to continue or type 'skip' to move on.\n"
    );

    for (const step of STEPS) {
        console.log(`➡️  ${step.title}`);
        console.log(`   ${step.description}`);
        if (step.command) {
            console.log(`   Suggested command: ${step.command}\n`);
        }

        const answer = await rl.question("[enter = continue | run = execute command | skip = next] ");
        if (answer.trim().toLowerCase() === "skip") {
            console.log("   Skipped.\n");
            continue;
        }

        if ((options.autoRun || answer.trim().toLowerCase() === "run") && step.command) {
            try {
                await runCommand(step.command);
            } catch (error) {
                console.error(`   ❌  ${error instanceof Error ? error.message : error}`);
            }
        } else {
            console.log("   Take your time to run the command manually, then come back and press enter.\n");
        }
    }

    if (options.mock) {
        const bundle = buildMockWeb2JsonBundle();
        console.log("\n🧪 Mock mode summary:");
        console.log(JSON.stringify(bundle, null, 2));
        console.log("Use this output to test decoders or front-end components without real attestations.\n");
    }

    console.log("🎉 Tutorial complete! Check out frontend/index.html to see results in a browser.\n");
    await rl.close();
}

void walkThrough(parseOptions());


