export interface ToolParam {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: ToolParam[];
}
