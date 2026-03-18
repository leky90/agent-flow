import { MessagePrimitive } from "@assistant-ui/react";

export function UserBubble() {
	return (
		<MessagePrimitive.Root className="flex justify-end px-4 py-2">
			<div className="max-w-4/5 rounded-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
				<MessagePrimitive.Content />
			</div>
		</MessagePrimitive.Root>
	);
}

export function AssistantBubble() {
	return (
		<MessagePrimitive.Root className="flex justify-start px-4 py-2">
			<div className="max-w-4/5 rounded-sm bg-surface-inset px-4 py-2.5 text-sm text-foreground">
				<MessagePrimitive.Content />
			</div>
		</MessagePrimitive.Root>
	);
}
