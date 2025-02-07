import { InvalidConfiguration } from "./base-configuration.js";

/**
 * Thrown when configuration validation fails
 */
export class InvalidValidation extends InvalidConfiguration {
    constructor(message: string) {
        super(`Configuration validation failed: ${message}`);
    }
}
