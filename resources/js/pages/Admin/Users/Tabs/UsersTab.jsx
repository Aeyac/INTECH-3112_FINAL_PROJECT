import { router, useForm, usePage } from '@inertiajs/react';
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../../../Components/Badge';
import Button from '../../../../Components/Button';
import ConfirmDialog from '../../../../Components/ConfirmDialog';
import FormInput from '../../../../Components/FormInput';
import FormSelect from '../../../../Components/FormSelect';
import Modal from '../../../../Components/Modal';
import Pagination from '../../../../Components/Pagination';

const emptyForm = {
    name: '',
    email: '',
    password: '',
    role: '',
};

const roleVariant = {
    Admin: 'danger',
    Manager: 'info',
    Staff: 'neutral',
};

export default function UsersTab({ users, roles }) {
    const currentUserId = usePage().props.auth?.user?.id;
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [confirming, setConfirming] = useState(null);

    const isAdmin = (user) => (user.roles ?? []).includes('Admin');
    const isEditingAdmin = isAdmin(editing ?? { roles: [] });

    const form = useForm({ ...emptyForm });

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({ ...emptyForm, role: roles[0] ?? '' });
        setModalOpen(true);
    };

    const openEdit = (user) => {
        setEditing(user);
        form.clearErrors();
        form.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles[0] ?? '',
        });
        setModalOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();

        if (editing) {
            form.put(`/admin/users/${editing.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            form.post('/admin/users', {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const remove = () => {
        router.delete(`/admin/users/${confirming.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirming(null),
        });
    };

    return (
        <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex justify-around divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <div className="pr-4 text-center sm:pr-6 sm:text-left">
                        <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Total Users
                        </span>
                        <span className="text-base font-bold text-gray-900 sm:text-lg">
                            {users.length}
                        </span>
                    </div>
                </div>

                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    <span>Add User</span>
                </Button>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none">
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Name
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Email
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Role
                                </th>
                                <th className="px-4 py-3.5 text-right sm:px-6">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="group transition hover:bg-gray-50/80"
                                >
                                    <td className="px-4 py-3.5 text-left sm:px-6">
                                        <div className="font-bold text-gray-900 transition group-hover:text-blue-600">
                                            {user.name}
                                        </div>
                                        {user.id === currentUserId && (
                                            <div className="text-[11px] font-medium text-gray-400">
                                                You
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3.5 text-left sm:px-6">
                                        <div className="flex flex-wrap items-center gap-1">
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant={
                                                        roleVariant[role] ??
                                                        'neutral'
                                                    }
                                                >
                                                    {role}
                                                </Badge>
                                            ))}
                                            <span className="ml-1 text-[11px] font-medium text-gray-400">
                                                {user.permission_count}{' '}
                                                permissions
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-6">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                type="button"
                                                title="Edit User"
                                                onClick={() => openEdit(user)}
                                                className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete User"
                                                disabled={
                                                    user.id === currentUserId ||
                                                    isAdmin(user)
                                                }
                                                onClick={() =>
                                                    setConfirming(user)
                                                }
                                                className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="divide-y divide-gray-100 md:hidden">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="flex flex-col gap-2.5 p-4 transition hover:bg-gray-50/80"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate font-bold text-gray-900">
                                        {user.name}
                                    </div>
                                    <div className="text-[11px] font-medium text-gray-400">
                                        {user.email}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        title="Edit User"
                                        onClick={() => openEdit(user)}
                                        className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete User"
                                        disabled={user.id === currentUserId || isAdmin(user)}
                                        onClick={() => setConfirming(user)}
                                        className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                                {user.roles.map((role) => (
                                    <Badge
                                        key={role}
                                        variant={roleVariant[role] ?? 'neutral'}
                                    >
                                        {role}
                                    </Badge>
                                ))}
                                <span className="ml-1 text-[11px] font-medium text-gray-400">
                                    {user.permission_count} permissions
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 bg-gray-50">
                    <Pagination
                        showing={users.length}
                        total={users.length}
                        label="users"
                    />
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit User' : 'Add User'}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={form.processing}>
                            {editing ? 'Save Changes' : 'Create User'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <FormInput
                        label="Full Name"
                        name="name"
                        required
                        placeholder="Jane Dela Cruz"
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        error={form.errors.name}
                    />
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData('email', event.target.value)
                        }
                        error={form.errors.email}
                    />
                    <FormInput
                        label={
                            editing
                                ? 'Password (leave blank to keep current)'
                                : 'Password'
                        }
                        name="password"
                        type="password"
                        required={!editing}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData('password', event.target.value)
                        }
                        error={form.errors.password}
                    />
                    {isEditingAdmin ? (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                            <span className="text-sm font-medium text-slate-700">
                                Role
                            </span>
                            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                <Lock className="h-3.5 w-3.5" />
                                Admin &middot; registered account
                            </span>
                        </div>
                    ) : (
                        <FormSelect
                            label="Role"
                            name="role"
                            required
                            value={form.data.role}
                            onChange={(event) =>
                                form.setData('role', event.target.value)
                            }
                            error={form.errors.role}
                        >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </FormSelect>
                    )}
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(confirming)}
                onClose={() => setConfirming(null)}
                onConfirm={remove}
                title="Delete User?"
                message={`Are you sure you want to delete "${confirming?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
            />
        </div>
    );
}