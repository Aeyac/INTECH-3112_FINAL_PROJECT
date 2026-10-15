import { router } from '@inertiajs/react';
import { Check, Lock, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../../../Components/Button';
import FormCheckbox from '../../../../Components/FormCheckbox';

const EDITABLE_ROLES = ['Manager', 'Staff'];

function flattenMatrix(permissionMatrix) {
    const map = {};

    permissionMatrix.forEach((group) => {
        group.permissions.forEach((permission) => {
            map[permission.name] = {
                Manager: permission.roles.includes('Manager'),
                Staff: permission.roles.includes('Staff'),
            };
        });
    });

    return map;
}

export default function RolesTab({ permissionMatrix }) {
    const [matrix, setMatrix] = useState(() => flattenMatrix(permissionMatrix));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const dirty = useMemo(
        () =>
            JSON.stringify(flattenMatrix(permissionMatrix)) !==
            JSON.stringify(matrix),
        [matrix, permissionMatrix]
    );

    const toggle = (name, role) => {
        setMatrix((prev) => ({
            ...prev,
            [name]: { ...prev[name], [role]: !prev[name][role] },
        }));
    };

    const save = () => {
        setError(null);
        setSaving(true);

        const payload = Object.fromEntries(
            Object.entries(matrix).map(([name, roles]) => [
                name,
                EDITABLE_ROLES.filter((role) => roles[role]),
            ])
        );

        router.put(
            '/admin/roles',
            { permissions: payload },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(false);
                    setMatrix(flattenMatrix(permissionMatrix));
                },
                onError: (err) => {
                    setError(Object.values(err || {}).join(' '));
                    setSaving(false);
                },
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <div>
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                    Toggle which permissions each role can use. Changes take
                    effect immediately for every user with that role.
                </p>
                <div className="flex items-center gap-3">
                    {dirty && (
                        <span className="text-xs font-semibold text-amber-600">
                            Unsaved changes
                        </span>
                    )}
                    <Button
                        onClick={save}
                        disabled={!dirty || saving}
                        className={!dirty ? 'opacity-40' : ''}
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving…' : 'Save Permissions'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                    {error}
                </div>
            )}

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="max-h-[560px] overflow-x-auto overflow-y-auto">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none">
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Permission
                                </th>
                                <th className="w-24 px-4 py-3.5 text-center sm:px-6">
                                    Admin
                                </th>
                                <th className="w-24 px-4 py-3.5 text-center sm:px-6">
                                    Manager
                                </th>
                                <th className="w-24 px-4 py-3.5 text-center sm:px-6">
                                    Staff
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                            {permissionMatrix.map((group) => (
                                <GroupRows
                                    key={group.module}
                                    module={group.module}
                                    permissions={group.permissions}
                                    matrix={matrix}
                                    onToggle={toggle}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Lock className="h-3.5 w-3.5" />
                        Admin always holds every permission and cannot be edited.
                    </p>
                    <p className="text-xs text-gray-400">
                        {permissionMatrix.reduce(
                            (total, group) => total + group.permissions.length,
                            0
                        )}{' '}
                        capabilities
                    </p>
                </div>
            </div>
        </div>
    );
}

function GroupRows({
    module,
    permissions,
    matrix,
    onToggle,
}) {
    return (
        <>
            <tr className="bg-gray-50/60">
                <td
                    colSpan={4}
                    className="px-4 py-2 text-[11px] font-bold tracking-wider text-gray-500 uppercase sm:px-6"
                >
                    {module}
                </td>
            </tr>
            {permissions.map((permission) => (
                <tr
                    key={permission.name}
                    className="transition hover:bg-gray-50/80"
                >
                    <td className="px-4 py-3 text-left sm:px-6">
                        <div className="font-semibold text-gray-900">
                            {permission.label}
                        </div>
                        <div className="text-[11px] font-medium text-gray-400">
                            {permission.name}
                        </div>
                    </td>
                    <td className="px-4 py-3 text-center sm:px-6">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Granted to Admin</span>
                        </span>
                    </td>
                    {EDITABLE_ROLES.map((role) => (
                        <td
                            key={role}
                            className="px-4 py-3 text-center sm:px-6"
                        >
                            <FormCheckbox
                                aria-label={`${role} ${permission.name}`}
                                checked={Boolean(matrix[permission.name]?.[role])}
                                onChange={() => onToggle(permission.name, role)}
                                className="justify-center"
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}