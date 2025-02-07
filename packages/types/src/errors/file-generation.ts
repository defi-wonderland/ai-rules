import { ConfigurationError } from "./base-configuration.js";

/**
 * Thrown when file generation fails
 */
export class FileGeneration extends ConfigurationError {
    constructor(message: string) {
        super(`Failed to generate configuration files: ${message}`);
    }
}
