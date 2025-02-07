/**
 * Base configuration error class for all AI Rules errors
 */
export class ConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConfigurationError";
    }
}
