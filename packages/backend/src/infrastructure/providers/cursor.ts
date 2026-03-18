import { AcpClient } from "./acp-client.ts";
import { AcpProvider } from "./provider-base.ts";

export class CursorProvider extends AcpProvider {
	canHandle(model: string) {
		return model.startsWith("cursor/");
	}
	protected createClient() {
		return new AcpClient({
			command: process.env.CURSOR_AGENT_CMD ?? "agent",
			args: ["acp"],
			env: {
				CURSOR_API_KEY: process.env.CURSOR_API_KEY,
				CURSOR_AUTH_TOKEN: process.env.CURSOR_AUTH_TOKEN,
			},
			label: "cursor-acp",
		});
	}
	protected getMode(modelId: string) {
		return modelId === "cursor-ask" ? ("ask" as const) : ("agent" as const);
	}
}
