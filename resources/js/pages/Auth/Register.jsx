import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import Button from '../../Components/Button';
import FormInput from '../../Components/FormInput';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Register" />

            <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/95 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Create your admin account
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Registration creates an Admin workspace. Staff &amp; Manager
                    accounts are added by admins inside the app.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <FormInput
                        label="Full name"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Jane Dela Cruz"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        error={errors.name}
                    />

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
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        error={errors.password}
                    />

                    <FormInput
                        label="Confirm password"
                        name="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData('password_confirmation', event.target.value)
                        }
                        error={errors.password_confirmation}
                    />

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        Create account
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already registered?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-slate-900 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
