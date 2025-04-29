import { baseConfig } from "@ai-rules/config";
import { Config, OffchainLanguageConfig, SolidityConfig, TeamType } from "@ai-rules/types";

/**
 * Builder class for assembling AI rule configurations
 */
export class ConfigBuilder {
    private config: Config;

    /**
     * Creates a new ConfigBuilder instance with base configuration
     */
    constructor() {
        this.config = { ...baseConfig };
    }

    /**
     * Adds a team to the configuration
     * @param team The team type to add
     * @returns this for method chaining
     */
    addTeam(team: TeamType): ConfigBuilder {
        if (!this.config.teams.includes(team)) {
            this.config.teams.push(team);
        }
        return this;
    }

    /**
     * Adds Solidity-specific configuration
     * @param config The Solidity configuration to add
     * @returns this for method chaining
     */
    addSolidityConfig(config: SolidityConfig): ConfigBuilder {
        this.config.solidity = config;
        return this;
    }

    /**
     * Adds Offchain-specific configuration
     * @param config The Offchain configuration to add
     * @returns this for method chaining
     */
    addOffchainConfig(config: OffchainLanguageConfig): ConfigBuilder {
        this.config.typescript = config;
        return this;
    }

    /**
     * Builds and returns the final configuration
     * @returns The complete configuration object
     */
    build(): Config {
        return this.config;
    }
}
