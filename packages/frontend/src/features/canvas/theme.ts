// Domain-to-token mapping.
// Maps domain node types to the semantic categorical accent scale.
// React Flow handles/edges require resolved hex values — these are
// the resolved equivalents of the CSS tokens --accent-1 through --accent-4.

export const NODE_COLORS = {
	agent: "#a52020", // accent-1
	tool: "#c08040", // accent-2
	skill: "#c0a050", // accent-3
	channel: "#6b6058", // accent-4
	default: "#4a4542",
} as const;

// Maps domain node types to Tailwind token class segments.
// Usage: `bg-${NODE_TOKENS.agent}` → `bg-accent-1`
export const NODE_TOKENS = {
	agent: "accent-1",
	tool: "accent-2",
	skill: "accent-3",
	channel: "accent-4",
} as const;
