import { AcpClient } from "./acp-client.ts";
import { AcpProvider } from "./provider-base.ts";

export class ClaudeProvider extends AcpProvider {
	canHandle(model: string) {
		return model.startsWith("claude-cli/");
	}
	protected createClient() {
		return new AcpClient({
			command: process.env.CLAUDE_CLI_CMD ?? "claude",
			args: ["acp"],
			env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
			label: "claude-acp",
		});
	}
}
