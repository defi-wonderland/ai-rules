import * as fs from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";

import type { Config } from "../schemas/config.js";
import { CodeRabbitConfig, DefaultCodeRabbitConfig } from "../schemas/config.js";
import { reactRules, solidityRules, typescriptRules } from "../templates/cursor/index.js";
import { compareVersions } from "../utils/version-utils.js";

/**
 * Generator class for creating configuration files from templates
 */
export class TemplateGenerator {
    private readonly config: Config;
    private readonly outputPath: string;
    private readonly managedRulePaths: Set<string> = new Set();

    /**
     * Creates a new TemplateGenerator instance
     * @param config The configuration to use for generation
     * @param outputPath The base output path for generated files
     */
    constructor(config: Config, outputPath: string) {
        this.config = config;
        this.outputPath = outputPath;
        this.initManagedRulePaths();
    }

    /**
     * Initialize the set of rule file paths that we manage
     * @private
     */
    private initManagedRulePaths(): void {
        const ruleSets = [
            {
                rules: typescriptRules,
                teamFolder: "Offchain",
                applies: this.config.teams.includes("offchain"),
            },
            {
                rules: reactRules,
                teamFolder: "UI",
                applies: this.config.teams.includes("ui"),
            },
            {
                rules: solidityRules,
                teamFolder: "Solidity",
                applies: this.config.teams.includes("solidity"),
            },
        ];

        for (const set of ruleSets) {
            if (!set.applies) continue;

            for (const rule of set.rules) {
                const filePath = `.cursor/rules/${set.teamFolder}/${rule.name}.mdc`;
                this.managedRulePaths.add(filePath);
            }
        }
    }

    /**
     * Generates all configuration files
     * @returns Promise<void>
     */
    async generateAll(): Promise<void> {
        await Promise.all([this.generateCodeRabbitConfig(), this.generateCursorRules()]);
    }

    /**
     * Checks if a file exists and compares its version with current
     * @param filePath Path to the file
     * @returns Promise<boolean> True if file should be overwritten
     * @private
     */
    private async shouldOverwrite(filePath: string): Promise<boolean> {
        try {
            const fullPath = path.join(this.outputPath, filePath);
            const stats = await fs.stat(fullPath);

            if (!stats.isFile()) {
                return true;
            }

            // For .coderabbit.yaml, check version in the file against instance version
            if (filePath === ".coderabbit.yaml") {
                const content = await fs.readFile(fullPath, "utf8");
                const parsedConfig = yaml.parse(content) as { version?: string };
                const fileVersion = parsedConfig.version;
                return compareVersions(this.config.version, fileVersion) > 0;
            }

            // For .mdc files, only overwrite ones that we manage AND have an older version
            if (filePath.endsWith(".mdc")) {
                // If we don't manage this file, don't overwrite it
                if (!this.managedRulePaths.has(filePath)) {
                    return false;
                }

                // If we manage this file, check its version before overwriting
                try {
                    const content = await fs.readFile(fullPath, "utf8");
                    // Extract version from content using a regex to find the version field
                    const versionMatch = /version:\s*([0-9.]+)/i.exec(content);
                    if (versionMatch && versionMatch[1]) {
                        const fileVersion = versionMatch[1];
                        return compareVersions(this.config.version, fileVersion) > 0;
                    }
                } catch (err) {
                    // If we can't read or parse the file, better safe than sorry - don't overwrite
                    return false;
                }
            }

            return false;
        } catch (error) {
            // If file doesn't exist or can't be read, we should write it
            return true;
        }
    }

    /**
     * Generates the CodeRabbit configuration file
     * @returns Promise<void>
     * @private
     */
    private async generateCodeRabbitConfig(): Promise<void> {
        const filePath = ".coderabbit.yaml";
        const currentVersion = this.config.version;

        if (!(await this.shouldOverwrite(filePath))) {
            return;
        }

        const config: CodeRabbitConfig = {
            ...(this.config.coderabbit ?? DefaultCodeRabbitConfig),
        };

        const yamlContent = yaml.stringify({
            ...config,
            version: currentVersion,
        });
        await this.writeFile(filePath, yamlContent);
    }

    /**
     * Generates Cursor rule files in team-specific subdirectories
     * Only overwrites files that match our managed rule set (preserves custom rules)
     * @returns Promise<void>
     * @private
     */
    private async generateCursorRules(): Promise<void> {
        const currentVersion = this.config.version;
        const ruleSets = [
            {
                rules: typescriptRules,
                teamFolder: "Offchain",
                applies: this.config.teams.includes("offchain"),
            },
            {
                rules: reactRules,
                teamFolder: "UI",
                applies: this.config.teams.includes("ui"),
            },
            {
                rules: solidityRules,
                teamFolder: "Solidity",
                applies: this.config.teams.includes("solidity"),
            },
        ];

        for (const set of ruleSets) {
            if (!set.applies) continue;

            const writePromises = set.rules.map(async (rule) => {
                const filePath = `.cursor/rules/${set.teamFolder}/${rule.name}.mdc`;

                // Skip if we shouldn't overwrite this file
                if (!(await this.shouldOverwrite(filePath))) {
                    return;
                }

                const content = `---
description: ${rule.description}
globs: ${Array.isArray(rule.globs) ? rule.globs.join(", ") : rule.globs}
version: ${currentVersion}
---

${rule.content}`;
                return this.writeFile(filePath, content);
            });

            await Promise.all(writePromises);
        }
    }

    /**
     * Writes content to a file, creating directories if needed
     * @param relativePath The path relative to the output directory
     * @param content The content to write
     * @returns Promise<void>
     * @private
     */
    private async writeFile(relativePath: string, content: string): Promise<void> {
        const fullPath = path.join(this.outputPath, relativePath);
        const directory = path.dirname(fullPath);

        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(fullPath, content, "utf8");
    }
}
