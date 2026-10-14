export default function FormSelect({
    label,
    name,
    error,
    required = false,
    className = '',
    children,
    ...props
}) {
    return (
        <div className="flex flex-col">
            {label && (
                <label className="ss-label" htmlFor={name}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                className={`ss-input cursor-pointer ${error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''} ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>
            )}
        </div>
    );
}
