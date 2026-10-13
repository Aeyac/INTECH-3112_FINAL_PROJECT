const variants = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    inactive: 'bg-gray-100 text-gray-500 border-gray-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
    info: 'bg-blue-50 text-blue-600 border-blue-100',
};

export default function Badge({ variant = 'neutral', className = '', children }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${variants[variant] ?? variants.neutral} ${className}`}
        >
            {children}
        </span>
    );
}
