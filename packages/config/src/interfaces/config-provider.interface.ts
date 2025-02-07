import { Config } from "@ai-rules/types";

/**
 * Interface for configuration providers.
 * Implementations handle reading and writing configurations from different sources.
 */
export interface IConfigProvider {
    /**
     * Read configuration from source
     * @param fileName - Name of the configuration file
     * @returns Parsed configuration object
     * @throws When reading or parsing fails
     */
    readConfig(fileName: string): Promise<Config>;

    /**
     * Write configuration to source
     * @param fileName - Name of the configuration file
     * @param config - Configuration to write
     * @throws When writing fails
     */
    writeConfig(fileName: string, config: Config): Promise<void>;

    /**
     * Check if configuration exists
     * @param fileName - Name of the configuration file
     * @returns True if configuration exists, false otherwise
     */
    exists(fileName: string): Promise<boolean>;
}
