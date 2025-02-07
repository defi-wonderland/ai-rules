import { describe, expect, it } from "vitest";

import { InvalidConfiguration } from "../../src/errors/base-configuration.js";
import { MissingTeamSelection } from "../../src/errors/missing-team.js";

describe("MissingTeamSelection", () => {
    it("returns expected error message for missing team selection", () => {
        const error = new MissingTeamSelection();

        expect(error.message).toBe(
            "No team selection was provided. Please select at least one team or technology option.",
        );
        expect(error.name).toBe("InvalidConfiguration");
    });

    it("extends InvalidConfiguration", () => {
        const error = new MissingTeamSelection();
        expect(error).toBeInstanceOf(MissingTeamSelection);
        expect(error).toBeInstanceOf(InvalidConfiguration);
    });
});
