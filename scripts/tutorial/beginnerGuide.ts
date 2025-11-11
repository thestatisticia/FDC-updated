import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

interface TutorialContext {
    dryRun: boolean;
    explain: boolean;
    recaps: string[];
}

interface TutorialStep {
    id: string;
    title: string;
    run: (ctx: TutorialContext) => Promise<void>;
    recap: (ctx: TutorialContext) => string[];
}

const PREFIX = {
    step: "[>]",
    recap: "[?]",
    success: "[✓]",
    warn: "[!]",
    error: "[x]",
    info: "[i]",
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const explain = args.includes("--explain");

const rl = createInterface({ input, output });

async function pause(message = "Bonyeza Enter kuendelea / Press Enter to continue...") {
    await rl.question(`${PREFIX.info} ${message}`);
}

function readEnvKeys(requiredKeys: string[]): string[] {
    const envPath = path.resolve(".env");
    if (!existsSync(envPath)) {
        return [];
    }
    const file = readFileSync(envPath, "utf-8");
    return requiredKeys.filter(key => file.includes(`${key}=`));
}

const steps: TutorialStep[] = [
    {
        id: "intro",
        title: "Set the stage",
        run: async ctx => {
            console.log(`${PREFIX.step} Karibu! Welcome to the FDC beginner walkthrough.`);
            if (ctx.dryRun) {
                console.log(`${PREFIX.info} Running in dry-run mode. No on-chain transactions will be sent.`);
            } else {
                console.log(
                    `${PREFIX.warn} Dry-run disabled. Ensure you have test funds and the right network before proceeding.`
                );
            }
        },
        recap: () => [
            "You confirmed the tutorial mode (dry-run or live).",
            "Everything that follows will reference the selected mode.",
        ],
    },
    {
        id: "env-check",
        title: "Verify environment configuration",
        run: async ctx => {
            const requiredKeys = ["PRIVATE_KEY", "WEB2JSON_VERIFIER_URL_TESTNET", "VERIFIER_API_KEY_TESTNET"];
            const presentKeys = readEnvKeys(requiredKeys);

            if (presentKeys.length !== requiredKeys.length) {
                const missing = requiredKeys.filter(key => !presentKeys.includes(key));
                throw new Error(`Missing keys in .env: ${missing.join(", ")}`);
            }

            console.log(`${PREFIX.success} Required environment keys detected.`);
            if (ctx.explain) {
                console.log(
                    `${PREFIX.info} PRIVATE_KEY signs transactions, WEB2JSON_VERIFIER_URL_TESTNET points to the verifier, and VERIFIER_API_KEY_TESTNET authenticates requests.`
                );
            }
        },
        recap: () => [
            ".env contains the minimum configuration required for attestation scripts.",
            "Verifier URL and API key are ready for use.",
        ],
    },
    {
        id: "prepare-request",
        title: "Assemble a Web2Json request",
        run: async ctx => {
            const requestExample = {
                url: "https://swapi.dev/api/people/3/",
                httpMethod: "GET",
                postProcessJq: `{name: .name, height: .height}`,
            };
            console.log(`${PREFIX.step} Sample request body:\n${JSON.stringify(requestExample, null, 2)}`);
            if (ctx.explain) {
                console.log(
                    `${PREFIX.info} postProcessJq filters the JSON to only the fields we care about. Customize it as needed.`
                );
            }
        },
        recap: () => [
            "You reviewed the minimal JSON payload sent to the verifier.",
            "The jq expression determines the shape of the on-chain response.",
        ],
    },
    {
        id: "submit",
        title: "Submit attestation request",
        run: async ctx => {
            if (ctx.dryRun) {
                console.log(
                    `${PREFIX.info} Dry-run: skipping live submission. Copy the payload into scripts/fdcExample/Web2Json.ts when ready.`
                );
                return;
            }

            console.log(
                `${PREFIX.warn} Live mode not yet automated in this walkthrough. Use scripts/fdcExample/Web2Json.ts to perform the real submission.`
            );
        },
        recap: ctx =>
            ctx.dryRun
                ? [
                      "Dry-run mode kept the network safe—no real submissions were made.",
                      "You now know where the submission logic lives for later use.",
                  ]
                : [
                      "Live submissions are handled via scripts/fdcExample/Web2Json.ts.",
                      "Make sure to fund your wallet before running the full flow.",
                  ],
    },
    {
        id: "proof",
        title: "Retrieve and inspect proof",
        run: async ctx => {
            console.log(
                `${PREFIX.step} Proofs arrive with fields like merkleProof[], response_hex, and roundId. Inspect each before trusting it.`
            );
            if (ctx.explain) {
                console.log(
                    `${PREFIX.info} The merkle proof links your data to the verified root. response_hex is ABI-encoded data for your contract.`
                );
            }
        },
        recap: () => [
            "You learned the critical components inside the proof object.",
            "Always validate the merkle proof and decode the ABI payload.",
        ],
    },
    {
        id: "wrap-up",
        title: "Wrap up & next steps",
        run: async ctx => {
            console.log(`${PREFIX.success} Tutorial complete! Next steps:`);
            console.log("  1. Edit scripts/playground/ examples and re-run them.");
            console.log("  2. Switch off dry-run when you are comfortable.");
            console.log("  3. Explore docs/quickstart-checklist.md and docs/faq.md.");
            if (ctx.explain) {
                console.log(
                    `${PREFIX.info} Ready for more? Phase 3 tooling (progress tracker, CLI explain, tests) is available in docs/beginner-tools.md.`
                );
            }
        },
        recap: () => [
            "You have an actionable list of next steps.",
            "The documentation is your friend—refer to quickstart and FAQ anytime.",
        ],
    },
];

async function runTutorial() {
    const ctx: TutorialContext = {
        dryRun,
        explain,
        recaps: [],
    };

    console.log(`${PREFIX.info} Flags -> dryRun: ${ctx.dryRun}, explain: ${ctx.explain}`);

    for (const step of steps) {
        try {
            console.log(`\n${PREFIX.step} Step: ${step.title}`);
            await step.run(ctx);
            const recapLines = step.recap(ctx);
            ctx.recaps.push(...recapLines);

            console.log(`${PREFIX.recap} What just happened?`);
            recapLines.forEach(line => console.log(`   - ${line}`));
        } catch (error) {
            console.error(
                `${PREFIX.error} Step "${step.title}" failed: ${(error as Error).message}\n` +
                    "Review your .env configuration or rerun with --dry-run."
            );
            if (!ctx.dryRun) {
                console.error(`${PREFIX.warn} Tip: use --dry-run to rehearse without network calls.`);
            }
            break;
        }

        await pause();
    }

    rl.close();
}

runTutorial()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(`${PREFIX.error} Tutorial terminated unexpectedly:`, error);
        process.exitCode = 1;
    });

