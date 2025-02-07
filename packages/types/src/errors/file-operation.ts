import { InvalidConfiguration } from "./base-configuration.js";

/**
 * Thrown when a file operation (read/write) fails
 */
export class FileOperation extends InvalidConfiguration {
    constructor(operation: "read" | "write", fileName: string, reason: string) {
        super(`Failed to ${operation} configuration file "${fileName}": ${reason}`);
    }
}
