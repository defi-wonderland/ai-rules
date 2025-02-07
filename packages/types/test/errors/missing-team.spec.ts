import { describe, expect, it } from "vitest";

import { ConfigurationError } from "../../src/errors/base-configuration.js";
import { MissingTeamSelection } from "../../src/errors/missing-team.js";

describe("MissingTeamSelection", () => {
    it("creates an error with the correct message", () => {
        const error = new MissingTeamSelection();

        expect(error.message).toBe(
            "No team selection was provided. Please select at least one team or technology option.",
        );
        expect(error.name).toBe("ConfigurationError");
    });

    it("extends ConfigurationError", () => {
        const error = new MissingTeamSelection();
        expect(error).toBeInstanceOf(MissingTeamSelection);
        expect(error).toBeInstanceOf(ConfigurationError);
    });
});
