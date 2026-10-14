import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, RotateCcw, SearchX, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import ConfirmDialog from '../../Components/ConfirmDialog';
import EmptyState from '../../Components/EmptyState';
import FormInput from '../../Components/FormInput';
import FormSelect from '../../Components/FormSelect';
import Modal from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';
import ToggleTabs from '../../Components/ToggleTabs';
import { formatMoney } from '../../lib/format';

export default function ItemsIndex({ items, archivedItems, categories, can }) {
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [confirming, setConfirming] = useState(null);

    const form = useForm({
        name: '',
        category_id: '',
        safety_stock: '5',
        selling_price: '',
    });

    const lowStockCount = items.filter(
        (item) => Number(item.stock) < Number(item.safety_stock),
    ).length;

    const source = tab === 'archived' ? archivedItems : items;
    const term = search.trim().toLowerCase();

    const filtered = source.filter((item) => {
        const matchesSearch =
            term === '' ||
            item.name.toLowerCase().includes(term) ||
            (item.category_name ?? '').toLowerCase().includes(term);

        const matchesFilter =
            tab !== 'low_stock' ||
            Number(item.stock) < Number(item.safety_stock);

        return matchesSearch && matchesFilter;
    });

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({
            name: '',
            category_id: '',
            safety_stock: '5',
            selling_price: '',
        });
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        form.clearErrors();
        form.setData({
            name: item.name,
            category_id: String(item.category_id),
            safety_stock: String(item.safety_stock),
            selling_price: String(item.selling_price),
        });
        setModalOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();

        if (editing) {
            form.put(`/items/${editing.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            form.post('/items', { onSuccess: () => setModalOpen(false) });
        }
    };

    const remove = () => {
        router.delete(`/items/${confirming.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirming(null),
        });
    };

    const restore = (item) => {
        router.patch(`/items/${item.id}/restore`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Items" />

            <PageHeader
                title="Items Catalog"
                subtitle="Manage your inventory products, safety stocks, and pricing"
            >
                <div className="flex justify-around divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <div className="pr-4 text-center sm:pr-6 sm:text-left">
                        <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Total Items
                        </span>
                        <span className="text-base font-bold text-gray-900 sm:text-lg">
                            {items.length}
                        </span>
                    </div>
                    <div className="pl-4 text-center sm:pl-6 sm:text-left">
                        <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Low Stock Alerts
                        </span>
                        <span className="text-base font-bold text-amber-600 sm:text-lg">
                            {lowStockCount}
                        </span>
                    </div>
                </div>

                {can.manage && (
                    <Button onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        <span>Add Item</span>
                    </Button>
                )}
            </PageHeader>

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col items-stretch justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search items or categories..."
                    />

                    <ToggleTabs
                        value={tab}
                        onChange={setTab}
                        options={[
                            { label: 'All Items', value: 'all' },
                            { label: 'Low Stock', value: 'low_stock' },
                            { label: 'Archived', value: 'archived' },
                        ]}
                    />
                </div>

                <div className="hidden max-h-[500px] overflow-x-auto overflow-y-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none">
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Item Name
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Category
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Stock Level
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Safety Stock
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Selling Price
                                </th>
                                <th className="px-4 py-3.5 text-right sm:px-6">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                            {filtered.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`group transition hover:bg-gray-50/80 ${tab === 'archived' ? 'opacity-70' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3.5 text-left sm:px-6">
                                        <div className="font-bold text-gray-900 transition group-hover:text-blue-600">
                                            {item.name}
                                        </div>
                                        <div className="text-[11px] font-medium text-gray-400">
                                            ID: ITM-{item.id}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {item.category_name ?? 'Uncategorized'}
                                    </td>
                                    <td className="px-4 py-3.5 text-left sm:px-6">
                                        <StockBadge
                                            item={item}
                                            archived={tab === 'archived'}
                                        />
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {item.safety_stock}
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-bold text-gray-900 sm:px-6">
                                        {formatMoney(item.selling_price)}
                                    </td>
                                    <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-6">
                                        <div className="flex items-center justify-end space-x-1">
                                            {tab !== 'archived' && can.manage && (
                                                <>
                                                    <IconAction
                                                        title="Edit Item"
                                                        onClick={() =>
                                                            openEdit(item)
                                                        }
                                                        className="hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </IconAction>
                                                    <IconAction
                                                        title="Delete Item"
                                                        onClick={() =>
                                                            setConfirming(item)
                                                        }
                                                        className="hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </IconAction>
                                                </>
                                            )}
                                            {tab === 'archived' && can.manage && (
                                                <IconAction
                                                    title="Restore Item"
                                                    onClick={() => restore(item)}
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
                            title={
                                tab === 'archived'
                                    ? 'No archived items'
                                    : 'No items found'
                            }
                            message={
                                tab === 'archived'
                                    ? 'Deleted items will show up here.'
                                    : 'Try adjusting your search query or add a new item.'
                            }
                        />
                    )}
                </div>

                <div className="divide-y divide-gray-100 md:hidden">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className={`flex flex-col gap-2.5 p-4 transition hover:bg-gray-50/80 ${tab === 'archived' ? 'opacity-70' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate font-bold text-gray-900">
                                        {item.name}
                                    </div>
                                    <div className="text-[11px] font-medium text-gray-400">
                                        ID: ITM-{item.id}
                                    </div>
                                </div>
                                <div className="shrink-0 text-right text-sm font-bold text-gray-900">
                                    {formatMoney(item.selling_price)}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
                                <span className="max-w-[150px] truncate rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                                    {item.category_name ?? 'Uncategorized'}
                                </span>
                                <StockBadge
                                    item={item}
                                    archived={tab === 'archived'}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                                <span>
                                    Safety Stock:{' '}
                                    <strong className="text-gray-700">
                                        {item.safety_stock}
                                    </strong>
                                </span>
                                <div className="flex items-center justify-end space-x-1">
                                    {tab !== 'archived' && can.manage && (
                                        <>
                                            <IconAction
                                                title="Edit Item"
                                                onClick={() => openEdit(item)}
                                                className="hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </IconAction>
                                            <IconAction
                                                title="Delete Item"
                                                onClick={() =>
                                                    setConfirming(item)
                                                }
                                                className="hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </IconAction>
                                        </>
                                    )}
                                    {tab === 'archived' && can.manage && (
                                        <IconAction
                                            title="Restore Item"
                                            onClick={() => restore(item)}
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
                            title={
                                tab === 'archived'
                                    ? 'No archived items'
                                    : 'No items found'
                            }
                            message={
                                tab === 'archived'
                                    ? 'Deleted items will show up here.'
                                    : 'Try adjusting your search query or add a new item.'
                            }
                        />
                    )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50">
                    <Pagination
                        showing={filtered.length}
                        total={source.length}
                        label="items"
                    />
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Item' : 'Add New Item'}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={form.processing}>
                            Save Item
                        </Button>
                    </>
                }
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <FormInput
                        label="Item Name"
                        name="name"
                        required
                        placeholder="e.g. Wireless Mouse"
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        error={form.errors.name}
                    />

                    <FormSelect
                        label="Category"
                        name="category_id"
                        required
                        value={form.data.category_id}
                        onChange={(event) =>
                            form.setData('category_id', event.target.value)
                        }
                        error={form.errors.category_id}
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </FormSelect>

                    <div className="grid grid-cols-2 gap-3">
                        <FormInput
                            label="Safety Stock"
                            name="safety_stock"
                            type="number"
                            min="0"
                            required
                            placeholder="5"
                            value={form.data.safety_stock}
                            onChange={(event) =>
                                form.setData('safety_stock', event.target.value)
                            }
                            error={form.errors.safety_stock}
                        />
                        <FormInput
                            label="Selling Price"
                            name="selling_price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                            value={form.data.selling_price}
                            onChange={(event) =>
                                form.setData('selling_price', event.target.value)
                            }
                            error={form.errors.selling_price}
                        />
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(confirming)}
                onClose={() => setConfirming(null)}
                onConfirm={remove}
                title="Delete Item?"
                message={`Are you sure you want to delete "${confirming?.name}"? You can restore it later from the Archived tab.`}
                confirmLabel="Delete"
            />
        </AppLayout>
    );
}

function StockBadge({ item, archived }) {
    const current = Number(item.stock);
    const low = current < Number(item.safety_stock);

    if (archived) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                ({current}) in stock
            </span>
        );
    }

    if (low) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                Low Stock ({current})
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            ({current}) in stock
        </span>
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
