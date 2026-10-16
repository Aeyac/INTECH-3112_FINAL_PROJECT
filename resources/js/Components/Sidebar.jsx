import { Link, usePage } from '@inertiajs/react';
import { LogOut, X } from 'lucide-react';
import { useCan, useIsAdmin } from '../lib/auth';
import { navItems } from '../lib/nav';

export default function Sidebar({ open, onClose }) {
    const { url } = usePage();
    const can = useCan();
    const isAdmin = useIsAdmin();

    const visibleItems = navItems.filter((item) =>
        item.role ? isAdmin : can(item.permission),
    );

    const isActive = (href) =>
        url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);

    return (
        <>
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:shrink-0 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div>
                    <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            SmartStock
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer text-gray-500 hover:text-gray-700 lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="space-y-1 p-4">
                        {visibleItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm transition ${active
                                        ? 'bg-gray-100 font-semibold text-gray-900'
                                        : 'font-medium text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-gray-100 p-4">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full cursor-pointer items-center space-x-3 rounded-lg bg-red-50/50 px-4 py-3 text-sm font-semibold text-red-600 transition duration-150 hover:bg-red-100 hover:text-red-700"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Log Out</span>
                    </Link>
                </div>
            </aside>

            {open && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}
        </>
    );
}
