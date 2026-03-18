import { PROVIDERS } from "../constants/models";

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
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Provider
        </label>
        <select
          value={provider}
          onChange={(e) => {
            const newProvider = e.target.value;
            onProviderChange(newProvider);
            const firstModel = PROVIDERS.find(
              (p) => p.provider === newProvider,
            )?.models[0];
            if (firstModel) onModelChange(firstModel.id);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          {PROVIDERS.map((p) => (
            <option key={p.provider} value={p.provider}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
