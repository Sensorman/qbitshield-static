import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user || error) {
    redirect('/login')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  const usageRes = await fetch(`${baseUrl}/api/usage`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  const usage = await usageRes.json()

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="p-6 border-b border-gray-700 flex justify-between items-center">
        <form method="post" action="/logout">
          <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </form>
      </header>

      <main className="p-8">
        <h2 className="text-3xl font-bold text-green-400 mb-4">🔐 API Dashboard</h2>
        <p>Your API Key: <code>{usage.api_key}</code></p>
        <p>Tier: {usage.tier}</p>
        <p>Used: {usage.usage_count} / {usage.limit}</p>
        <p>Remaining: {usage.limit - usage.usage_count}</p>
      </main>
    </div>
  )
}