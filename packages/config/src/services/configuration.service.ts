import { Config } from "@ai-rules/types";

import { FileSystemProvider } from "../providers/filesystem-provider.js";

/**
 * Service for managing configuration files
 */
export class ConfigurationService {
    constructor(private readonly provider: FileSystemProvider) {}

    /**
     * Create a new ConfigurationService instance
     */
    static async create(basePath: string): Promise<ConfigurationService> {
        const provider = new FileSystemProvider(basePath);
        return new ConfigurationService(provider);
    }

    /**
     * Read configuration from file
     */
    async readConfig(fileName: string): Promise<Config> {
        return this.provider.readConfig(fileName);
    }

    /**
     * Write configuration to file
     */
    async writeConfig(fileName: string, config: Config): Promise<void> {
        await this.provider.writeConfig(fileName, config);
    }

    /**
     * Check if configuration exists
     */
    async hasConfig(fileName: string): Promise<boolean> {
        return this.provider.exists(fileName);
    }
}
