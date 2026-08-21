import OpenAI from 'openai';

const endpoint = (process.env.AZURE_AI_ENDPOINT || 'https://mahmoudmuhammad212024-6-resource.services.ai.azure.com/openai/v1').trim();
const apiKey = (process.env.AZURE_AI_KEY || '').trim();
export const AZURE_AI_MODEL = (process.env.AZURE_AI_MODEL || process.env.AZURE_AI_DEPLOYMENT || 'axiom-core').trim();

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
