import { access, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Config } from "@ai-rules/types";

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
     */
    async readConfig(fileName: string): Promise<Config> {
        const filePath = join(this.basePath, fileName);
        const content = await readFile(filePath, "utf-8");
        return JSON.parse(content) as Config;
    }

    /**
     * Write configuration to local file
     */
    async writeConfig(fileName: string, config: Config): Promise<void> {
        const filePath = join(this.basePath, fileName);
        await writeFile(filePath, JSON.stringify(config, null, 2));
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
