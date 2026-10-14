import { PackageOpen } from 'lucide-react';

export default function EmptyState({
    icon: Icon = PackageOpen,
    title,
    message,
    children,
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
            {message && (
                <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
            )}
            {children && <div className="mt-5">{children}</div>}
        </div>
    );
}