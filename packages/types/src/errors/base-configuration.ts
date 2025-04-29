/**
 * Base class for configuration-related errors
 */
export class InvalidConfiguration extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}
