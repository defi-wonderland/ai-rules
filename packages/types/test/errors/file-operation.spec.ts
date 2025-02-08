import { describe, expect, it } from "vitest";

import { FileOperation } from "../../src/errors/file-operation.js";

describe("FileOperation", () => {
    it("creates read error with correct message", () => {
        const fileName = "config.json";
        const error = new FileOperation("read", fileName, "file not found");

        expect(error.message).toBe(
            'Failed to read configuration file "config.json": file not found',
        );
        expect(error.name).toBe("InvalidConfiguration");
        expect(error).toBeInstanceOf(Error);
    });

    it("creates write error with correct message", () => {
        const fileName = "config.json";
        const error = new FileOperation("write", fileName, "permission denied");

        expect(error.message).toBe(
            'Failed to write configuration file "config.json": permission denied',
        );
        expect(error.name).toBe("InvalidConfiguration");
        expect(error).toBeInstanceOf(Error);
    });
});
