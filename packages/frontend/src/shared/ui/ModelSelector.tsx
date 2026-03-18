import { PROVIDERS } from "@agent-flow/shared";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ModelSelectorProps {
	provider: string;
	model: string;
	onProviderChange: (provider: string) => void;
	onModelChange: (model: string) => void;
}

export function ModelSelector({
	provider,
	model,
	onProviderChange,
	onModelChange,
}: ModelSelectorProps) {
	const selectedProvider = PROVIDERS.find((p) => p.provider === provider);
	const models = selectedProvider?.models ?? [];

	return (
		<div className="space-y-3">
			<div className="space-y-1.5">
				<Label className="text-xs text-muted-foreground">Provider</Label>
				<Select
					value={provider}
					onValueChange={(val) => {
						if (!val) return;
						onProviderChange(val);
						const firstModel = PROVIDERS.find((p) => p.provider === val)?.models[0];
						if (firstModel) onModelChange(firstModel.id);
					}}
				>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PROVIDERS.map((p) => (
							<SelectItem key={p.provider} value={p.provider}>
								{p.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-1.5">
				<Label className="text-xs text-muted-foreground">Model</Label>
				<Select value={model} onValueChange={(val) => val && onModelChange(val)}>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{models.map((m) => (
							<SelectItem key={m.id} value={m.id}>
								{m.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
