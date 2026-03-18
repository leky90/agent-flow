import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useFlowStore } from "../canvas/store";
import type { AgentSkill } from "./types";

interface SkillPanelProps {
	skill: AgentSkill;
	agentId: string;
}

export function SkillPanel({ skill, agentId }: SkillPanelProps) {
	const { updateSkill } = useFlowStore();

	return (
		<ScrollArea className="h-full">
			<div className="space-y-4 p-4">
				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">Name</Label>
					<Input
						value={skill.name}
						onChange={(e) => updateSkill(agentId, skill.id, { name: e.target.value })}
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">Description</Label>
					<Textarea
						value={skill.description}
						onChange={(e) => updateSkill(agentId, skill.id, { description: e.target.value })}
						rows={3}
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">Path (optional)</Label>
					<Input
						value={skill.path ?? ""}
						onChange={(e) =>
							updateSkill(agentId, skill.id, {
								path: e.target.value || undefined,
							})
						}
						placeholder="~/.pi/agent/skills/my-skill"
					/>
				</div>
			</div>
		</ScrollArea>
	);
}
