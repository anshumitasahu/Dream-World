import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import z from 'zod'
import GoogleSignInButton from '../../components/ui/auth/GoogleSignInButton'
import { useLogin } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../lib/api'
import { getToken } from '../../lib/auth'
import { loginSchema } from '../../sharedTypes/auth/auth.model'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: '/chat/new' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const login = useLogin()
  const [form, setForm] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = loginSchema.safeParse(form)
    if (!parsed.success) {
      const { fieldErrors: zodFieldErrors } = z.flattenError(parsed.error)
      const nextErrors: Record<string, string> = {}
      for (const [key, messages] of Object.entries(zodFieldErrors)) {
        if (messages && messages.length > 0) nextErrors[key] = messages[0]
      }
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})
    login.mutate(parsed.data)
  }

  return (
    <div className='flex min-h-screen bg-black text-white'>
      <div className='flex w-full flex-col px-6 py-6 sm:px-12 lg:w-2/5'>
        <div className='flex flex-1 items-center justify-center py-12'>
          <div className='w-full max-w-sm'>
            <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
            <p className='mt-1 text-sm text-white/50'>Please sign in to your account</p>

            <form onSubmit={handleSubmit} className='mt-8 flex flex-col gap-4'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='email' className='text-xs font-semibold text-white/80'>
                  Email address
                </label>
                <input
                  id='email'
                  type='email'
                  autoComplete='email'
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className='w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-400/60 focus:bg-white/10'
                />
                {fieldErrors.email && <p className='text-xs text-red-400'>{fieldErrors.email}</p>}
              </div>

              <div className='flex flex-col gap-1.5'>
                <div className='flex items-center justify-between'>
                  <label htmlFor='password' className='text-xs font-semibold text-white/80'>
                    Password
                  </label>
                </div>
                <input
                  id='password'
                  type='password'
                  autoComplete='current-password'
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className='w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-400/60 focus:bg-white/10'
                />
                {fieldErrors.password && (
                  <p className='text-xs text-red-400'>{fieldErrors.password}</p>
                )}
              </div>

              <label className='flex cursor-pointer items-center gap-2 text-xs text-white/60'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className='h-3.5 w-3.5 rounded accent-white'
                />
                Remember me
              </label>

              {login.isError && (
                <p className='text-sm text-red-400'>{getApiErrorMessage(login.error)}</p>
              )}

              <button
                type='submit'
                disabled={login.isPending}
                className='w-full rounded-full bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-blue-100 disabled:opacity-50'
              >
                {login.isPending ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className='my-6 flex items-center gap-3 text-xs text-white/30'>
              <span className='h-px flex-1 bg-white/15' />
              or continue with
              <span className='h-px flex-1 bg-white/15' />
            </div>

            <GoogleSignInButton />

            <p className='mt-8 text-center text-sm text-white/50'>
              Don&apos;t have an account?{' '}
              <Link
                to='/auth/signup'
                className='font-medium text-white underline underline-offset-4 hover:text-blue-300'
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className='relative hidden lg:block lg:w-3/5'>
        <img src='/img/bg.jpg' alt='' className='absolute inset-0 h-full w-full object-cover' />
      </div>
    </div>
  )
}
