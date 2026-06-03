/**
 * Email Sender Handler
 * Stub implementation — logs email details and returns mock message ID.
 * Replace with real SendGrid / Nodemailer integration when ready.
 */
export default async function emailHandler({ inputs, config, nodeId }) {
  const startTime = Date.now();
  const content = inputs.content || '';
  const attachments = inputs.attachments || [];
  const to = config.to || '';
  const subject = config.subject || 'No Subject';
  const format = config.format || 'html';

  // Simulate email sending latency
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

  // Mock message ID
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  console.log(`📧 [Mock Email] To: ${to} | Subject: ${subject} | Format: ${format}`);

  return {
    outputs: {
      messageId,
      status: 'sent',
    },
    duration: Date.now() - startTime,
  };
}
