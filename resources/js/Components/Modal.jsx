import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-md',
}) {
    useEffect(() => {
        if (!open) return undefined;

        const onKey = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKey);
        document.body.classList.add('overflow-hidden');

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('overflow-hidden');
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl`}
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="group cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        title="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto py-5">{children}</div>

                {footer && (
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
