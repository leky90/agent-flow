import { ComposerPrimitive } from "@assistant-ui/react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatComposer() {
	return (
		<ComposerPrimitive.Root className="flex items-end gap-2 border-t border-border bg-card px-4 py-3">
			<ComposerPrimitive.Input placeholder="Type a message..." asChild>
				<Input className="flex-1" />
			</ComposerPrimitive.Input>
			<ComposerPrimitive.Send asChild>
				<Button size="icon" disabled={false}>
					<SendHorizonal size={16} />
				</Button>
			</ComposerPrimitive.Send>
		</ComposerPrimitive.Root>
	);
}
