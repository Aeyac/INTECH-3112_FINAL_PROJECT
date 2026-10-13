import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FlashToasts() {
    const flash = usePage().props.flash ?? {};
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (!flash.id) return;

        const incoming = [];

        if (flash.success) {
            incoming.push({ id: `${flash.id}-s`, type: 'success', message: flash.success });
        }

        if (flash.error) {
            incoming.push({ id: `${flash.id}-e`, type: 'error', message: flash.error });
        }

        if (!incoming.length) return;

        setToasts((current) => {
            const ids = new Set(current.map((toast) => toast.id));
            return [...current, ...incoming.filter((toast) => !ids.has(toast.id))];
        });
    }, [flash.id, flash.success, flash.error]);

    useEffect(() => {
        if (!toasts.length) return undefined;

        const timer = setTimeout(() => {
            setToasts((current) => current.slice(1));
        }, 4000);

        return () => clearTimeout(timer);
    }, [toasts]);

    if (!toasts.length) return null;

    return (
        <div className="fixed right-4 bottom-4 z-[60] flex w-full max-w-xs flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${toast.type === 'success'
                            ? 'border-emerald-100'
                            : 'border-red-100'
                        }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    )}
                    <p className="text-sm font-medium text-slate-700">
                        {toast.message}
                    </p>
                </div>
            ))}
        </div>
    );
}
