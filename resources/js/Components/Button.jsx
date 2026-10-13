const variants = {
    primary:
        'bg-black text-white hover:bg-gray-800 active:scale-95 shadow-sm',
    secondary:
        'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-sm',
    dangerGhost: 'text-red-600 hover:bg-red-50',
};

export default function Button({
    variant = 'primary',
    type = 'button',
    className = '',
    children,
    ...props
}) {
    return (
        <button
            type={type}
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
