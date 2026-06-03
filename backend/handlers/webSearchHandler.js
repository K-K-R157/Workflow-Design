/**
 * Web Search Handler
 * Stub implementation — returns mock search results.
 * Replace with real SerpAPI / Google Search integration when ready.
 */
export default async function webSearchHandler({ inputs, config, nodeId }) {
  const startTime = Date.now();
  const query = inputs.query || 'default search';
  const maxResults = config.maxResults || 10;

  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

  // Generate mock results
  const results = Array.from({ length: Math.min(maxResults, 5) }, (_, i) => ({
    title: `Result ${i + 1} for "${query}"`,
    url: `https://example.com/result-${i + 1}`,
    snippet: `This is a mock search result for the query "${query}". In production, this would come from a real search API.`,
    position: i + 1,
  }));

  return {
    outputs: {
      results,
      count: results.length,
    },
    duration: Date.now() - startTime,
  };
}
