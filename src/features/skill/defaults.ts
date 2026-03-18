import { generateId } from "../../shared/utils/id";
import type { AgentSkill } from "./types";

export function createDefaultSkill(
  overrides?: Partial<AgentSkill>,
): AgentSkill {
  return {
    id: generateId(),
    name: "New Skill",
    description: "",
    ...overrides,
  };
}
