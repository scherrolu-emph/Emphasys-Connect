import { SMTPClient } from 'https://deno.land/x/denomailer/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const { email, caseName, appUrl } = await req.json();
  console.log('notify-participant-added invoked:', { email, caseName });

  const gmailUser = Deno.env.get('GMAIL_USER')!;
  const gmailPassword = Deno.env.get('GMAIL_PASSWORD')!;

  const client = new SMTPClient({
    connection: {
      hostname: 'smtp.gmail.com',
      port: 465,
      tls: true,
      auth: { username: gmailUser, password: gmailPassword },
    },
  });

  try {
    await client.send({
      from: `Emphasys Connect <${gmailUser}>`,
      to: email,
      subject: `You've been invited to ${caseName} on Emphasys Connect`,
      html: `
        <p>Hi,</p>
        <p>You've been added as a participant to <strong>${caseName}</strong> on Emphasys Connect.</p>
        <p>Click the link below to log in and view the case:</p>
        <p><a href="${appUrl}">${appUrl}</a></p>
        <p>Enter your email address and we'll send you a verification code to log in.</p>
        <br/>
        <p>The Emphasys Connect Team</p>
      `,
    });
    console.log('Email sent to:', email);
  } catch (err) {
    console.error('SMTP error:', err);
    return new Response('Failed to send email', { status: 500, headers: corsHeaders });
  } finally {
    await client.close();
  }

  return new Response(JSON.stringify({ sent: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
