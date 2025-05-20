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
 * Thrown when `ai-rules` cannot locate the project root.
 *
 * The search walks up the directory tree looking for, in order of preference:
 * 1. A `pnpm-workspace.yaml` file.
 * 2. A `package.json` file with a "workspaces" field.
 * 3. A `package.json` file with a "name" field (as a fallback for single package projects).
 */
class ProjectRootNotFound extends Error {
    constructor(message: string = "Could not find project root directory") {
        super(message);
        this.name = "ProjectRootNotFound";
    }
}

/**
 * Type for package.json content
 */
interface PackageJson {
    // Allow object form for workspaces
    workspaces?: string[] | Record<string, unknown>;
    // Add name field for single package check
    name?: string;
}

/**
 * Gets the root directory of the project by traversing up until finding a root indicator.
 * Root indicators, in order of preference:
 * 1. pnpm-workspace.yaml file
 * 2. package.json with a "workspaces" field
 * Fallback: Uses the path of the first package.json with a "name" field found during upward traversal,
 * if no primary root indicators are found.
 * @returns {Promise<string>} The absolute path to the root directory
 * @throws {ProjectRootNotFound} If root directory cannot be found
 */
async function findRootDir(): Promise<string> {
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;
    let candidateSinglePackageRoot: string | null = null;

    do {
        // 1. Check for pnpm-workspace.yaml
        const pnpmWorkspacePath = path.join(currentDir, "pnpm-workspace.yaml");
        try {
            const pnpmStats = await fs.stat(pnpmWorkspacePath);
            if (pnpmStats.isFile()) {
                return currentDir; // Found root via pnpm-workspace.yaml
            }
        } catch (err) {
            // Ignore if pnpm-workspace.yaml doesn't exist or other errors
        }

        // 2. Check for package.json
        const pkgJsonPath = path.join(currentDir, "package.json");
        try {
            const stats = await fs.stat(pkgJsonPath);
            if (stats.isFile()) {
                const content = await fs.readFile(pkgJsonPath, "utf8");
                const pkg = JSON.parse(content) as PackageJson;

                // Check for workspaces field
                if (
                    pkg.workspaces &&
                    (Array.isArray(pkg.workspaces) || typeof pkg.workspaces === "object")
                ) {
                    return currentDir; // Found root via package.json with workspaces
                }

                // If it has a name field and we haven't found a candidate yet, store it.
                // This will be the one closest to process.cwd().
                if (pkg.name && candidateSinglePackageRoot === null) {
                    candidateSinglePackageRoot = currentDir;
                }
            }
        } catch (err) {
            // Ignore errors (e.g., file not found, JSON parse error) and continue searching
        }

        if (currentDir === root) {
            break;
        }
        currentDir = path.dirname(currentDir);
    } while (true);

    // After loop, check if we found a candidate for single package root
    if (candidateSinglePackageRoot) {
        return candidateSinglePackageRoot;
    }

    throw new ProjectRootNotFound(
        "Could not find project root. Looked for pnpm-workspace.yaml, package.json with 'workspaces', or package.json with 'name'.",
    );
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
 * Type guard for NodeJS.ErrnoException that ensures both:
 * 1. The error is an instance of Error
 * 2. The error has a 'code' property of type string
 */
function isNodeErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
    return (
        error instanceof Error &&
        Object.hasOwn(error, "code") &&
        typeof (error as NodeJS.ErrnoException).code === "string"
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

export { run, findRootDir };
