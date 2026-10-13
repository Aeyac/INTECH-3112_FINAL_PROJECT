import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import Button from '../../Components/Button';
import FormInput from '../../Components/FormInput';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout>
            <Head title="Log in" />

            <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/95 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome back
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Sign in to your SmartStock account.
                </p>

                {status && (
                    <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        required
                        autoComplete="username"
                        placeholder="you@example.com"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        error={errors.email}
                    />

                    <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        error={errors.password}
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(event) =>
                                    setData('remember', event.target.checked)
                                }
                                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            Remember me
                        </label>

                        {canResetPassword && (
                            <Link
                                href="/forgot-password"
                                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        Sign in
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/register"
                        className="font-semibold text-slate-900 hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
