#!/usr/bin/env node
// The above shebang directive tells the system to use the node interpreter found in the user's PATH to run the script
// This allows users to run the script directly rather than explicitly calling node
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";

import { TemplateGenerator } from "./internal/generators/template-generator.js";
import {
    Config,
    OffchainLanguageConfigSchema,
    SolidityConfigSchema,
    TeamType,
} from "./internal/schemas/config.js";
import { baseConfig } from "./internal/templates/defaults/base.js";

/**
 * Main function to run the AI rules installation script.
 */
async function run(): Promise<void> {
    console.log("Starting AI Rules installation...");

    // 1. Ask for confirmation if files might be overwritten
    const outputPath = process.cwd();
    const coderabbitPath = path.join(outputPath, ".coderabbit.yaml");
    const cursorPath = path.join(outputPath, ".cursor");

    let shouldPrompt = false;
    try {
        await fs.access(coderabbitPath);
        shouldPrompt = true;
    } catch (err: unknown) {
        if (!isNodeErrorWithCode(err) || err.code !== "ENOENT") {
            // Log and proceed, don't exit
            console.error(`File check failed for: ${coderabbitPath}`);
        }
    }
    try {
        await fs.access(cursorPath);
        shouldPrompt = true;
    } catch (err: unknown) {
        if (!isNodeErrorWithCode(err) || err.code !== "ENOENT") {
            // Log and proceed, don't exit
            console.error(`File check failed for: ${cursorPath}`);
        }
    }

    try {
        if (shouldPrompt) {
            const confirm = await confirmOverwrite();
            if (!confirm) {
                console.log("Installation cancelled.");
                return;
            }
        }

        // 2. Define the full/default configuration matching the ConfigSchema
        // Note: We use baseConfig as the foundation and specify team-specific parts
        const config: Config = {
            version: baseConfig.version,
            teams: [TeamType.enum.offchain, TeamType.enum.solidity, TeamType.enum.ui],
            typescript: OffchainLanguageConfigSchema.parse({ language: "typescript" }),
            solidity: SolidityConfigSchema.parse({}), // Use Zod default for solidity
            coderabbit: baseConfig.coderabbit, // Use the default coderabbit config from baseConfig
        };
        // console.log("Using default configuration:", JSON.stringify(config, null, 2)); // Optional: for debugging

        // 3. Instantiate the generator directly
        const generator = new TemplateGenerator(config, outputPath);
        console.log(`Generating files in: ${outputPath}`);

        // 4. Generate the files
        await generator.generateAll();

        console.log("✅ AI Rules configuration files generated successfully!");
    } catch (error) {
        console.error("❌ Error during AI Rules installation:");
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(String(error)); // Ensure error is logged as string
        }
        process.exit(1); // Exit with error code
    }
}

/**
 * Type guard to check if an error is a NodeJS error with a code property
 */
function isNodeErrorWithCode(err: unknown): err is { code: string } {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string"
    );
}

/**
 * Asks the user for confirmation before proceeding.
 * @returns {Promise<boolean>} True if the user confirms, false otherwise.
 */
async function confirmOverwrite(): Promise<boolean> {
    try {
        const response = await inquirer.prompt<{ confirm: boolean }>([
            {
                type: "confirm",
                name: "confirm",
                message:
                    "Existing AI Rules config files (.coderabbit.yaml or .cursor/) found. Overwrite managed files with newer versions?",
                default: false,
            },
        ]);
        return response.confirm;
    } catch (err) {
        console.warn("Could not load or run inquirer, proceeding without confirmation.");
        if (err instanceof Error) console.warn(err.message);
        return true; // Default to true (proceed) if prompting fails
    }
}

// Execute the run function if the script is executed directly
const currentFilePath = fileURLToPath(import.meta.url);
const entryPointPath = process.argv[1];

if (currentFilePath === entryPointPath) {
    void run();
}

export { run }; // Export for potential programmatic use or testing
