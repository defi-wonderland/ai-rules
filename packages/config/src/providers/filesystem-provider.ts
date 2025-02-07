import { access, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Config, ConfigSchema, FileOperation, InvalidJson } from "@ai-rules/types";

import { IConfigProvider } from "../interfaces/index.js";

/**
 * Provider for reading/writing configurations from the local filesystem.
 * This provider should be instantiated through ConfigurationService.
 * Direct instantiation is only allowed for testing purposes.
 *
 * @example
 * ```typescript
 * // Preferred way (through service)
 * const service = await ConfigurationService.create("/path/to/config");
 *
 * // Direct instantiation (testing only)
 * const provider = await FileSystemProvider.create("/path/to/config");
 * ```
 */
export class FileSystemProvider implements IConfigProvider {
    /**
     * Protected constructor to allow testing while enforcing factory method usage in production.
     * @internal
     */
    protected constructor(private readonly basePath: string) {}

    /**
     * Creates a new FileSystemProvider instance.
     * This is the preferred way to instantiate the provider directly (testing only).
     *
     * @param basePath - Base path for configuration files
     * @returns A new FileSystemProvider instance
     */
    static async create(basePath: string): Promise<FileSystemProvider> {
        return new FileSystemProvider(basePath);
    }

    /**
     * Parse and validate configuration content
     * @throws {InvalidJson} When the content is not valid JSON
     * @throws {ValidationError} When the content doesn't match the config schema
     */
    private parseConfig(content: string, fileName: string): Config {
        try {
            const parsed = JSON.parse(content) as unknown;
            return ConfigSchema.parse(parsed);
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new InvalidJson(fileName);
            }
            throw error;
        }
    }

    /**
     * Read configuration from local file
     * @throws {InvalidJson} When the file contains invalid JSON
     * @throws {FileOperation} When file operations fail
     */
    async readConfig(fileName: string): Promise<Config> {
        const filePath = join(this.basePath, fileName);
        try {
            const content = await readFile(filePath, "utf-8");
            return this.parseConfig(content, fileName);
        } catch (error) {
            if (error instanceof InvalidJson) {
                throw error;
            }
            throw new FileOperation(
                "read",
                fileName,
                error instanceof Error ? error.message : "unknown error",
            );
        }
    }

    /**
     * Write configuration to local file
     * @throws {FileOperation} When file operations fail
     */
    async writeConfig(fileName: string, config: Config): Promise<void> {
        const filePath = join(this.basePath, fileName);
        try {
            await writeFile(filePath, JSON.stringify(config, null, 2));
        } catch (error) {
            throw new FileOperation(
                "write",
                fileName,
                error instanceof Error ? error.message : "unknown error",
            );
        }
    }

    /**
     * Check if configuration file exists
     */
    async exists(fileName: string): Promise<boolean> {
        try {
            await access(join(this.basePath, fileName));
            return true;
        } catch {
            return false;
        }
    }
}
