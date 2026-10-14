export default function PageHeader({ title, subtitle, children }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3">{children}</div>
            )}
        </div>
    );
}
