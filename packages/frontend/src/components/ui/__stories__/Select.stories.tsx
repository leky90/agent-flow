import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

const meta = {
	title: "Primitives/Select",
	component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="space-y-1.5 w-64">
			<Label>Thinking Level</Label>
			<Select defaultValue="medium">
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="minimal">minimal</SelectItem>
					<SelectItem value="low">low</SelectItem>
					<SelectItem value="medium">medium</SelectItem>
					<SelectItem value="high">high</SelectItem>
					<SelectItem value="xhigh">xhigh</SelectItem>
				</SelectContent>
			</Select>
		</div>
	),
};

export const Small: Story = {
	render: () => (
		<div className="w-48">
			<Select defaultValue="parallel">
				<SelectTrigger size="sm" className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="parallel">Parallel</SelectItem>
					<SelectItem value="sequential">Sequential</SelectItem>
				</SelectContent>
			</Select>
		</div>
	),
};
