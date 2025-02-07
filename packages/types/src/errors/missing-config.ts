import { ConfigurationError } from "./base-configuration.js";

/**
 * Thrown when required configuration is missing
 */
export class MissingConfiguration extends ConfigurationError {
    constructor(field: string) {
        super(`Missing required configuration for "${field}".`);
    }
}
