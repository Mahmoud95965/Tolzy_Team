import OpenAI from 'openai';

function normalizeAzureEndpoint(rawUrl: string): string {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed) {
        return 'https://mahmoudmuhammad212024-6-resource.services.ai.azure.com/openai/v1';
    }

    if (trimmed.endsWith('/openai/v1') || trimmed.endsWith('/openai/v1/')) {
        return trimmed.replace(/\/+$/, '');
    }

    try {
        const parsed = new URL(trimmed);
        return `${parsed.protocol}//${parsed.host}/openai/v1`;
    } catch {
        return trimmed;
    }
}

const rawEndpoint = process.env.AZURE_AI_ENDPOINT || 'https://mahmoudmuhammad212024-6-resource.services.ai.azure.com/openai/v1';
const endpoint = normalizeAzureEndpoint(rawEndpoint);
const apiKey = (process.env.AZURE_AI_KEY || '').trim();
export const AZURE_AI_MODEL = (process.env.AZURE_AI_MODEL || process.env.AZURE_AI_DEPLOYMENT_NAME || process.env.AZURE_AI_DEPLOYMENT || 'axiom-core').trim();

let _azureOpenAiClient: OpenAI | null = null;

export function getAzureAiClient(): OpenAI {
    if (!_azureOpenAiClient) {
        if (!apiKey) {
            console.warn('⚠️ [Azure AI] AZURE_AI_KEY is not set in environment variables.');
        }

        _azureOpenAiClient = new OpenAI({
            baseURL: endpoint,
            apiKey: apiKey || 'placeholder-key',
        });
    }
    return _azureOpenAiClient;
}

export const azureAi = {
    client: getAzureAiClient,
    model: AZURE_AI_MODEL,
    endpoint,
};
