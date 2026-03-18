import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFlowStore } from "../canvas/store";
import type { Agent, ThinkingLevel, ToolExecution } from "./types";

interface AgentPanelProps {
	agent: Agent;
}

export function AgentPanel({ agent }: AgentPanelProps) {
	const { updateAgent } = useFlowStore();

	return (
		<ScrollArea className="h-full">
			<div className="space-y-4 p-4">
				<div className="space-y-1.5">
					<Label>Name</Label>
					<Input
						value={agent.name}
						onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
					/>
				</div>

				<div className="space-y-1.5">
					<Label>Model</Label>
					<Input
						value={agent.model}
						onChange={(e) => updateAgent(agent.id, { model: e.target.value })}
						placeholder="provider/model"
					/>
				</div>

				<div className="space-y-1.5">
					<Label>System Prompt</Label>
					<Textarea
						value={agent.systemPrompt}
						onChange={(e) => updateAgent(agent.id, { systemPrompt: e.target.value })}
						rows={4}
						placeholder="Instructions for the agent..."
					/>
				</div>

				<div className="space-y-1.5">
					<Label>Thinking Level</Label>
					<Select
						value={agent.thinkingLevel}
						onValueChange={(val) =>
							val && updateAgent(agent.id, { thinkingLevel: val as ThinkingLevel })
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(["minimal", "low", "medium", "high", "xhigh"] as ThinkingLevel[]).map((level) => (
								<SelectItem key={level} value={level}>
									{level}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label>Tool Execution</Label>
					<Select
						value={agent.toolExecution}
						onValueChange={(val) =>
							val && updateAgent(agent.id, { toolExecution: val as ToolExecution })
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="parallel">Parallel</SelectItem>
							<SelectItem value="sequential">Sequential</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</ScrollArea>
	);
}
