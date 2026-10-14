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

export default function CategoriesIndex({ categories, archivedCategories, can }) {
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [confirming, setConfirming] = useState(null);

    const form = useForm({ name: '' });

    const source = tab === 'all' ? categories : archivedCategories;
    const term = search.trim().toLowerCase();
    const filtered = source.filter((category) =>
        category.name.toLowerCase().includes(term),
    );

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.reset();
        setModalOpen(true);
    };

    const openEdit = (category) => {
        setEditing(category);
        form.clearErrors();
        form.setData('name', category.name);
        setModalOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();

        if (editing) {
            form.put(`/categories/${editing.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            form.post('/categories', {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const archive = () => {
        router.delete(`/categories/${confirming.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirming(null),
        });
    };

    const restore = (category) => {
        router.patch(`/categories/${category.id}/restore`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Categories" />

            <PageHeader
                title="Categories"
                subtitle="Organize and manage product categories for better inventory classification"
            >
                <div className="flex justify-around divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <div className="pr-4 text-center sm:pr-6 sm:text-left">
                        <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Total Categories
                        </span>
                        <span className="font-bold text-gray-900 sm:text-lg">
                            {categories.length}
                        </span>
                    </div>
                </div>

                {can.manage && (
                    <Button onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        <span>Add Category</span>
                    </Button>
                )}
            </PageHeader>

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col items-stretch justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search Categories..."
                    />

                    <ToggleTabs
                        value={tab}
                        onChange={setTab}
                        options={[
                            { label: 'All', value: 'all' },
                            { label: 'Archived', value: 'archived' },
                        ]}
                    />
                </div>

                <div className="hidden max-h-[500px] overflow-x-auto overflow-y-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none">
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Category Name
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Created At
                                </th>
                                <th className="px-4 py-3.5 text-right sm:px-6">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                            {filtered.map((category) => (
                                <tr
                                    key={category.id}
                                    className={`group transition hover:bg-gray-50/80 ${tab === 'archived' ? 'opacity-70' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3.5 text-left sm:px-6">
                                        <div className="font-bold text-gray-900 transition group-hover:text-blue-600">
                                            {category.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {formatDate(category.created_at)}
                                    </td>
                                    <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-6">
                                        <div className="flex items-center justify-end space-x-1">
                                            {tab === 'all' && can.manage && (
                                                <>
                                                    <IconAction
                                                        title="Edit Category"
                                                        onClick={() =>
                                                            openEdit(category)
                                                        }
                                                        className="hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </IconAction>
                                                    <IconAction
                                                        title="Archive Category"
                                                        onClick={() =>
                                                            setConfirming(category)
                                                        }
                                                        className="hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </IconAction>
                                                </>
                                            )}
                                            {tab === 'archived' && can.manage && (
                                                <IconAction
                                                    title="Restore Category"
                                                    onClick={() => restore(category)}
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
                            title="No categories found"
                            message="Try adjusting your search query or add a new category."
                        />
                    )}
                </div>

                <div className="divide-y divide-gray-100 md:hidden">
                    {filtered.map((category) => (
                        <div
                            key={category.id}
                            className={`flex flex-col gap-2.5 p-4 transition hover:bg-gray-50/80 ${tab === 'archived' ? 'opacity-70' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate font-bold text-gray-900">
                                        {category.name}
                                    </div>
                                    <div className="text-[11px] font-medium text-gray-400">
                                        {formatDate(category.created_at)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {tab === 'all' && can.manage && (
                                        <>
                                            <IconAction
                                                title="Edit Category"
                                                onClick={() => openEdit(category)}
                                                className="hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </IconAction>
                                            <IconAction
                                                title="Archive Category"
                                                onClick={() =>
                                                    setConfirming(category)
                                                }
                                                className="hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </IconAction>
                                        </>
                                    )}
                                    {tab === 'archived' && can.manage && (
                                        <IconAction
                                            title="Restore Category"
                                            onClick={() => restore(category)}
                                            className="hover:bg-emerald-50 hover:text-emerald-600"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </IconAction>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={SearchX}
                            title="No categories found"
                            message="Try adjusting your search query or add a new category."
                        />
                    )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50">
                    <Pagination
                        showing={filtered.length}
                        total={source.length}
                        label="categories"
                    />
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Category' : 'Add Category'}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={form.processing}>
                            {editing ? 'Save Changes' : 'Save Category'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={submit}>
                    <FormInput
                        label="Category Name"
                        name="name"
                        required
                        placeholder="e.g. Electronics"
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        error={form.errors.name}
                    />
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(confirming)}
                onClose={() => setConfirming(null)}
                onConfirm={archive}
                title="Archive Category?"
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
