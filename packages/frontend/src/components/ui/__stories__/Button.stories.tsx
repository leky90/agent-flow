import type { Meta, StoryObj } from "@storybook/react-vite";
import { Wrench } from "lucide-react";
import { Button } from "../button";

const meta = {
	title: "Primitives/Button",
	component: Button,
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"outline",
				"secondary",
				"ghost",
				"ghost-destructive",
				"ghost-on-primary",
				"destructive",
				"link",
			],
		},
		size: {
			control: "select",
			options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
		},
	},
	args: { children: "Button" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const GhostDestructive: Story = { args: { variant: "ghost-destructive" } };
export const Link: Story = { args: { variant: "link" } };

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Button size="xs">XS</Button>
			<Button size="sm">SM</Button>
			<Button size="default">Default</Button>
			<Button size="lg">LG</Button>
		</div>
	),
};

export const IconSizes: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Button size="icon-xs">
				<Wrench size={12} />
			</Button>
			<Button size="icon-sm">
				<Wrench size={14} />
			</Button>
			<Button size="icon">
				<Wrench size={16} />
			</Button>
			<Button size="icon-lg">
				<Wrench size={20} />
			</Button>
		</div>
	),
};

export const WithIcon: Story = {
	render: () => (
		<Button>
			<Wrench size={14} />
			With Icon
		</Button>
	),
};
