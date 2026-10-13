import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import Button from '../../Components/Button';
import FormInput from '../../Components/FormInput';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Reset password" />

            <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/95 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Choose a new password
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Set a strong password for your account.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        required
                        autoComplete="username"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        error={errors.email}
                    />

                    <FormInput
                        label="New password"
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
                        Reset password
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
