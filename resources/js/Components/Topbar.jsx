import { usePage } from '@inertiajs/react';
import { Menu, User as UserIcon } from 'lucide-react';
import Badge from './Badge';

const roleVariant = {
    Admin: 'danger',
    Manager: 'info',
    Staff: 'neutral',
};

export default function Topbar({ onMenuClick }) {
    const user = usePage().props.auth?.user;
    const role = user?.roles?.[0] ?? null;

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 lg:static lg:justify-end">
            <div className="flex items-center space-x-3 lg:hidden">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="cursor-pointer text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <span className="text-lg font-bold tracking-tight text-gray-900">
                    SmartStock
                </span>
            </div>

            <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="flex items-center space-x-3">
                    <div className="text-right">
                        <div className="text-sm leading-tight font-bold text-gray-900">
                            {user?.name ?? 'Guest'}
                        </div>
                        {role && (
                            <Badge
                                variant={roleVariant[role] ?? 'neutral'}
                                className="mt-0.5 px-2.5 py-0.5 text-[10px] uppercase tracking-wide"
                            >
                                {role}
                            </Badge>
                        )}
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white md:h-9 md:w-9">
                        <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
