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
class ResendProvider implements EmailProvider {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  async sendMail(options: EmailOptions) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Inventory Alerts <alerts@resend.dev>',
        to: options.to,
        subject: options.subject,
        text: options.body
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Resend API Error: ${res.status} ${errorText}`);
    }
    
    return true;
  }
}

export function getEmailProvider(): EmailProvider {
  if (process.env.RESEND_API_KEY) {
    return new ResendProvider(process.env.RESEND_API_KEY);
  }
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
