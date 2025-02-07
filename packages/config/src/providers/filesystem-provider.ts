import { access, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Config, ConfigSchema, FileOperation, InvalidJson } from "@ai-rules/types";

/**
 * Provider for reading/writing configurations from the local filesystem
 */
export class FileSystemProvider {
    /**
     * Creates a new FileSystemProvider instance
     * @param basePath - Base path for configuration files
     */
    constructor(private readonly basePath: string) {}

    /**
     * Read configuration from local file
     * @throws {InvalidJson} When the file contains invalid JSON
     * @throws {FileOperation} When file operations fail
     */
    async readConfig(fileName: string): Promise<Config> {
        const filePath = join(this.basePath, fileName);
        try {
            const content = await readFile(filePath, "utf-8");
            try {
                const parsed = JSON.parse(content);
                return ConfigSchema.parse(parsed);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    throw new InvalidJson(fileName);
                }
                throw error;
            }
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
