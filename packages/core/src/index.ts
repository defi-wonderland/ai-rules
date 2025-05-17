#!/usr/bin/env node
// The above shebang directive tells the system to use the node interpreter found in the user's PATH to run the script
// This allows users to run the script directly rather than explicitly calling node
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";

import { TemplateGenerator } from "./internal/generators/index.js";
import {
    Config,
    OffchainLanguageConfigSchema,
    SolidityConfigSchema,
    TeamType,
} from "./internal/schemas/index.js";
import { baseConfig } from "./internal/templates/defaults/index.js";

/**
 * Custom error for when the project root directory cannot be found
 */
class ProjectRootNotFound extends Error {
    constructor(message = "Could not find project root directory") {
        super(message);
        this.name = "ProjectRootNotFound";
    }
}

/**
 * Type for package.json content
 */
interface PackageJson {
    workspaces?: string[];
}

/**
 * Gets the root directory of the project by traversing up until finding package.json
 * @returns {Promise<string>} The absolute path to the root directory
 * @throws {ProjectRootNotFound} If root directory cannot be found
 */
async function findRootDir(): Promise<string> {
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
        const pkgJsonPath = path.join(currentDir, "package.json");
        try {
            const stats = await fs.stat(pkgJsonPath);
            if (stats.isFile()) {
                const content = await fs.readFile(pkgJsonPath, "utf8");
                const pkg = JSON.parse(content) as PackageJson;
                // Check if this is the root package.json by looking for workspaces
                if (pkg.workspaces) {
                    return currentDir;
                }
            }
        } catch (err) {
            // Ignore errors and continue searching
        }
        currentDir = path.dirname(currentDir);
    }
    throw new ProjectRootNotFound();
}

/**
 * Main function to run the AI rules installation script.
 */
async function run(): Promise<void> {
    console.log("Starting AI Rules installation...");

    try {
        // Find the root directory first
        const outputPath = await findRootDir();
        console.log(`Using root directory: ${outputPath}`);

        // 1. Ask for confirmation if files might be overwritten
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
            console.error(String(error));
        }
        process.exit(1);
    }
}

/**
 * Type guard for NodeJS.ErrnoException
 */
function isNodeErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && "code" in error;
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

export { run };
