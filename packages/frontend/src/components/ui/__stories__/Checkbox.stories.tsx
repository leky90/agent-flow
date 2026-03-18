import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "../checkbox";
import { Label } from "../label";

const meta = {
	title: "Primitives/Checkbox",
	component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };

export const WithLabel: Story = {
	render: () => (
		<Label className="flex items-center gap-2 text-sm">
			<Checkbox defaultChecked />
			Direct Message
		</Label>
	),
};
