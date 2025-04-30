import * as fs from "fs/promises";
import * as path from "path";
import type { Config } from "@ai-rules/types";
import { reactRules, solidityRules, typescriptRules } from "@ai-rules/config";
import { CodeRabbitConfig, DefaultCodeRabbitConfig } from "@ai-rules/types";
import * as yaml from "yaml";

/**
 * Generator class for creating configuration files from templates
 */
export class TemplateGenerator {
    private readonly config: Config;
    private readonly outputPath: string;

    /**
     * Creates a new TemplateGenerator instance
     * @param config The configuration to use for generation
     * @param outputPath The base output path for generated files
     */
    constructor(config: Config, outputPath: string) {
        this.config = config;
        this.outputPath = outputPath;
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
                const fileVersion = parsedConfig.version || "0.0.0";
                return this.compareVersions(this.config.version, fileVersion) > 0;
            }

            // For .mdc files, always overwrite to ensure latest rules
            if (filePath.endsWith(".mdc")) {
                return true;
            }

            return false;
        } catch (error) {
            // If file doesn't exist or can't be read, we should write it
            return true;
        }
    }

    /**
     * Compare two semantic versions
     *
     * Note: This function expects versions in the format 'x.y.z'.
     *
     * @param version1 First version
     * @param version2 Second version
     * @returns number Positive if version1 > version2, negative if version1 < version2, 0 if equal
     * @private
     */
    private compareVersions(version1: string, version2: string): number {
        const v1Parts = version1.split(".").map(Number);
        const v2Parts = version2.split(".").map(Number);

        for (let i = 0; i < 3; i++) {
            const diff = (v1Parts[i] || 0) - (v2Parts[i] || 0);
            if (diff !== 0) return diff;
        }

        return 0;
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

            const writePromises = set.rules.map((rule) => {
                const filePath = `.cursor/rules/${set.teamFolder}/${rule.name}.mdc`;
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
