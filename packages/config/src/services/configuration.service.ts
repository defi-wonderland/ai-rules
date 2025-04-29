import { Config } from "@ai-rules/types";

import { IConfigProvider } from "../interfaces/index.js";
import { FileSystemProvider } from "../providers/filesystem-provider.js";

/**
 * Service for managing configuration files.
 * Use the static `create` method to instantiate this service.
 *
 * @example
 * ```typescript
 * const service = await ConfigurationService.create("/path/to/config");
 * const config = await service.readConfig("config.json");
 * ```
 */
export class ConfigurationService {
    /**
     * Constructor for dependency injection.
     * For production use, prefer the static `create` method.
     */
    constructor(private readonly provider: IConfigProvider) {}

    /**
     * Creates a new ConfigurationService instance.
     * This is the preferred way to instantiate the service.
     *
     * @param basePath - Base path for configuration files
     * @returns A new ConfigurationService instance
     */
    static async create(basePath: string): Promise<ConfigurationService> {
        const provider = await FileSystemProvider.create(basePath);
        return new ConfigurationService(provider);
    }

    /**
     * Read configuration from file
     * @param fileName - Name of the configuration file
     * @returns The parsed configuration
     */
    async readConfig(fileName: string): Promise<Config> {
        return this.provider.readConfig(fileName);
    }

    /**
     * Write configuration to file
     * @param fileName - Name of the configuration file
     * @param config - Configuration to write
     */
    async writeConfig(fileName: string, config: Config): Promise<void> {
        await this.provider.writeConfig(fileName, config);
    }

    /**
     * Check if configuration exists
     * @param fileName - Name of the configuration file
     * @returns True if the configuration file exists
     */
    async hasConfig(fileName: string): Promise<boolean> {
        return this.provider.exists(fileName);
    }
}
