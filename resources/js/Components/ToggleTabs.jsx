export default function ToggleTabs({ options, value, onChange }) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {options.map((option) => {
                const active = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${active
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
