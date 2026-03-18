import type { Meta, StoryObj } from "@storybook/react-vite";
import { ModelSelector } from "../ModelSelector";

const meta = {
	title: "Patterns/ModelSelector",
	component: ModelSelector,
	args: {
		provider: "anthropic",
		model: "claude-sonnet-4-20250514",
		onProviderChange: () => {},
		onModelChange: () => {},
	},
} satisfies Meta<typeof ModelSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OpenAI: Story = {
	args: {
		provider: "openai",
		model: "gpt-4o",
	},
};
