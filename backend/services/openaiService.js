const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const { normalizeStringList, normalizeWhitespace } = require('../utils/formatters');

const resumeAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    score: {
      type: 'number',
      minimum: 0,
      maximum: 100,
    },
    skills: {
      type: 'array',
      items: { type: 'string' },
    },
    experienceSummary: {
      type: 'string',
    },
    suggestions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['score', 'skills', 'experienceSummary', 'suggestions'],
};

const jobMatchSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    matchPercentage: {
      type: 'number',
      minimum: 0,
      maximum: 100,
    },
    missingSkills: {
      type: 'array',
      items: { type: 'string' },
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['matchPercentage', 'missingSkills', 'recommendations'],
};

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = new Set(['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'EAI_AGAIN']);
const RETRYABLE_MESSAGE_PATTERNS = [
  'overloaded',
  'rate limit',
  'timed out',
  'timeout',
  'temporarily unavailable',
  'service unavailable',
  'too many requests',
  '503',
  '502',
  '500',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryConfig = () => ({
  maxRetries: Math.max(0, Number(process.env.AI_MAX_RETRIES || 2)),
  initialDelayMs: Math.max(250, Number(process.env.AI_RETRY_DELAY_MS || 1500)),
});

const getConfiguredProviders = () => {
  const requestedOrder = (process.env.AI_PROVIDER_ORDER || 'gemini,xai')
    .split(',')
    .map((provider) => provider.trim().toLowerCase())
    .filter(Boolean);

  const availableProviders = {
    gemini: {
      name: 'gemini',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
      isConfigured: Boolean(process.env.GEMINI_API_KEY),
      execute: requestWithGemini,
    },
    xai: {
      name: 'xai',
      model: process.env.XAI_MODEL || 'grok-4-1-fast-reasoning',
      isConfigured: Boolean(process.env.XAI_API_KEY),
      execute: requestWithXai,
    },
  };

  const orderedProviders = requestedOrder
    .map((providerName) => availableProviders[providerName])
    .filter((provider) => provider?.isConfigured);

  if (!orderedProviders.length) {
    throw new Error(
      'No AI provider is configured. Add GEMINI_API_KEY and/or XAI_API_KEY to backend/.env.',
    );
  }

  return orderedProviders;
};

const sanitizeJsonString = (value = '') => {
  const trimmed = String(value || '').trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  return trimmed;
};

const parseStructuredJson = (value) => {
  const sanitized = sanitizeJsonString(value);

  try {
    return JSON.parse(sanitized);
  } catch (_error) {
    const objectMatch = sanitized.match(/\{[\s\S]*\}/);

    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('The model returned invalid JSON.');
  }
};

const getErrorStatus = (error) =>
  error?.status ||
  error?.response?.status ||
  error?.cause?.status ||
  error?.code ||
  null;

const isRetryableError = (error) => {
  const status = getErrorStatus(error);
  const message = String(error?.message || '').toLowerCase();

  return (
    RETRYABLE_ERROR_CODES.has(String(status)) ||
    RETRYABLE_STATUS_CODES.has(Number(status)) ||
    RETRYABLE_MESSAGE_PATTERNS.some((pattern) => message.includes(pattern))
  );
};

const buildProviderError = (providerName, error) => {
  const status = getErrorStatus(error);
  const message = error?.message || 'Unknown provider error';
  const enrichedError = new Error(`${providerName} request failed: ${message}`);

  enrichedError.status = status;
  enrichedError.provider = providerName;
  enrichedError.retryable = isRetryableError(error);

  return enrichedError;
};

function getGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

async function requestWithGemini({ name, schema, instructions, input, model }) {
  try {
    const response = await getGeminiClient().models.generateContent({
      model,
      contents: `${instructions}\n\n${input}`,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: {
          ...schema,
          title: name,
        },
      },
    });

    return parseStructuredJson(response.text);
  } catch (error) {
    throw buildProviderError('Gemini', error);
  }
}

function getXaiClient() {
  return new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
    maxRetries: 0,
  });
}

const extractXaiResponseText = (response) => {
  if (response?.output_text) {
    return response.output_text;
  }

  const messageItem = response?.output?.find((item) => item.type === 'message');
  const textPart = messageItem?.content?.find((part) => part.type === 'output_text');

  return textPart?.text || '';
};

async function requestWithXai({ name, schema, instructions, input, model }) {
  try {
    const response = await getXaiClient().responses.create({
      model,
      input: [
        {
          role: 'system',
          content: instructions,
        },
        {
          role: 'user',
          content: input,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name,
          schema,
          strict: true,
        },
      },
    });

    return parseStructuredJson(extractXaiResponseText(response));
  } catch (error) {
    throw buildProviderError('xAI', error);
  }
}

const requestStructuredOutput = async ({ name, schema, instructions, input }) => {
  const providers = getConfiguredProviders();
  const retryConfig = getRetryConfig();
  const providerErrors = [];

  for (const provider of providers) {
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt += 1) {
      try {
        return await provider.execute({
          name,
          schema,
          instructions,
          input,
          model: provider.model,
        });
      } catch (error) {
        providerErrors.push(
          `${provider.name}:${provider.model}:attempt-${attempt + 1}:${error.message}`,
        );

        if (attempt < retryConfig.maxRetries && error.retryable) {
          const delayMs = retryConfig.initialDelayMs * 2 ** attempt;
          await sleep(delayMs);
          continue;
        }

        break;
      }
    }
  }

  throw new Error(
    `All AI providers failed. ${providerErrors.join(' | ')}`,
  );
};

const analyzeResumeWithAI = async (resumeText) => {
  const result = await requestStructuredOutput({
    name: 'resume_analysis',
    schema: resumeAnalysisSchema,
    instructions:
      'Analyze the following resume. Extract skills, summarize experience, give a score out of 100, and suggest improvements. Be evidence-based and conservative. Return only the structured response that matches the provided schema.',
    input: `Resume:\n${resumeText}`,
  });

  return {
    score: Math.max(0, Math.min(100, Number(result.score || 0))),
    skills: normalizeStringList(result.skills),
    experienceSummary: normalizeWhitespace(result.experienceSummary || ''),
    suggestions: normalizeStringList(result.suggestions),
  };
};

const matchResumeToJobWithAI = async (resumeText, jobDescription) => {
  const result = await requestStructuredOutput({
    name: 'job_match_analysis',
    schema: jobMatchSchema,
    instructions:
      'Compare the resume with the job description. Return match percentage, missing skills, and recommendations. Base the comparison only on the provided content and keep the response practical and specific.',
    input: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
  });

  return {
    matchPercentage: Math.max(0, Math.min(100, Number(result.matchPercentage || 0))),
    missingSkills: normalizeStringList(result.missingSkills),
    recommendations: normalizeStringList(result.recommendations),
  };
};

module.exports = {
  analyzeResumeWithAI,
  matchResumeToJobWithAI,
};
