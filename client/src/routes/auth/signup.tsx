import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from 'react';
import z from 'zod'
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { useSignup } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../libs/api";
import { getToken } from "../../libs/auth";
import { signupSchema } from "../../sharedTypes/auth/auth.model";

export const Route = createFileRoute('/auth/signup')({
    beforeLoad: () => {
        if (getToken()) {
            throw redirect({ to: '/chat/new' })
        }
    },
    component: SignupPage,
})

function SignupPage() {
    const signup = useSignup();
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const parsed = signupSchema.safeParse(form)
        if (!parsed.success) {
            const { fieldErrors: zodFIeldErrors } = z.flattenError(parsed.error)
            const nextErrors: Record<string, string> = {}
            for (const [key, messages] of Object.entries(zodFIeldErrors)) {
                if (messages && messages.length > 0) nextErrors[key] = messages[0]
            }
            setFieldErrors(nextErrors)
            return
        }
        setFieldErrors({})
        signup.mutate(parsed.data)
    }

    return (
        <div className="w-full min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col gap-1 text-center">
                    <h1 className="text-2xl font-semibold">
                        Create your account
                    </h1>
                    <p className="text-sm text-white/50">
                        Start building your dreamworld
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-1">
                        <input
                            type='text'
                            placeholder="name"
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 outline-none placeholder--white/40 focus:border-white/40"
                        />
                        {fieldErrors.name && <p className="text-xs text-red-400">{fieldErrors.name}</p>}
                    </div>
                    <div className="flex flex-col ga-1">
                        <input
                            type='email'
                            placeholder='email'
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2outline-none placeholder-white/40 focus:border-white/40"
                        />
                        {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email}</p>}
                    </div>
                    {signup.isError && <p className="text-sm text-red-400">{getApiErrorMessage(signup.error)}</p>}
                    <button
                        type="submit"
                        disabled={signup.isPending}
                        className="rounded-lg bg-white py-2 font-medium text-black hover:bg-white/80 disabled:opacity-50"
                    >
                        {signup.isPending ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <div className="flex items-center gap-3 text-xs text-white/30">
                    <span className="h-px flex-1 bg-white/15" />
                    or
                    <span className="h-px flex-1 bg-white/15" />
                </div>

                <GoogleSignInButton />

                <p className="text-center text-sm text-white/50">
                    Already have an account?{' '}
                    <Link
                        to='/auth/login'
                        className="text-white underline underline-offset-4"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}