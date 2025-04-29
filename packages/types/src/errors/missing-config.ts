import { InvalidConfiguration } from "./base-configuration.js";

/**
 * Thrown when required configuration is missing
 */
export class MissingConfiguration extends InvalidConfiguration {
    constructor(field: string) {
        super(`Missing required configuration for "${field}".`);
    }
}
