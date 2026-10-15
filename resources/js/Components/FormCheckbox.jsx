export default function FormCheckbox({
    label,
    name,
    hint,
    className = '',
    ...props
}) {
    return (
        <label
            className={`flex cursor-pointer items-center gap-2.5 ${className || ''
                }`}
        >
            <input
                type="checkbox"
                name={name}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-black accent-black focus:ring-2 focus:ring-black focus:ring-offset-0"
                {...props}
            />
            {label && (
                <span className="text-sm font-medium text-gray-700">
                    {label}
                </span>
            )}
            {hint && <span className="text-xs text-gray-400">{hint}</span>}
        </label>
    );
}