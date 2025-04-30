#!/usr/bin/env node
import * as fs from "fs/promises";
import * as path from "path";
import { baseConfig } from "@ai-rules/config";
import { TemplateGenerator } from "@ai-rules/generators";
import {
    Config,
    OffchainLanguageConfigSchema,
    SolidityConfigSchema,
    TeamType,
} from "@ai-rules/types";
import inquirer from "inquirer";

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
        const config: Config = {
            version: baseConfig.version,
            teams: [TeamType.enum.offchain, TeamType.enum.solidity, TeamType.enum.ui],
            typescript: OffchainLanguageConfigSchema.parse({ language: "typescript" }),
            solidity: SolidityConfigSchema.parse({}), // Default for solidity
            coderabbit: baseConfig.coderabbit, // Use the default coderabbit config from baseConfig
        };
        console.log("Using default configuration:", JSON.stringify(config, null, 2));

        // 3. Instantiate the generator
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
            console.error(error);
        }
        process.exit(1);
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
        // Use inquirer directly for a confirmation prompt
        const response = await inquirer.prompt<{ confirm: boolean }>([
            {
                type: "confirm",
                name: "confirm",
                message:
                    "Existing AI Rules config files (.coderabbit.yaml or .cursor/) found. Overwrite?",
                default: false, // Default to not overwriting
            },
        ]);
        return response.confirm;
    } catch (err) {
        console.warn("Could not load or run inquirer, proceeding without confirmation.");
        if (err instanceof Error) console.warn(err.message);
        return true; // Default to true if prompting fails
    }
}

export { run };
