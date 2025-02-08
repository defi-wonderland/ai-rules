import { InvalidConfiguration } from "./base-configuration.js";

/**
 * Thrown when no team selection is provided
 */
export class MissingTeamSelection extends InvalidConfiguration {
    constructor() {
        super(
            "No team selection was provided. Please select at least one team or technology option.",
        );
    }
}
