import { TeamType } from "@ai-rules/types";
import inquirer from "inquirer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OffchainAnswers, SolidityAnswers } from "../../src/providers/inquirer-provider.js";
import { InquirerProvider } from "../../src/providers/inquirer-provider.js";

vi.mock("inquirer");

describe("InquirerProvider", () => {
    let provider: InquirerProvider;
    let mockInquirerPrompt: ReturnType<typeof vi.mocked<typeof inquirer.prompt>>;

    beforeEach(() => {
        provider = new InquirerProvider();
        mockInquirerPrompt = vi.mocked(inquirer.prompt);
        vi.resetAllMocks();
    });

    describe("getTechStackSelection", () => {
        it("calls inquirer.prompt with correct checkbox config", async () => {
            const expectedTeams = [TeamType.enum.offchain, TeamType.enum.ui];
            mockInquirerPrompt.mockResolvedValue({ teams: expectedTeams } as { teams: TeamType[] });

            await provider.getTechStackSelection();

            expect(mockInquirerPrompt).toHaveBeenCalledTimes(1);
            expect(mockInquirerPrompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: "checkbox",
                    name: "teams",
                    message: expect.any(String),
                    choices: expect.arrayContaining([
                        expect.objectContaining({ value: TeamType.enum.offchain }),
                        expect.objectContaining({ value: TeamType.enum.ui }),
                        expect.objectContaining({ value: TeamType.enum.solidity }),
                    ]),
                }),
            ]);
        });

        it("returns the selected teams from the prompt", async () => {
            const expectedTeams = [TeamType.enum.solidity];
            mockInquirerPrompt.mockResolvedValue({ teams: expectedTeams } as { teams: TeamType[] });

            const result = await provider.getTechStackSelection();

            expect(result).toEqual(expectedTeams);
        });
    });

    describe("getTeamConfig", () => {
        it("calls getOffchainConfig for offchain team", async () => {
            const typedProvider = provider as unknown as {
                getOffchainConfig(): Promise<OffchainAnswers>;
            };
            const offchainSpy = vi
                .spyOn(typedProvider, "getOffchainConfig")
                .mockResolvedValue({ language: "typescript" });
            await provider.getTeamConfig(TeamType.enum.offchain);
            expect(offchainSpy).toHaveBeenCalledTimes(1);
            offchainSpy.mockRestore();
        });

        it("calls getSolidityConfig for solidity team", async () => {
            const typedProvider = provider as unknown as {
                getSolidityConfig(): Promise<SolidityAnswers>;
            };
            const soliditySpy = vi
                .spyOn(typedProvider, "getSolidityConfig")
                .mockResolvedValue({ gasOptimizations: true });
            await provider.getTeamConfig(TeamType.enum.solidity);
            expect(soliditySpy).toHaveBeenCalledTimes(1);
            soliditySpy.mockRestore();
        });

        it("returns empty object for ui team", async () => {
            const result = await provider.getTeamConfig(TeamType.enum.ui);
            expect(result).toEqual({});
        });

        it("returns empty object for unknown team type", async () => {
            const result = await provider.getTeamConfig("unknown" as TeamType);
            expect(result).toEqual({});
        });
    });

    describe("getOffchainConfig (private)", () => {
        it("calls inquirer.prompt with correct list config", async () => {
            mockInquirerPrompt.mockResolvedValue({ language: "typescript" } as OffchainAnswers);
            const typedProvider = provider as unknown as {
                getOffchainConfig(): Promise<OffchainAnswers>;
            };
            await typedProvider.getOffchainConfig();

            expect(mockInquirerPrompt).toHaveBeenCalledTimes(1);
            expect(mockInquirerPrompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: "list",
                    name: "language",
                    message: expect.any(String),
                    choices: expect.arrayContaining([
                        expect.objectContaining({ value: "typescript" }),
                        expect.objectContaining({ value: "javascript" }),
                    ]),
                }),
            ]);
        });

        it("returns the selected language", async () => {
            const expectedAnswer: OffchainAnswers = { language: "javascript" };
            mockInquirerPrompt.mockResolvedValue(expectedAnswer);
            const typedProvider = provider as unknown as {
                getOffchainConfig(): Promise<OffchainAnswers>;
            };
            const result = await typedProvider.getOffchainConfig();
            expect(result).toEqual(expectedAnswer);
        });
    });

    describe("getSolidityConfig (private)", () => {
        it("calls inquirer.prompt with correct confirm config", async () => {
            mockInquirerPrompt.mockResolvedValue({ gasOptimizations: false } as SolidityAnswers);
            const typedProvider = provider as unknown as {
                getSolidityConfig(): Promise<SolidityAnswers>;
            };
            await typedProvider.getSolidityConfig();

            expect(mockInquirerPrompt).toHaveBeenCalledTimes(1);
            expect(mockInquirerPrompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: "confirm",
                    name: "gasOptimizations",
                    message: expect.any(String),
                    default: true,
                }),
            ]);
        });

        it("returns the selected gas optimization setting", async () => {
            const expectedAnswer: SolidityAnswers = { gasOptimizations: true };
            mockInquirerPrompt.mockResolvedValue(expectedAnswer);
            const typedProvider = provider as unknown as {
                getSolidityConfig(): Promise<SolidityAnswers>;
            };
            const result = await typedProvider.getSolidityConfig();
            expect(result).toEqual(expectedAnswer);
        });
    });
});
