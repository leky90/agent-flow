import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { DeleteConfirm } from "../DeleteConfirm";

const meta = {
	title: "Patterns/DeleteConfirm",
	component: DeleteConfirm,
	args: {
		title: "Delete Agent?",
		message: "This will delete the agent and all its tools, skills, and channels.",
		onConfirm: fn(),
		onCancel: fn(),
	},
} satisfies Meta<typeof DeleteConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DeleteTool: Story = {
	args: {
		title: "Delete Tool?",
		message: "This will remove the tool node.",
	},
};
