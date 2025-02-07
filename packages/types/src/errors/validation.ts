import { ConfigurationError } from "./base-configuration.js";

/**
 * Thrown when configuration validation fails
 */
export class ValidationError extends ConfigurationError {
    constructor(message: string) {
        super(`Configuration validation failed: ${message}`);
    }
}
