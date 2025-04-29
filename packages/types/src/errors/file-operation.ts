import { InvalidConfiguration } from "./base-configuration.js";

/**
 * Thrown when a file operation (read/write) fails
 */
export class FileOperation extends InvalidConfiguration {
    /**
     * The underlying cause of the file operation error
     * @override
     */
    public override readonly cause?: unknown;

    /**
     * Creates a new FileOperation error
     * @param operation - The type of operation that failed
     * @param fileName - The name of the file that caused the error
     * @param reason - The reason for the failure
     * @param cause - The original error that caused this error
     */
    constructor(operation: "read" | "write", fileName: string, reason: string, cause?: unknown) {
        super(`Failed to ${operation} configuration file "${fileName}": ${reason}`);
        this.cause = cause;
    }
}
