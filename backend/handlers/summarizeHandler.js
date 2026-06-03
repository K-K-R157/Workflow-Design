/**
 * Summarize / LLM Call Handler
 * Stub implementation — returns mock LLM response.
 * Replace with real OpenAI / Anthropic / Google AI integration when ready.
 */
export default async function summarizeHandler({ inputs, config, nodeId }) {
  const startTime = Date.now();
  const prompt = inputs.prompt || '';
  const context = inputs.context || '';
  const model = config.model || 'gpt-4o';
  const temperature = config.temperature || 0.7;
  const maxTokens = config.maxTokens || 4096;

  // Simulate API latency (LLM calls are slower)
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1500));

  // Mock token count
  const inputTokens = Math.ceil((prompt.length + context.length) / 4);
  const outputTokens = Math.ceil(maxTokens * 0.3);

  const mockResponse = [
    `[Mock ${model} Response]`,
    ``,
    `Based on the provided prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
    context ? `\nWith context: "${context.slice(0, 80)}..."` : '',
    ``,
    `This is a simulated LLM response. In production, this would call the ${model} API`,
    `with temperature=${temperature} and max_tokens=${maxTokens}.`,
    ``,
    `The response demonstrates the expected output format for downstream nodes.`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    outputs: {
      response: mockResponse,
      tokens: inputTokens + outputTokens,
    },
    duration: Date.now() - startTime,
  };
}
