'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log('✅ Dashboard session:', session, error);

      if (!session?.user) {
        router.replace('/login?error=session');
        return;
      }

      setUser(session.user);
      await fetchUsage();
      setCheckingSession(false);
    };

    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/usage');
        const data = await res.json();
        console.log('✅ Usage fetched:', data);
        setUsage(data);
      } catch (err) {
        console.error('🚨 Failed to fetch usage:', err);
      }
    };

    init();
  }, [router, supabase.auth]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-gray-400">🔄 Checking session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-400">❌ No user session found. Redirecting to login...</p>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-yellow-400">⚠️ Unable to fetch usage data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="p-6 border-b border-gray-700 flex justify-between items-center">
        <Image
          src="/Black-QbitShieldVectorLogo.png"
          alt="QbitShield Logo"
          width={150}
          height={50}
          priority
        />
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm underline text-gray-300 hover:text-white">
            Home
          </Link>
          <form method="post" action="/logout">
            <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-green-400">🔐 API Dashboard</h1>

        <div className="bg-zinc-900 p-6 rounded mb-8 border border-zinc-700">
          <h2 className="text-xl font-semibold mb-2">Your API Key</h2>
          <p className="bg-gray-800 p-2 rounded text-sm font-mono select-all">{usage.api_key}</p>
          <p className="text-zinc-400 text-sm mt-2">Use this key with the QbitShield SDK to generate quantum keys securely.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-zinc-900 p-6 rounded shadow text-center">
            <p className="text-zinc-400">Tier</p>
            <h3 className="text-xl font-bold text-white">{usage.tier}</h3>
          </div>
          <div className="bg-zinc-900 p-6 rounded shadow text-center">
            <p className="text-zinc-400">Used</p>
            <h3 className="text-xl font-bold text-white">{usage.usage_count} / {usage.limit}</h3>
          </div>
          <div className="bg-zinc-900 p-6 rounded shadow text-center">
            <p className="text-zinc-400">Remaining</p>
            <h3 className="text-xl font-bold text-white">{usage.limit - usage.usage_count}</h3>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-2">📘 How to Use</h3>
          <pre className="bg-zinc-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`pip install git+https://github.com/Sensorman/qbitshield-sdk.git

from qbitshield import client
key = client.generate_key("your-api-key")`}
          </pre>
        </div>
      </main>
    </div>
  );
}