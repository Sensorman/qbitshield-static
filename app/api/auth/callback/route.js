// app/api/auth/callback/route.js
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookies().get(name)?.value
        },
        set(name, value, options) {
          cookies().set({ name, value, ...options })
        },
        remove(name, options) {
          cookies().set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    }
  )

  // Finalize the login session
  await supabase.auth.getSession()

  // Redirect to dashboard or fallback
  const url = new URL(request.url)
  const redirect = url.searchParams.get("redirect") || "/dashboard"
  return NextResponse.redirect(new URL(redirect, request.url))
}

  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error) {
    console.error("❌ Error finalizing session:", error.message)
  }

  const redirectUrl = new URL(request.url)
  const target = redirectUrl.searchParams.get("redirect") || "/dashboard"
  return NextResponse.redirect(new URL(target, request.url))
}