import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "../separator";

const meta = {
	title: "Primitives/Separator",
	component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
	render: () => (
		<div className="space-y-3 w-64">
			<p className="text-sm">Above</p>
			<Separator />
			<p className="text-sm">Below</p>
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div className="flex h-8 items-center gap-3">
			<span className="text-sm">Left</span>
			<Separator orientation="vertical" />
			<span className="text-sm">Right</span>
		</div>
	),
};
