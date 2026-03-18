import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../input";
import { Label } from "../label";

const meta = {
	title: "Primitives/Input",
	component: Input,
	args: { placeholder: "Enter text..." },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: "anthropic/claude-sonnet-4" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Disabled input" } };

export const WithLabel: Story = {
	render: () => (
		<div className="space-y-1.5">
			<Label>Agent Name</Label>
			<Input placeholder="Enter agent name..." />
		</div>
	),
};
