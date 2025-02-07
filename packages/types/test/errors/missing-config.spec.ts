import { describe, expect, it } from "vitest";

import { InvalidConfiguration } from "../../src/errors/base-configuration.js";
import { MissingConfiguration } from "../../src/errors/missing-config.js";

describe("MissingConfiguration", () => {
    it("creates an error with the correct message including the field name", () => {
        const field = "testField";
        const error = new MissingConfiguration(field);

        expect(error.message).toBe('Missing required configuration for "testField".');
        expect(error.name).toBe("InvalidConfiguration");
    });

    it("extends InvalidConfiguration", () => {
        const error = new MissingConfiguration("test");
        expect(error).toBeInstanceOf(MissingConfiguration);
        expect(error).toBeInstanceOf(InvalidConfiguration);
    });
});
