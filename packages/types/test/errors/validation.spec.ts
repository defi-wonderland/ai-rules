import { describe, expect, it } from "vitest";

import { InvalidConfiguration } from "../../src/errors/base-configuration.js";
import { InvalidValidation } from "../../src/errors/validation.js";

describe("InvalidValidation", () => {
    it("creates an error with the correct message", () => {
        const message = "Invalid configuration";
        const error = new InvalidValidation(message);

        expect(error.message).toBe("Configuration validation failed: Invalid configuration");
        expect(error.name).toBe("InvalidConfiguration");
    });

    it("extends InvalidConfiguration", () => {
        const error = new InvalidValidation("test");
        expect(error).toBeInstanceOf(InvalidValidation);
        expect(error).toBeInstanceOf(InvalidConfiguration);
    });
});
