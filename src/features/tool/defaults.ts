import { generateId } from "../../shared/utils/id";
import type { AgentTool } from "./types";

export function createDefaultTool(overrides?: Partial<AgentTool>): AgentTool {
  return {
    id: generateId(),
    name: "New Tool",
    description: "",
    parameters: [],
    ...overrides,
  };
}
