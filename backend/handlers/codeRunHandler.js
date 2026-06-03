/**
 * Code Execution Handler
 * Stub implementation — simulates sandboxed code execution.
 * Replace with a real sandboxed runtime (Docker, VM2, etc.) when ready.
 */
export default async function codeRunHandler({ inputs, config, nodeId }) {
  const startTime = Date.now();
  const code = inputs.code || '';
  const codeInputs = inputs.inputs || {};
  const language = config.language || 'python';
  const timeout = config.timeout || 30;

  // Simulate execution latency
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 800));

  // Mock execution result
  const mockResult = {
    computed: true,
    language,
    inputKeys: Object.keys(codeInputs),
    codeLength: code.length,
  };

  return {
    outputs: {
      result: mockResult,
      stdout: `[${language}] Code executed successfully (${code.length} chars)\nInputs: ${JSON.stringify(codeInputs)}\nTimeout: ${timeout}s`,
      stderr: '',
    },
    duration: Date.now() - startTime,
  };
}
