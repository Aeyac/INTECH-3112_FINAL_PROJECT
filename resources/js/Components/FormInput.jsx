export default function FormInput({
    label,
    name,
    error,
    required = false,
    type = 'text',
    className = '',
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
            <input
                id={name}
                name={name}
                type={type}
                className={`ss-input ${error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>
            )}
        </div>
    );
}
