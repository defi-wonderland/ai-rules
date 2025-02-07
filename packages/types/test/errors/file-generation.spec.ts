import { describe, expect, it } from "vitest";

import { InvalidConfiguration } from "../../src/errors/base-configuration.js";
import { FileGeneration } from "../../src/errors/file-generation.js";

describe("FileGeneration", () => {
    it("prefixes message with 'Failed to generate configuration files'", () => {
        const message = "Failed to write file";
        const error = new FileGeneration(message);

        expect(error.message).toBe("Failed to generate configuration files: Failed to write file");
        expect(error.name).toBe("InvalidConfiguration");
    });

    it("extends InvalidConfiguration", () => {
        const error = new FileGeneration("test");
        expect(error).toBeInstanceOf(FileGeneration);
        expect(error).toBeInstanceOf(InvalidConfiguration);
    });
});
