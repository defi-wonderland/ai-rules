import { describe, expect, it } from "vitest";

import { ConfigurationError } from "../../src/errors/base-configuration.js";
import { FileGeneration } from "../../src/errors/file-generation.js";

describe("FileGeneration", () => {
    it("creates an error with the correct message", () => {
        const message = "Failed to write file";
        const error = new FileGeneration(message);

        expect(error.message).toBe("Failed to generate configuration files: Failed to write file");
        expect(error.name).toBe("ConfigurationError");
    });

    it("extends ConfigurationError", () => {
        const error = new FileGeneration("test");
        expect(error).toBeInstanceOf(FileGeneration);
        expect(error).toBeInstanceOf(ConfigurationError);
    });
});
