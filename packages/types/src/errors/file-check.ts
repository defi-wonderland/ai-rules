/**
 * Thrown when a file check (existence or access) fails unexpectedly.
 */
export class FileCheck extends Error {
    public readonly fileName: string;
    public override readonly cause?: unknown;

    constructor(fileName: string, cause?: unknown) {
        super(`File check failed for: ${fileName}`);
        this.name = "FileCheck";
        this.fileName = fileName;
        this.cause = cause;
    }
}
