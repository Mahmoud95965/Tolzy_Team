/**
 * src/lib/axiom-v2/azure-embeddings.ts
 * توليد المتجهات الدلالية عبر Azure OpenAI باستخدام text-embedding-3-small مع إجبار الأبعاد dimensions=1024
 */
import OpenAI from 'openai';
import { preprocessQuery } from './query-preprocessor';

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
const embeddingDeployment = (process.env.AZURE_EMBEDDING_DEPLOYMENT || 'text-embedding-3-small').trim();
const apiVersion = (process.env.AZURE_AI_API_VERSION || '2024-06-01').trim();

let _azureEmbeddingClient: OpenAI | null = null;

function getAzureEmbeddingClient(): OpenAI {
  if (!_azureEmbeddingClient) {
    if (!apiKey) {
      console.warn('⚠️ [Azure Embeddings] AZURE_AI_KEY is not set.');
    }
    _azureEmbeddingClient = new OpenAI({
      baseURL: endpoint,
      apiKey: apiKey || 'placeholder-key',
      defaultQuery: { 'api-version': apiVersion },
    });
  }
  return _azureEmbeddingClient;
}

/**
 * توليد متجه استعلام بأبعاد 1024 دقيقة
 * @param text النص المطلوب تحويله لمتجه
 * @returns مصفوفة المتجه بأبعاد 1024
 */
export async function generateAzureEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required to generate embedding vector');
  }

  // 1. معالجة وتجهيز النص
  const preparedText = preprocessQuery(text);

  // 2. طلب التوليد من Azure OpenAI
  const client = getAzureEmbeddingClient();

  const response = await client.embeddings.create({
    model: embeddingDeployment,
    input: preparedText,
    dimensions: 1024, // 🎯 تحديد إجباري للأبعاد 1024 لـ AXIOM V2
  });

  if (!response.data || response.data.length === 0 || !response.data[0].embedding) {
    throw new Error('Empty or invalid embedding returned from Azure OpenAI');
  }

  return response.data[0].embedding;
}
