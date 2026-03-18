import { type ChildProcess, spawn } from "node:child_process";
import { createInterface } from "node:readline";

interface JsonRpcRequest {
	jsonrpc: "2.0";
	id: number;
	method: string;
	params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
	jsonrpc: "2.0";
	id?: number;
	method?: string;
	result?: unknown;
	params?: Record<string, unknown>;
	error?: { code: number; message: string; data?: unknown };
}

export interface AcpClientOptions {
	command: string;
	args: string[];
	env?: Record<string, string | undefined>;
	label: string;
}

export class AcpClient {
	private process: ChildProcess | null = null;
	private nextId = 1;
	private pendingRequests = new Map<
		number,
		{ resolve: (v: JsonRpcResponse) => void; reject: (e: Error) => void }
	>();
	private notificationHandlers: ((msg: JsonRpcResponse) => void)[] = [];
	private initialized = false;
	private sessionId: string | null = null;
	private opts: AcpClientOptions;

	constructor(opts: AcpClientOptions) {
		this.opts = opts;
	}

	async ensureRunning(): Promise<void> {
		if (this.process && !this.process.killed) return;

		this.process = spawn(this.opts.command, this.opts.args, {
			stdio: ["pipe", "pipe", "pipe"],
			env: { ...process.env, ...this.opts.env },
		});

		this.process.on("exit", (code) => {
			console.log(`[${this.opts.label}] process exited with code ${code}`);
			this.process = null;
			this.initialized = false;
			this.sessionId = null;
			for (const [, pending] of this.pendingRequests) {
				pending.reject(new Error(`${this.opts.label} process exited`));
			}
			this.pendingRequests.clear();
		});

		this.process.stderr?.on("data", (data: Buffer) => {
			console.log(`[${this.opts.label}] stderr: ${data.toString().trim()}`);
		});

		const rl = createInterface({ input: this.process.stdout! });
		rl.on("line", (line: string) => {
			if (!line.trim()) return;
			try {
				const msg = JSON.parse(line) as JsonRpcResponse;
				if (msg.id !== undefined && this.pendingRequests.has(msg.id)) {
					const pending = this.pendingRequests.get(msg.id)!;
					this.pendingRequests.delete(msg.id);
					pending.resolve(msg);
				} else {
					for (const handler of this.notificationHandlers) {
						handler(msg);
					}
				}
			} catch {
				// Non-JSON output, ignore
			}
		});
	}

	send(method: string, params?: Record<string, unknown>): Promise<JsonRpcResponse> {
		if (!this.process?.stdin?.writable) {
			return Promise.reject(new Error(`${this.opts.label} process not running`));
		}

		const id = this.nextId++;
		const request: JsonRpcRequest = {
			jsonrpc: "2.0",
			id,
			method,
			...(params && { params }),
		};

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pendingRequests.delete(id);
				reject(new Error(`${this.opts.label} timeout for ${method}`));
			}, 30000);

			this.pendingRequests.set(id, {
				resolve: (v) => {
					clearTimeout(timeout);
					resolve(v);
				},
				reject: (e) => {
					clearTimeout(timeout);
					reject(e);
				},
			});

			this.process!.stdin!.write(`${JSON.stringify(request)}\n`);
		});
	}

	sendNotification(method: string, params?: Record<string, unknown>) {
		if (!this.process?.stdin?.writable) return;
		this.process.stdin.write(
			`${JSON.stringify({ jsonrpc: "2.0", method, ...(params && { params }) })}\n`,
		);
	}

	onNotification(handler: (msg: JsonRpcResponse) => void): () => void {
		this.notificationHandlers.push(handler);
		return () => {
			this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
		};
	}

	async initialize(): Promise<void> {
		if (this.initialized) return;
		await this.ensureRunning();
		const res = await this.send("initialize");
		if (res.error) {
			throw new Error(`${this.opts.label} initialize failed: ${res.error.message}`);
		}
		this.initialized = true;
	}

	async newSession(mode: "agent" | "ask" = "agent"): Promise<string> {
		await this.initialize();
		const res = await this.send("session/new", { mode });
		if (res.error) {
			throw new Error(`${this.opts.label} session/new failed: ${res.error.message}`);
		}
		this.sessionId = (res.result as { sessionId?: string })?.sessionId ?? "default";
		return this.sessionId;
	}

	async prompt(message: string): Promise<JsonRpcResponse> {
		if (!this.sessionId) await this.newSession();
		return this.send("session/prompt", { message, sessionId: this.sessionId });
	}

	abort() {
		if (this.process && !this.process.killed) this.process.kill("SIGTERM");
		this.process = null;
		this.initialized = false;
		this.sessionId = null;
	}
}
