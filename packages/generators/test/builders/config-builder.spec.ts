import type { OffchainLanguageConfig, SolidityConfig } from "@ai-rules/types";
import { baseConfig } from "@ai-rules/config";
import { TeamType } from "@ai-rules/types";
import { describe, expect, it } from "vitest";

import { ConfigBuilder } from "../../src/builders/config-builder.js";

describe("ConfigBuilder", () => {
    it("initializes with base configuration", () => {
        const builder = new ConfigBuilder();
        const config = builder.build();
        expect(config).toEqual(baseConfig);
    });

    it("adds a new team correctly", () => {
        const newTeam = TeamType.enum.ui;
        const builder = new ConfigBuilder();
        const initialTeams = [...builder.build().teams];
        const newTeamIndex = initialTeams.indexOf(newTeam);
        if (newTeamIndex > -1) {
            initialTeams.splice(newTeamIndex, 1);
        }
        const initialLength = initialTeams.length;

        builder.addTeam(newTeam);
        const config = builder.build();

        expect(config.teams).toContain(newTeam);
        if (newTeamIndex === -1) {
            expect(config.teams.length).toBe(initialLength + 1);
        }
    });

    it("does not add a duplicate team", () => {
        const builder = new ConfigBuilder();
        const initialConfig = builder.build();
        const initialLength = initialConfig.teams.length;
        if (initialLength === 0) {
            builder.addTeam(TeamType.enum.offchain);
        }
        const currentTeams = builder.build().teams;
        const existingTeam = currentTeams[0];

        if (!existingTeam) {
            throw new Error("Test setup failed: No existing team found after potential add.");
        }

        builder.addTeam(existingTeam);
        const finalConfig = builder.build();
        const count = finalConfig.teams.filter((t) => t === existingTeam).length;
        expect(count).toBe(1);
    });

    it("adds solidity configuration correctly", () => {
        const builder = new ConfigBuilder();
        const solidityConf: SolidityConfig = {
            framework: "foundry",
            gasOptimizations: false,
            testing: { framework: "forge" },
        };
        builder.addSolidityConfig(solidityConf);
        const config = builder.build();
        expect(config.solidity).toEqual(solidityConf);
    });

    it("adds offchain (typescript) configuration correctly", () => {
        const builder = new ConfigBuilder();
        const offchainConf: OffchainLanguageConfig = { language: "typescript" };
        builder.addOffchainConfig(offchainConf);
        const config = builder.build();
        expect(config.typescript).toEqual(offchainConf);
    });

    it("supports method chaining", () => {
        const builder = new ConfigBuilder();
        const solidityConf: SolidityConfig = {
            framework: "foundry",
            gasOptimizations: true,
            testing: { framework: "forge" },
        };
        const offchainConf: OffchainLanguageConfig = { language: "javascript" };
        const newTeam = TeamType.enum.ui;

        builder.addTeam(newTeam).addSolidityConfig(solidityConf).addOffchainConfig(offchainConf);

        const config = builder.build();
        expect(config.teams).toContain(newTeam);
        expect(config.solidity).toEqual(solidityConf);
        expect(config.typescript).toEqual(offchainConf);
    });

    it("build() returns the final configuration object", () => {
        const builder = new ConfigBuilder();
        const solidityConf: SolidityConfig = {
            framework: "foundry",
            gasOptimizations: false,
            testing: { framework: "forge" },
        };
        builder.addSolidityConfig(solidityConf);
        const builtConfig = builder.build();
        const initialTeams = [...builtConfig.teams];

        builder.addTeam(TeamType.enum.ui);
        const builtConfig2 = builder.build();

        expect(builtConfig.solidity).toEqual(solidityConf);
        expect(builtConfig.teams).toEqual(initialTeams);

        expect(builtConfig2.solidity).toEqual(solidityConf);
        expect(builtConfig2.teams).toContain(TeamType.enum.ui);
        if (!initialTeams.includes(TeamType.enum.ui)) {
            expect(builtConfig2.teams.length).toBe(initialTeams.length + 1);
        }

        expect(builtConfig).not.toBe(builder);
    });
});
