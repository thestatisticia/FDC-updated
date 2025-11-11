import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { ProgressTracker } from "../utils/progress";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const explainMode = args.includes("--explain");

type StepResult = "success" | "skipped" | "failed";

interface StepSummary {
    label: string;
    result: StepResult;
    message?: string;
}

const STEP_PREFIX = {
    info: "[i]",
    step: "[>]",
    success: "[✓]",
    warning: "[!]",
    error: "[x]",
};

const DEFAULT_ENV_VALUES: Record<string, string> = {
    PRIVATE_KEY: "0xYOUR_TEST_PRIVATE_KEY",
    WEB2JSON_VERIFIER_URL_TESTNET: "https://verifier.flare.network/",
    VERIFIER_API_KEY_TESTNET: "demo-api-key",
    COSTON2_DA_LAYER_URL: "https://da.coston2.towolabs.com/",
    COSTON_RPC_URL: "https://coston-api.flare.network/ext/C/rpc",
    COSTON2_RPC_URL: "https://coston2-api.flare.network/ext/C/rpc",
    SONGBIRD_RPC_URL: "https://songbird-api.flare.network/ext/C/rpc",
    FLARE_RPC_URL: "https://flare-api.flare.network/ext/C/rpc",
    XRPLEVM_RPC_URL_TESTNET: "https://rpc-evm-sidechain.xrpl.org",
    XRPLEVM_EXPLORER_URL_TESTNET: "https://explorer.xrplevm.org/",
    FLARESCAN_API_KEY: "your-flarescan-api-key",
    FLARE_EXPLORER_API_KEY: "your-flare-explorer-api-key",
    ETHERSCAN_API_URL: "your-etherscan-api-key",
    GOERLI_API_URL: "your-alchemy-goerli-key",
    SEPOLIA_API_KEY: "your-ankr-sepolia-key",
};

function logInfo(message: string) {
    console.log(`${STEP_PREFIX.info} ${message}`);
}

function logStep(message: string) {
    console.log(`${STEP_PREFIX.step} ${message}`);
}

function logSuccess(message: string) {
    console.log(`${STEP_PREFIX.success} ${message}`);
}

function logWarning(message: string) {
    console.log(`${STEP_PREFIX.warning} ${message}`);
}

function logError(message: string) {
    console.log(`${STEP_PREFIX.error} ${message}`);
}

function ensureEnvFile(): StepSummary {
    const envExamplePath = path.join(ROOT, ".env.example");
    const envPath = path.join(ROOT, ".env");

    if (!existsSync(envExamplePath)) {
        if (explainMode) {
            logWarning("Expected .env.example at the project root. The bootstrap script relies on it to scaffold .env.");
        }
        return {
            label: "Check .env.example",
            result: "failed",
            message: "Missing .env.example. Please add one before running bootstrap.",
        };
    }

    if (!existsSync(envPath)) {
        copyFileSync(envExamplePath, envPath);
        if (explainMode) {
            logInfo(".env was missing, so we copied .env.example as the starting point.");
        }
        return { label: "Create .env", result: "success", message: ".env created from .env.example." };
    }

    return { label: "Create .env", result: "skipped", message: ".env already exists." };
}

function parseEnvFile(envPath: string): Record<string, string> {
    if (!existsSync(envPath)) {
        return {};
    }

    const lines = readFileSync(envPath, "utf-8").split(/\r?\n/);
    const result: Record<string, string> = {};
    for (const line of lines) {
        if (!line || line.trim().startsWith("#")) {
            continue;
        }
        const [key, ...rest] = line.split("=");
        if (key) {
            result[key.trim()] = rest.join("=").trim();
        }
    }
    return result;
}

function writeEnvFile(envPath: string, values: Record<string, string>) {
    const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
    writeFileSync(envPath, lines.join("\n"), "utf-8");
}

function ensureEnvDefaults(): StepSummary {
    const envPath = path.join(ROOT, ".env");
    const current = parseEnvFile(envPath);
    let updated = false;

    for (const [key, value] of Object.entries(DEFAULT_ENV_VALUES)) {
        if (!current[key]) {
            current[key] = value;
            updated = true;
        }
    }

    if (updated) {
        writeEnvFile(envPath, current);
        if (explainMode) {
            logInfo("Added placeholder values for missing keys. Update them before running live flows.");
        }
        return { label: "Fill default env vars", result: "success", message: "Added placeholder defaults to .env." };
    }

    return { label: "Fill default env vars", result: "skipped", message: "All defaults already set." };
}

function ensurePlaygroundDirectory(): StepSummary {
    const playgroundDir = path.join(ROOT, "scripts", "playground");
    if (!existsSync(playgroundDir)) {
        mkdirSync(playgroundDir, { recursive: true });
        if (explainMode) {
            logInfo("Created scripts/playground/ so you have a dedicated space for experiments.");
        }
        return { label: "Ensure playground dir", result: "success", message: "Created scripts/playground/." };
    }
    return { label: "Ensure playground dir", result: "skipped", message: "scripts/playground/ already exists." };
}

function runCommand(command: string, args: string[], label: string): StepSummary {
    logStep(`Running ${command} ${args.join(" ")}`);
    const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });

    if (result.status === 0) {
        return { label, result: "success" };
    }

    return {
        label,
        result: "failed",
        message: `${command} exited with code ${result.status}.`,
    };
}

function compileContracts(): StepSummary {
    const tracker = new ProgressTracker();
    tracker.start("Compiling contracts with Hardhat...");
    try {
        const summary = runCommand("npx", ["hardhat", "compile"], "Compile contracts");
        if (summary.result === "success") {
            tracker.succeed("Contracts compiled successfully.");
            if (explainMode) {
                logInfo(
                    "Hardhat compilation ensures artifacts/ and typechain outputs are fresh. Rerun after editing smart contracts."
                );
            }
        } else if (summary.result === "skipped") {
            tracker.stop();
        } else {
            tracker.fail(summary.message ?? "Compilation failed.");
        }
        return summary;
    } catch (error: any) {
        tracker.fail((error as Error).message);
        return {
            label: "Compile contracts",
            result: "failed",
            message: (error as Error).message,
        };
    }
}

function main() {
    logInfo("Starting beginner bootstrap...");
    if (explainMode) {
        logInfo(
            "Explain mode enabled: additional context will be shown for each step. Disable with `--no-explain` (default)."
        );
    }

    const summaries: StepSummary[] = [];
    summaries.push(ensureEnvFile());
    summaries.push(ensureEnvDefaults());
    summaries.push(ensurePlaygroundDirectory());
    summaries.push(compileContracts());

    const successCount = summaries.filter(s => s.result === "success").length;
    const skippedCount = summaries.filter(s => s.result === "skipped").length;
    const failed = summaries.filter(s => s.result === "failed");

    console.log("\nSummary:");
    summaries.forEach(summary => {
        const statusIcon =
            summary.result === "success" ? STEP_PREFIX.success : summary.result === "skipped" ? STEP_PREFIX.info : STEP_PREFIX.error;

        console.log(`${statusIcon} ${summary.label}${summary.message ? ` – ${summary.message}` : ""}`);
    });

    logSuccess(`Completed ${successCount} step(s). Skipped ${skippedCount}.`);

    if (failed.length) {
        logWarning("Some steps failed. Please review the messages above.");
        process.exitCode = 1;
    } else {
        logSuccess("Bootstrap finished without errors.");
    }
}

main();

