import { InvalidConfiguration } from "./base-configuration.js";

/**
 * Thrown when file generation fails
 */
export class FileGeneration extends InvalidConfiguration {
    constructor(message: string) {
        super(`Failed to generate configuration files: ${message}`);
    }
}
