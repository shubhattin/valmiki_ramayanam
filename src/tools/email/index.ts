import { Buffer } from 'buffer';
import { z } from 'zod';
import { env } from '$env/dynamic/private';

const email_options = z.object({
  senders_name: z.string().min(3),
  recipient_emails: z.string().email().array(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional()
});
const email_output = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(false),
    status_code: z.number().int(),
    status_text: z.string()
  }),
  z.object({
    success: z.literal(true),
    message: z.string(),
    email_track_id: z.string()
  })
]);

export const send_email = async (options: z.infer<typeof email_options>) => {
  const { senders_name, recipient_emails, subject, text, html } = options;

  const SENDERS_EMAIL = z.string().min(3).parse(env.EMAIL_DOMAIN_ADRESS);
  const EMAIL_DOMAIN = SENDERS_EMAIL.split('@')[1];

  const formData = new FormData();
  formData.append('from', `${senders_name} <${SENDERS_EMAIL}>`);
  recipient_emails.forEach((email) => {
    formData.append('to', email);
  });
  formData.append('subject', subject);
  if (text) formData.append('text', text);
  if (html) formData.append('html', html);

  const auth = Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString('base64');
  const response = await fetch(`https://api.mailgun.net/v3/${EMAIL_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`
    },
    body: formData
  });

  if (!response.ok) {
    return email_output.parse({
      success: false,
      status_code: response.status,
      status_text: response.statusText
    });
  }
  const res_json = await response.json();
  return email_output.parse({
    success: true,
    message: res_json?.message,
    email_track_id: res_json?.id
  });
};
