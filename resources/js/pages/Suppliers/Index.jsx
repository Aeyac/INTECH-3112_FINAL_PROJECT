import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, RotateCcw, SearchX, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import ConfirmDialog from '../../Components/ConfirmDialog';
import EmptyState from '../../Components/EmptyState';
import FormInput from '../../Components/FormInput';
import Modal from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';
import ToggleTabs from '../../Components/ToggleTabs';
import { formatDate } from '../../lib/format';

const emptyForm = { name: '', contact_number: '', email: '' };

export default function SuppliersIndex({
    suppliers,
    archivedSuppliers,
    can,
}) {
    const [tab, setTab] = useState('active');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [confirming, setConfirming] = useState(null);

    const form = useForm({ ...emptyForm });

    const source = tab === 'active' ? suppliers : archivedSuppliers;
    const term = search.trim().toLowerCase();
    const filtered = source.filter(
        (supplier) =>
            supplier.name.toLowerCase().includes(term) ||
            supplier.email.toLowerCase().includes(term) ||
            supplier.contact_number.toLowerCase().includes(term),
    );

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({ ...emptyForm });
        setModalOpen(true);
    };

    const openEdit = (supplier) => {
        setEditing(supplier);
        form.clearErrors();
        form.setData({
            name: supplier.name,
            contact_number: supplier.contact_number,
            email: supplier.email,
        });
        setModalOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();

        if (editing) {
            form.put(`/suppliers/${editing.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            form.post('/suppliers', {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const archive = () => {
        router.delete(`/suppliers/${confirming.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirming(null),
        });
    };

    const restore = (supplier) => {
        router.patch(`/suppliers/${supplier.id}/restore`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Suppliers" />

            <PageHeader
                title="Suppliers"
                subtitle="Manage your global procurement network and vendor contacts"
            >
                <div className="flex justify-around divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <div className="pr-4 text-center sm:pr-6 sm:text-left">
                        <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Total Suppliers
                        </span>
                        <span className="text-base font-bold text-gray-900 sm:text-lg">
                            {suppliers.length}
                        </span>
                    </div>
                    <div className="pl-4 text-center sm:pl-6 sm:text-left">
                        <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Archived
                        </span>
                        <span className="text-base font-bold text-gray-500 sm:text-lg">
                            {archivedSuppliers.length}
                        </span>
                    </div>
                </div>

                {can.manage && (
                    <Button onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        <span>Add Supplier</span>
                    </Button>
                )}
            </PageHeader>

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col items-stretch justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search Suppliers..."
                    />

                    <ToggleTabs
                        value={tab}
                        onChange={setTab}
                        options={[
                            { label: 'Suppliers', value: 'active' },
                            { label: 'Archived', value: 'archived' },
                        ]}
                    />
                </div>

                <div className="hidden max-h-[500px] overflow-x-auto overflow-y-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none">
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Supplier Name
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Contact Number
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Email Address
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Added
                                </th>
                                <th className="px-4 py-3.5 text-right sm:px-6">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                            {filtered.map((supplier) => (
                                <tr
                                    key={supplier.id}
                                    className={`group transition hover:bg-gray-50/80 ${tab === 'archived' ? 'opacity-70' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3.5 text-left sm:px-6">
                                        <div className="font-bold text-gray-900 transition group-hover:text-blue-600">
                                            {supplier.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {supplier.contact_number}
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {supplier.email}
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {formatDate(supplier.created_at)}
                                    </td>
                                    <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-6">
                                        <div className="flex items-center justify-end space-x-1">
                                            {tab === 'active' && can.manage && (
                                                <>
                                                    <IconAction
                                                        title="Edit Supplier"
                                                        onClick={() =>
                                                            openEdit(supplier)
                                                        }
                                                        className="hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </IconAction>
                                                    <IconAction
                                                        title="Archive Supplier"
                                                        onClick={() =>
                                                            setConfirming(supplier)
                                                        }
                                                        className="hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </IconAction>
                                                </>
                                            )}
                                            {tab === 'archived' && can.manage && (
                                                <IconAction
                                                    title="Restore Supplier"
                                                    onClick={() => restore(supplier)}
                                                    className="hover:bg-emerald-50 hover:text-emerald-600"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </IconAction>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={SearchX}
                            title="No suppliers found"
                            message="Try adjusting your search query or add a new supplier."
                        />
                    )}
                </div>

                <div className="divide-y divide-gray-100 md:hidden">
                    {filtered.map((supplier) => (
                        <div
                            key={supplier.id}
                            className={`flex flex-col gap-2.5 p-4 transition hover:bg-gray-50/80 ${tab === 'archived' ? 'opacity-70' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate font-bold text-gray-900">
                                        {supplier.name}
                                    </div>
                                    <div className="text-[11px] font-medium text-gray-400">
                                        {supplier.contact_number}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {tab === 'active' && can.manage && (
                                        <>
                                            <IconAction
                                                title="Edit Supplier"
                                                onClick={() => openEdit(supplier)}
                                                className="hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </IconAction>
                                            <IconAction
                                                title="Archive Supplier"
                                                onClick={() =>
                                                    setConfirming(supplier)
                                                }
                                                className="hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </IconAction>
                                        </>
                                    )}
                                    {tab === 'archived' && can.manage && (
                                        <IconAction
                                            title="Restore Supplier"
                                            onClick={() => restore(supplier)}
                                            className="hover:bg-emerald-50 hover:text-emerald-600"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </IconAction>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                {supplier.email}
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={SearchX}
                            title="No suppliers found"
                            message="Try adjusting your search query or add a new supplier."
                        />
                    )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50">
                    <Pagination
                        showing={filtered.length}
                        total={source.length}
                        label="suppliers"
                    />
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Supplier' : 'Add Supplier'}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={form.processing}>
                            {editing ? 'Save Changes' : 'Save Supplier'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <FormInput
                        label="Supplier Name"
                        name="name"
                        required
                        placeholder="e.g. Acme Trading Co."
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        error={form.errors.name}
                    />
                    <FormInput
                        label="Contact Number"
                        name="contact_number"
                        required
                        inputMode="numeric"
                        placeholder="e.g. 09171234567"
                        value={form.data.contact_number}
                        onChange={(event) =>
                            form.setData(
                                'contact_number',
                                event.target.value.replace(/\D/g, ''),
                            )
                        }
                        error={form.errors.contact_number}
                    />
                    <FormInput
                        label="Email Address"
                        name="email"
                        type="email"
                        required
                        placeholder="supplier@example.com"
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData('email', event.target.value)
                        }
                        error={form.errors.email}
                    />
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(confirming)}
                onClose={() => setConfirming(null)}
                onConfirm={archive}
                title="Archive Supplier?"
                message={`Are you sure you want to archive "${confirming?.name}"? You can restore it later from the Archived tab.`}
                confirmLabel="Yes, archive it"
            />
        </AppLayout>
    );
}

function IconAction({ title, onClick, className = '', children }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`cursor-pointer rounded-lg p-1.5 text-gray-400 transition ${className}`}
        >
            {children}
        </button>
    );
}
