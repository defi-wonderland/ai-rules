import * as fs from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";
import { z, ZodArray, ZodDefault, ZodObject, ZodOptional, ZodType, ZodTypeAny } from "zod";

import type { Config } from "../schemas/config.js";
import type { VersionType } from "../utils/index.js";
import { CodeRabbitConfig, ConfigSchema, DefaultCodeRabbitConfig } from "../schemas/index.js";
import { reactRules, solidityRules, typescriptRules } from "../templates/cursor/index.js";
import { compareVersions } from "../utils/index.js";

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
                return (
                    compareVersions(
                        this.config.version as VersionType,
                        fileVersion as VersionType | undefined,
                    ) > 0
                );
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
                        return (
                            compareVersions(
                                this.config.version as VersionType,
                                fileVersion as VersionType,
                            ) > 0
                        );
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

        const dataForYaml = {
            version: currentVersion,
            ...(this.config.coderabbit ?? DefaultCodeRabbitConfig),
        };

        // Define a schema for the YAML structure, including the version field
        // This ensures comments can be generated for the version field as well.
        const versionFieldSchema = z.string().describe("Configuration file version.");
        const coderabbitObjectSchema = ConfigSchema.shape.coderabbit;
        let schemaForYaml: ZodObject<Record<string, ZodType<unknown>>, "strip", ZodTypeAny>;

        if (coderabbitObjectSchema instanceof ZodObject) {
            schemaForYaml = z.object({
                version: versionFieldSchema,
                ...coderabbitObjectSchema.shape,
            }) as ZodObject<Record<string, ZodType<unknown>>, "strip", ZodTypeAny>;
        } else {
            // Fallback if CodeRabbit schema is not an object (e.g. optional or default)
            // This case might need specific handling based on actual ConfigSchema structure
            // For now, creating a simple schema, assuming CodeRabbit itself is an object schema effectively
            const unwrappedCoderabbitSchema = this.safelyGetInnerSchema(coderabbitObjectSchema);
            if (unwrappedCoderabbitSchema instanceof ZodObject) {
                schemaForYaml = z.object({
                    version: versionFieldSchema,
                    ...unwrappedCoderabbitSchema.shape,
                }) as ZodObject<Record<string, ZodType<unknown>>, "strip", ZodTypeAny>;
            } else {
                // This should never happen if DefaultCodeRabbitConfig is an object
                // and CodeRabbit in ConfigSchema is z.object(...).default(...)
                console.warn(
                    "Could not construct extended schema for .coderabbit.yaml with version. Defaulting to CodeRabbit schema only for comments.",
                );
                // Minimal schema if unwrapping fails
                schemaForYaml = z.object({ version: versionFieldSchema }) as ZodObject<
                    Record<string, ZodType<unknown>>,
                    "strip",
                    ZodTypeAny
                >;
            }
        }

        const yamlContent = this.generateDirectYamlWithComments(
            dataForYaml, // Pass the combined data
            currentVersion, // Still needed for the header comment
            schemaForYaml, // Pass the schema that includes the version
        );

        await this.writeFile(filePath, yamlContent);
    }

    /**
     * Generates a YAML string with comments directly using the yaml library's AST.
     * @param config The CodeRabbit configuration object (without version)
     * @param configVersion The version string for the header
     * @param schema The Zod schema used to extract descriptions
     * @returns A formatted YAML string with comments
     */
    private generateDirectYamlWithComments(
        config: CodeRabbitConfig & { version: string },
        configVersion: string,
        schema?: ZodType<unknown>,
    ): string {
        const doc = new yaml.Document();

        doc.commentBefore = ` AI Rules configuration file - version ${configVersion}`;

        const innerSchema = this.safelyGetInnerSchema(schema);
        doc.contents = this.buildYamlNode(config, innerSchema);

        // Get the basic YAML without field comments
        const basicYaml = doc.toString({ lineWidth: 0, singleQuote: false });

        // Now manually add field-level comments using injectFieldComments
        // Provide a fallback empty object schema if none is available
        const effectiveSchema = schema || innerSchema || z.object({});
        return this.injectFieldComments(basicYaml, config, effectiveSchema);
    }

    /**
     * Injects field-level comments above all fields (including nested) in the YAML string using Zod schema descriptions.
     */
    private injectFieldComments(
        yamlString: string,
        config: unknown,
        schema: ZodType<unknown>,
        indentLevel = 0,
    ): string {
        const lines = yamlString.split("\n");
        const resultLines: string[] = [];
        const indent = "  ".repeat(indentLevel);
        const innerSchema = this.safelyGetInnerSchema(schema);
        const isObject = (val: unknown): val is Record<string, unknown> =>
            typeof val === "object" && val !== null && !Array.isArray(val);

        const getFieldDescriptions = (
            obj: unknown,
            sch: ZodType<unknown>,
        ): Record<string, string> => {
            const descs: Record<string, string> = {};
            const unwrappedSchema = this.safelyGetInnerSchema(sch);
            if (unwrappedSchema instanceof ZodObject && isObject(obj)) {
                for (const key of Object.keys(obj)) {
                    const desc = this.getDescription(key, unwrappedSchema);
                    if (desc) descs[key] = desc;
                }
            }
            return descs;
        };

        const fieldDescriptions = getFieldDescriptions(config, schema);
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            if (typeof line === "string") {
                const fieldMatch = new RegExp(`^${indent}("?[^":]+"?):`).exec(line);
                const rawKey =
                    fieldMatch && typeof fieldMatch[1] === "string"
                        ? fieldMatch[1].replace(/"/g, "")
                        : undefined;
                const fieldName = rawKey;
                if (
                    fieldName &&
                    Object.prototype.hasOwnProperty.call(fieldDescriptions, fieldName)
                ) {
                    const description = fieldDescriptions[fieldName];
                    resultLines.push(`${indent}# ${description}`);
                }
                resultLines.push(line);

                // If this field is an object or array, recursively process its block
                if (fieldName && isObject(config)) {
                    const value = config[fieldName];
                    let fieldSchema: ZodType<unknown> | undefined;
                    if (innerSchema instanceof ZodObject) {
                        const shape = innerSchema.shape as Record<string, ZodType<unknown>>;
                        fieldSchema = shape[fieldName];
                    }
                    const actualFieldSchema = this.safelyGetInnerSchema(fieldSchema);
                    if (isObject(value) && actualFieldSchema) {
                        // Find the block of lines for this object
                        let j = i + 1;
                        const childIndent = indent + "  ";
                        while (
                            j < lines.length &&
                            typeof lines[j] === "string" &&
                            (lines[j]!.startsWith(childIndent) || lines[j]!.trim() === "")
                        ) {
                            j++;
                        }
                        const childBlock = lines.slice(i + 1, j).join("\n");
                        const commentedChild = this.injectFieldComments(
                            childBlock,
                            value,
                            actualFieldSchema,
                            indentLevel + 1,
                        );
                        if (childBlock.length > 0) {
                            resultLines.push(commentedChild);
                        }
                        i = j - 1;
                    }
                }
            }
            i++;
        }
        return resultLines.join("\n");
    }

    /**
     * Recursively builds YAML nodes (Scalar, YAMLMap, YAMLSeq) from data and its Zod schema.
     * @param currentData The current data segment (primitive, object, or array).
     * @param currentZodSchema The Zod schema for the current data segment.
     * @returns A yaml.Node representing the data.
     */
    private buildYamlNode(currentData: unknown, currentZodSchema?: ZodType<unknown>): yaml.Node {
        // Handle primitives
        if (
            currentData === null ||
            (typeof currentData !== "object" && !Array.isArray(currentData))
        ) {
            return new yaml.Scalar(currentData);
        }

        // Handle arrays
        if (Array.isArray(currentData)) {
            const seq = new yaml.YAMLSeq();
            const itemSchema =
                currentZodSchema instanceof ZodArray
                    ? (currentZodSchema.element as ZodType<unknown>)
                    : undefined;
            currentData.forEach((item) => {
                seq.add(this.buildYamlNode(item, itemSchema));
            });
            return seq;
        }

        // Handle objects
        const map = new yaml.YAMLMap();
        if (typeof currentData === "object" && currentData !== null) {
            const dataAsRecord = currentData as Record<string, unknown>;
            for (const [key, value] of Object.entries(dataAsRecord)) {
                // Pass currentZodSchema directly; getDescription will unwrap and check type
                const fieldDescription = this.getDescription(key, currentZodSchema);

                let fieldSchemaForValue: ZodType<unknown> | undefined;
                if (currentZodSchema instanceof ZodObject) {
                    const shape = currentZodSchema.shape as Record<string, ZodType<unknown>>;
                    fieldSchemaForValue = shape[key];
                }
                const actualFieldSchema = this.safelyGetInnerSchema(fieldSchemaForValue);

                const valueNode = this.buildYamlNode(value, actualFieldSchema);
                const pair = new yaml.Pair(key, valueNode);

                // Add field description as comment
                if (fieldDescription) {
                    (pair as unknown as { commentBefore: string }).commentBefore =
                        fieldDescription.trim();
                }
                map.items.push(pair);
            }
        }
        return map;
    }

    /**
     * Helper to safely get an inner schema
     * @param s The schema to unwrap
     * @returns The inner schema if wrapped, otherwise the original schema
     */
    private safelyGetInnerSchema = <T>(s?: ZodType<T>): ZodType<T> | undefined => {
        if (!s) return undefined;

        let schema = s;
        // Unwrap nested ZodDefault/ZodOptional schemas
        while (schema instanceof ZodDefault || schema instanceof ZodOptional) {
            schema = schema._def.innerType as ZodType<T>;
        }
        return schema;
    };

    /**
     * Gets the description from a schema field
     * @param fieldName The field name to get the description for
     * @param parentSchema The parent schema containing the field
     * @returns The field description if found
     */
    private getDescription = (
        fieldName: string,
        parentSchema?: ZodType<unknown>,
    ): string | undefined => {
        // Safely get the innermost schema, unwrapping ZodDefault/ZodOptional
        const actualSchema = this.safelyGetInnerSchema(parentSchema);

        if (!actualSchema || !(actualSchema instanceof ZodObject)) {
            return undefined;
        }

        const shape = actualSchema.shape as Record<string, ZodType<unknown>>;
        const fieldSchema = shape[fieldName];

        if (!fieldSchema) return undefined;

        // Try to get description from the field schema itself
        const schemaWithDesc = fieldSchema as unknown as { description?: string };
        if (schemaWithDesc.description) {
            return schemaWithDesc.description;
        }

        // If no direct description, check if it's wrapped and get description from inner schema
        if (fieldSchema instanceof ZodDefault || fieldSchema instanceof ZodOptional) {
            const innerType = this.safelyGetInnerSchema(fieldSchema);
            if (innerType) {
                const innerWithDesc = innerType as unknown as { description?: string };
                if (innerWithDesc.description) {
                    return innerWithDesc.description;
                }
            }
        }

        return undefined;
    };

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
