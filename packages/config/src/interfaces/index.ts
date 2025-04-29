import { Config } from "@ai-rules/types";

/**
 * Interface defining the contract for configuration providers.
 * Providers are responsible for reading and writing configuration data
 * from a specific source (e.g., filesystem, GitHub).
 */
export interface IConfigProvider {
    /**
     * Reads the configuration from the specified source.
     * @param identifier - A unique identifier for the configuration (e.g., file name).
     * @returns A promise resolving to the configuration object.
     * @throws {FileOperation | InvalidJson | Error} If reading or parsing fails.
     */
    readConfig(identifier: string): Promise<Config>;

    /**
     * Writes the configuration to the specified source.
     * @param identifier - A unique identifier for the configuration (e.g., file name).
     * @param config - The configuration object to write.
     * @returns A promise resolving when the write operation is complete.
     * @throws {FileOperation | Error} If writing fails.
     */
    writeConfig(identifier: string, config: Config): Promise<void>;

    /**
     * Checks if the configuration exists at the specified source.
     * @param identifier - A unique identifier for the configuration (e.g., file name).
     * @returns A promise resolving to true if the configuration exists, false otherwise.
     */
    exists(identifier: string): Promise<boolean>;
}
