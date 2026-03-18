import { createApp } from "./app.ts";
import { config } from "./config.ts";

const app = await createApp();

try {
	await app.listen({ port: config.PORT, host: config.HOST });
	console.log(`Backend running at http://${config.HOST}:${config.PORT}`);
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
