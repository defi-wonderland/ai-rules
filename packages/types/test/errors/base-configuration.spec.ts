import { describe, expect, it } from "vitest";

import { InvalidConfiguration } from "../../src/errors/base-configuration.js";

describe("InvalidConfiguration", () => {
    it("constructs with custom message and ConfigurationError name", () => {
        const message = "Test error message";
        const error = new InvalidConfiguration(message);

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(message);
        expect(error.name).toBe("InvalidConfiguration");
    });

    it("inherits from Error class while preserving custom type", () => {
        const error = new InvalidConfiguration("test");
        expect(error).toBeInstanceOf(InvalidConfiguration);
        expect(error).toBeInstanceOf(Error);
    });
});
