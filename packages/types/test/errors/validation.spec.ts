import { describe, expect, it } from "vitest";

import { ConfigurationError } from "../../src/errors/base-configuration.js";
import { ValidationError } from "../../src/errors/validation.js";

describe("ValidationError", () => {
    it("creates an error with the correct message", () => {
        const message = "Invalid configuration";
        const error = new ValidationError(message);

        expect(error.message).toBe("Configuration validation failed: Invalid configuration");
        expect(error.name).toBe("ConfigurationError");
    });

    it("extends ConfigurationError", () => {
        const error = new ValidationError("test");
        expect(error).toBeInstanceOf(ValidationError);
        expect(error).toBeInstanceOf(ConfigurationError);
    });
});
