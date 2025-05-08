/**
 * Interface for Cursor rule definitions
 */
export interface CursorRule {
    /**
     * Name of the rule
     */
    name: string;

    /**
     * Description of what the rule enforces
     */
    description: string;

    /**
     * Glob pattern(s) for files this rule applies to
     */
    globs: string | string[];

    /**
     * Markdown content of the rule
     */
    content: string;
}
