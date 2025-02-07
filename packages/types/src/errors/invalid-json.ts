import { InvalidConfiguration } from "./base-configuration.js";

/**
 * Thrown when a configuration file contains invalid JSON
 */
export class InvalidJson extends InvalidConfiguration {
    constructor(fileName: string) {
        super(`Invalid JSON in configuration file: ${fileName}`);
    }
}
