/** JSON schemas for Fastify route validation */

const toolParamSchema = {
	type: "object" as const,
	properties: {
		name: { type: "string" as const },
		type: { type: "string" as const, enum: ["string", "number", "boolean", "object", "array"] },
		description: { type: "string" as const },
		required: { type: "boolean" as const },
	},
	required: ["name", "type", "description", "required"] as const,
};

const toolSchema = {
	type: "object" as const,
	properties: {
		id: { type: "string" as const },
		name: { type: "string" as const },
		description: { type: "string" as const },
		parameters: { type: "array" as const, items: toolParamSchema },
	},
	required: ["id", "name", "description", "parameters"] as const,
};

const skillSchema = {
	type: "object" as const,
	properties: {
		id: { type: "string" as const },
		name: { type: "string" as const },
		description: { type: "string" as const },
		path: { type: "string" as const },
	},
	required: ["id", "name", "description"] as const,
};

const channelSchema = {
	type: "object" as const,
	properties: {
		id: { type: "string" as const },
		name: { type: "string" as const },
		provider: { type: "string" as const },
		model: { type: "string" as const },
		isDM: { type: "boolean" as const },
	},
	required: ["id", "name", "provider", "model", "isDM"] as const,
};

export const createAgentSchema = {
	body: {
		type: "object" as const,
		properties: {
			name: { type: "string" as const, minLength: 1 },
			model: { type: "string" as const, minLength: 1 },
			systemPrompt: { type: "string" as const },
			thinkingLevel: {
				type: "string" as const,
				enum: ["minimal", "low", "medium", "high", "xhigh"],
			},
			toolExecution: { type: "string" as const, enum: ["sequential", "parallel"] },
			tools: { type: "array" as const, items: toolSchema },
			skills: { type: "array" as const, items: skillSchema },
			channels: { type: "array" as const, items: channelSchema },
		},
		required: [
			"name",
			"model",
			"systemPrompt",
			"thinkingLevel",
			"toolExecution",
			"tools",
			"skills",
			"channels",
		] as const,
	},
};

export const updateAgentSchema = {
	body: {
		type: "object" as const,
		properties: {
			name: { type: "string" as const },
			model: { type: "string" as const },
			systemPrompt: { type: "string" as const },
			thinkingLevel: {
				type: "string" as const,
				enum: ["minimal", "low", "medium", "high", "xhigh"],
			},
			toolExecution: { type: "string" as const, enum: ["sequential", "parallel"] },
			tools: { type: "array" as const, items: toolSchema },
			skills: { type: "array" as const, items: skillSchema },
			channels: { type: "array" as const, items: channelSchema },
		},
	},
};

export const chatSchema = {
	body: {
		type: "object" as const,
		properties: {
			message: { type: "string" as const, minLength: 1 },
			sessionId: { type: "string" as const },
		},
		required: ["message"] as const,
	},
};

export const idParamSchema = {
	params: {
		type: "object" as const,
		properties: {
			id: { type: "string" as const, minLength: 1 },
		},
		required: ["id"] as const,
	},
};
