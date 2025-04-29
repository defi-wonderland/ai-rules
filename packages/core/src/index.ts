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

    try {
        // 1. Ask for confirmation if files might be overwritten
        const outputPath = process.cwd();
        const coderabbitPath = path.join(outputPath, ".coderabbit.yaml");
        const cursorPath = path.join(outputPath, ".cursor");

        let shouldPrompt = false;
        try {
            await fs.access(coderabbitPath);
            shouldPrompt = true;
        } catch {}
        try {
            await fs.access(cursorPath);
            shouldPrompt = true;
        } catch {}

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
            // Team-specific configs are top-level optional properties
            // We provide defaults here based on the schemas to satisfy the type,
            // even if the generator might override/ignore parts.
            typescript: OffchainLanguageConfigSchema.parse({ language: "typescript" }),
            solidity: SolidityConfigSchema.parse({}), // Default for solidity
            // ui: {} // No specific schema for UI currently defined in ConfigSchema
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
