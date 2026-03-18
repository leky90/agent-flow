import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../dialog";

const meta = {
	title: "Patterns/Dialog",
	component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger render={<Button variant="outline" />}>Open Dialog</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Agent?</DialogTitle>
					<DialogDescription>
						This will delete the agent and all its tools, skills, and channels.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline">Cancel</Button>
					<Button variant="destructive">Delete</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};
