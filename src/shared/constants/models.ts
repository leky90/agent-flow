export interface ProviderModels {
  provider: string;
  label: string;
  models: { id: string; label: string }[];
}

export const PROVIDERS: ProviderModels[] = [
  {
    provider: "anthropic",
    label: "Anthropic",
    models: [
      { id: "claude-opus-4-20250514", label: "Claude Opus 4" },
      { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
      { id: "claude-haiku-4-20250414", label: "Claude Haiku 4" },
    ],
  },
  {
    provider: "openai",
    label: "OpenAI",
    models: [
      { id: "gpt-4.1", label: "GPT-4.1" },
      { id: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
      { id: "o3", label: "o3" },
      { id: "o4-mini", label: "o4-mini" },
    ],
  },
  {
    provider: "google",
    label: "Google",
    models: [
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    ],
  },
  {
    provider: "mistral",
    label: "Mistral",
    models: [
      { id: "mistral-large-latest", label: "Mistral Large" },
      { id: "mistral-medium-latest", label: "Mistral Medium" },
    ],
  },
  {
    provider: "groq",
    label: "Groq",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    ],
  },
];

export const DEFAULT_PROVIDER = "anthropic";
export const DEFAULT_MODEL = "claude-sonnet-4-20250514";
