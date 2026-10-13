import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import Button from '../../Components/Button';
import FormInput from '../../Components/FormInput';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/forgot-password');
    };

    return (
        <AuthLayout>
            <Head title="Forgot password" />

            <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/95 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Reset your password
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Enter your email and we&apos;ll send you a reset link.
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

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        Email password reset link
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    <Link
                        href="/login"
                        className="font-semibold text-slate-900 hover:underline"
                    >
                        Back to sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
