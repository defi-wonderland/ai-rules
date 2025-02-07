import { describe, expect, it } from "vitest";

import { InvalidJson } from "../../src/errors/invalid-json.js";

describe("InvalidJson", () => {
    it("creates InvalidJson error with correct message", () => {
        const fileName = "config.json";
        const error = new InvalidJson(fileName);

        expect(error.message).toBe("Invalid JSON in configuration file: config.json");
        expect(error.name).toBe("InvalidConfiguration");
        expect(error).toBeInstanceOf(Error);
    });
});
