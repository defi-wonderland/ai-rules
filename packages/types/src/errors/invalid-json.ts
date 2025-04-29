import { InvalidConfiguration } from "./base-configuration.js";

/**
 * Thrown when JSON parsing fails
 */
export class InvalidJson extends InvalidConfiguration {
    constructor(fileName: string, cause?: unknown) {
        super(`Invalid JSON in configuration file "${fileName}"`);
        this.cause = cause;
    }
}
