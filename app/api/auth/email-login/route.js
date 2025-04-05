import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { email, name, company, phone } = await req.json();

  if (!email || !email.includes('@')) {
    return new Response('Invalid email', { status: 400 });
  }

  try {
    // ✅ Insert into Supabase users table
    await supabase.from('users').insert([{ email, name, company, phone }]);

    // ✅ Generate magic login link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: 'https://qbitshield.com/dashboard',
      }
    });

    if (error) {
      console.error('❌ Magic link generation failed:', error);
      return new Response('Could not generate magic link', { status: 500 });
    }

    const magicLink = data?.action_link;

    // ✅ Send email using Resend
    const sent = await resend.emails.send({
      from: 'Will Daoud <will@qbitshield.com>',
      to: [email],
      subject: 'Your Magic Login Link',
      html: `
        <h2>🔐 Welcome to QbitShield</h2>
        <p>Click below to log in securely to your dashboard and API key:</p>
        <p><a href="${magicLink}" style="color: green;">Access Dashboard</a></p>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('🔥 Email login failed:', err);
    return new Response('Server Error', { status: 500 });
  }
}