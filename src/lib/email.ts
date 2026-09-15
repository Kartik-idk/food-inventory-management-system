export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  sendMail: (options: EmailOptions) => Promise<boolean>;
}

// A generic mock provider for development
class ConsoleMockProvider implements EmailProvider {
  async sendMail(options: EmailOptions) {
    console.log(`\n=== MOCK EMAIL SENT ===\nTo: ${options.to}\nSubject: ${options.subject}\n\n${options.body}\n=======================\n`);
    return true;
  }
}

// Future implementations could be added here (e.g. ResendProvider)

export function getEmailProvider(): EmailProvider {
  // If we had a real API key configured, we could return a different provider here:
  // if (process.env.EMAIL_PROVIDER_KEY) return new ResendProvider();
  
  return new ConsoleMockProvider();
}

export async function sendAlertEmail(options: EmailOptions) {
  try {
    const provider = getEmailProvider();
    return await provider.sendMail(options);
  } catch (err) {
    console.error("Email delivery failed:", err);
    return false;
  }
}
