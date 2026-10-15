export default function Card({
    className = '',
    padded = true,
    children,
    ...props
}) {
    return (
        <div
            className={`rounded-xl border border-gray-200 bg-white shadow-sm ${padded ? 'p-5 md:p-6' : ''
                } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
