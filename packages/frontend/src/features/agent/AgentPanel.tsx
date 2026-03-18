import { MessageSquare, Plus, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useFlowStore } from "../canvas/store";
import type { Agent, ThinkingLevel, ToolExecution } from "./types";

interface AgentPanelProps {
	agent: Agent;
}

export function AgentPanel({ agent }: AgentPanelProps) {
	const { updateAgent, addTool, addSkill, addChannel } = useFlowStore();

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

				<Separator />

				<div className="space-y-2">
					<Label className="font-heading tracking-widest uppercase">Add Children</Label>
					<div className="flex flex-col gap-1.5">
						<Button
							variant="outline"
							size="sm"
							className="justify-start"
							onClick={() => addTool(agent.id)}
						>
							<Wrench size={14} />
							<Plus size={14} />
							Add Tool
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="justify-start"
							onClick={() => addSkill(agent.id)}
						>
							<Zap size={14} />
							<Plus size={14} />
							Add Skill
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="justify-start"
							onClick={() => addChannel(agent.id)}
						>
							<MessageSquare size={14} />
							<Plus size={14} />
							Add Channel
						</Button>
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
