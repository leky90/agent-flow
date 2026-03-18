import { AcpClient } from "./acp-client.ts";
import { AcpProvider } from "./provider-base.ts";

export class CodexProvider extends AcpProvider {
	canHandle(model: string) {
		return model.startsWith("codex/");
	}
	protected createClient() {
		return new AcpClient({
			command: process.env.CODEX_CLI_CMD ?? "codex",
			args: ["acp"],
			env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
			label: "codex-acp",
		});
	}
}
