import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import z from "zod";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { useLogin } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../libs/api";
import { getToken } from "../../libs/auth";
import { loginSchema } from "../../sharedTypes/auth/auth.model";

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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    function handleSubmit(event: FromEvent<HTMLFormElement>) {
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
        <div className="w-full min-h-screen bg-black text-white flex-items-center justify-center p-4">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col gap-1 text-center">
                    <h1 className="text-2xl font-semibold">
                        Welcome back!
                    </h1>
                    <p className="text-sm text-white/50">
                        Login to your dream world
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <input
                            type="email"
                            placeholder="email"
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                            className="w-full rounded;lg border vorder-white/15 bg-white/15 px-4 py-2 outline-none placeholder-white/40 focus:border-white/40"
                        />
                        {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email}</p>}
                    </div>
                    {login.isError && <p className="text-sm text-red-400">{getApiErrorMessage(login.error)}</p>}
                    <button
                        type="submit"
                        disabled={login.isPending}
                        className="rounded-lg bg-white py-2 font-medium text-black hover:bg-white/80 disabled:opacity-50"
                    >
                        {login.isPending ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="flex items-center gap-3 text-xs text-white">
                    <span className="h-px flex-1 bg-white/15" />
                    or
                    <span className="h-px flex-1 bg-white/15" />
                </div>
                <GoogleSignInButton />
                <p className="text-center text-sm text-white/50">
                    No account?{' '}
                    <Link to='/auth/signup' className="text-white underline wnderline-offset-4">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}