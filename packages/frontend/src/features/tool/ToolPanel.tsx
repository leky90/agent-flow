import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { AgentTool, ToolParam } from "./types";

interface ToolPanelProps {
	tool: AgentTool;
	agentId: string;
}

export function ToolPanel({ tool, agentId }: ToolPanelProps) {
	const { updateTool } = useFlowStore();

	const handleAddParam = () => {
		updateTool(agentId, tool.id, {
			parameters: [
				...tool.parameters,
				{ name: "", type: "string", description: "", required: false },
			],
		});
	};

	const handleUpdateParam = (index: number, field: keyof ToolParam, value: string | boolean) => {
		const updated = tool.parameters.map((p, i) => (i === index ? { ...p, [field]: value } : p));
		updateTool(agentId, tool.id, { parameters: updated });
	};

	const handleRemoveParam = (index: number) => {
		updateTool(agentId, tool.id, {
			parameters: tool.parameters.filter((_, i) => i !== index),
		});
	};

	return (
		<ScrollArea className="h-full">
			<div className="space-y-4 p-4">
				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">Name</Label>
					<Input
						value={tool.name}
						onChange={(e) => updateTool(agentId, tool.id, { name: e.target.value })}
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">Description</Label>
					<Textarea
						value={tool.description}
						onChange={(e) => updateTool(agentId, tool.id, { description: e.target.value })}
						rows={3}
					/>
				</div>

				<Separator />

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label className="text-xs text-muted-foreground">Parameters</Label>
						<Button variant="ghost" size="xs" onClick={handleAddParam}>
							<Plus size={12} /> Add
						</Button>
					</div>

					{tool.parameters.map((param, index) => (
						<div key={index} className="space-y-2 rounded-lg border border-border p-3">
							<div className="flex items-center gap-2">
								<Input
									placeholder="Name"
									value={param.name}
									onChange={(e) => handleUpdateParam(index, "name", e.target.value)}
									className="flex-1"
								/>
								<Button
									variant="ghost-destructive"
									size="icon-sm"
									aria-label="Remove parameter"
									onClick={() => handleRemoveParam(index)}
								>
									<Trash2 size={14} />
								</Button>
							</div>
							<div className="flex items-center gap-2">
								<Select
									value={param.type}
									onValueChange={(val) => val && handleUpdateParam(index, "type", val)}
								>
									<SelectTrigger size="sm" className="w-24">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{["string", "number", "boolean", "object", "array"].map((t) => (
											<SelectItem key={t} value={t}>
												{t}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Checkbox
										checked={param.required}
										onCheckedChange={(checked) => handleUpdateParam(index, "required", !!checked)}
									/>
									Required
								</Label>
							</div>
							<Input
								placeholder="Description"
								value={param.description}
								onChange={(e) => handleUpdateParam(index, "description", e.target.value)}
							/>
						</div>
					))}
				</div>
			</div>
		</ScrollArea>
	);
}
