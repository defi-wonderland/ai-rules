/**
 * Base configuration error class for all AI Rules errors
 */
export class InvalidConfiguration extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidConfiguration";
    }
}
