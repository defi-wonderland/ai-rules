import { describe, expect, it } from "vitest";

import { ConfigurationError } from "../../src/errors/base-configuration.js";

describe("ConfigurationError", () => {
    it("creates an error with the correct message", () => {
        const message = "Test error message";
        const error = new ConfigurationError(message);

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(message);
        expect(error.name).toBe("ConfigurationError");
    });

    it("maintains prototype chain", () => {
        const error = new ConfigurationError("test");
        expect(error).toBeInstanceOf(ConfigurationError);
        expect(error).toBeInstanceOf(Error);
    });
});
