import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../badge";

const meta = {
	title: "Primitives/Badge",
	component: Badge,
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"secondary",
				"mono",
				"destructive",
				"outline",
				"ghost",
				"link",
				"accent-1",
				"accent-2",
				"accent-3",
				"accent-4",
			],
		},
	},
	args: { children: "Badge" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Mono: Story = { args: { variant: "mono", children: "anthropic/claude-4" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Destructive: Story = { args: { variant: "destructive" } };

export const AccentScale: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Badge variant="accent-1">Agent</Badge>
			<Badge variant="accent-2">Tool</Badge>
			<Badge variant="accent-3">Skill</Badge>
			<Badge variant="accent-4">Channel</Badge>
		</div>
	),
};
