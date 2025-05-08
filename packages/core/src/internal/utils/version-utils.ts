/**
 * Represents a semantic version string in the format "major.minor.patch".
 */
export type VersionType = `${number}.${number}.${number}`;

/**
 * Compares two semantic version strings.
 * While the function is robust in parsing various formats (see tests),
 * the preferred format is {@link VersionType} (e.g., "1.0.0").
 *
 * @param v1 - The first version string. Handles undefined or malformed strings by treating them as "0.0.0" or parsing parts as 0.
 * @param v2 - The second version string. Handles undefined or malformed strings by treating them as "0.0.0" or parsing parts as 0.
 * @returns A positive number if v1 > v2, a negative number if v1 < v2, or 0 if v1 === v2.
 */
export function compareVersions(v1: VersionType | undefined, v2: VersionType | undefined): number {
    const version1 = (v1 || "0.0.0").split(".").map((part) => parseInt(part) || 0);
    const version2 = (v2 || "0.0.0").split(".").map((part) => parseInt(part) || 0);

    for (let i = 0; i < 3; i++) {
        const part1 = version1[i] || 0;
        const part2 = version2[i] || 0;
        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }

    return 0;
}
