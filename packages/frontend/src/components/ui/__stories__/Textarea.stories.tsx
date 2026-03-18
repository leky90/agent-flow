import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../label";
import { Textarea } from "../textarea";

const meta = {
	title: "Primitives/Textarea",
	component: Textarea,
	args: { placeholder: "Instructions for the agent..." },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
	render: () => (
		<div className="space-y-1.5">
			<Label>System Prompt</Label>
			<Textarea rows={4} placeholder="Instructions for the agent..." />
		</div>
	),
};
