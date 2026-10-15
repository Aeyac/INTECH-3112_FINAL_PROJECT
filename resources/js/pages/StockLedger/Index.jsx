import { Head, router } from '@inertiajs/react';
import { Plus, SearchX } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import EmptyState from '../../Components/EmptyState';
import FormInput from '../../Components/FormInput';
import FormSelect from '../../Components/FormSelect';
import Modal from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';
import ToggleTabs from '../../Components/ToggleTabs';
import { formatDateTime, formatNumber } from '../../lib/format';

const typeStyles = {
    purchase: { label: 'Purchase', className: 'text-emerald-600' },
    sale: { label: 'Sale', className: 'text-rose-600' },
    adjustment: { label: 'Adjustment', className: 'text-amber-600' },
};

export default function StockLedgerIndex({ entries, items, can }) {
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [itemId, setItemId] = useState('');
    const [quantityChange, setQuantityChange] = useState('');

    const term = search.trim().toLowerCase();
    const filtered = entries.filter((entry) => {
        const matchesFilter = tab === 'all' || entry.type === tab;
        const entryId = String(entry.id).toLowerCase();

        const matchesSearch =
            term === '' ||
            (entry.item_name ?? '').toLowerCase().includes(term) ||
            entryId.includes(term) ||
            `sl-${entryId}`.includes(term);

        return matchesFilter && matchesSearch;
    });

    const selectedItem = items.find(
        (item) => String(item.id) === String(itemId),
    );
    const resultingStock =
        selectedItem && quantityChange !== ''
            ? Number(selectedItem.stock) + Number(quantityChange)
            : null;

    const openForm = () => {
        setErrors({});
        setItemId('');
        setQuantityChange('');
        setFormOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();
        setErrors({});

        router.post(
            '/stock-ledger',
            {
                item_id: itemId,
                quantity_change: Number(quantityChange),
            },
            {
                preserveScroll: true,
                onError: setErrors,
                onSuccess: () => setFormOpen(false),
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Stock Ledger" />

            <PageHeader
                title="Stock Ledger"
                subtitle="Maintain a complete audit trail of incoming and outgoing inventory movements."
            >
                {can.adjust && (
                    <Button onClick={openForm}>
                        <Plus className="h-4 w-4" />
                        <span>Add Adjustment</span>
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
                            { label: 'All', value: 'all' },
                            { label: 'Purchases', value: 'purchase' },
                            { label: 'Sales', value: 'sale' },
                            { label: 'Adjustment', value: 'adjustment' },
                        ]}
                    />
                </div>

                <div className="hidden max-h-[500px] overflow-x-auto overflow-y-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none">
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Transaction ID
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Movement Type
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Item Name
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Quantity Change
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Stock After
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                            {filtered.map((entry) => {
                                const meta =
                                    typeStyles[entry.type] ??
                                    typeStyles.adjustment;
                                const positive =
                                    Number(entry.quantity_change) > 0;

                                return (
                                    <tr
                                        key={entry.id}
                                        className="group transition hover:bg-gray-50/80"
                                    >
                                        <td className="px-4 py-3.5 text-left sm:px-6">
                                            <div className="font-bold text-gray-900 transition group-hover:text-blue-600">
                                                SL-{entry.id}
                                            </div>
                                            <div className="text-[11px] font-medium text-gray-400">
                                                {formatDateTime(
                                                    entry.created_at,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-left sm:px-6">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${meta.className}`}
                                            >
                                                {meta.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                            {entry.item_name}
                                        </td>
                                        <td
                                            className={`px-4 py-3.5 text-left font-semibold sm:px-6 ${positive
                                                ? 'text-emerald-600'
                                                : 'text-rose-600'
                                                }`}
                                        >
                                            {positive ? '+' : ''}
                                            {formatNumber(entry.quantity_change)}
                                        </td>
                                        <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                            {formatNumber(entry.balance_after)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={SearchX}
                            title="No ledger entries found"
                            message="Try adjusting your search or filter."
                        />
                    )}
                </div>

                <div className="divide-y divide-gray-100 md:hidden">
                    {filtered.map((entry) => {
                        const meta =
                            typeStyles[entry.type] ?? typeStyles.adjustment;
                        const positive = Number(entry.quantity_change) > 0;

                        return (
                            <div
                                key={entry.id}
                                className="flex flex-col gap-2.5 p-4 transition hover:bg-gray-50/80"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="truncate font-bold text-gray-900">
                                            SL-{entry.id}
                                        </div>
                                        <div className="text-[11px] font-medium text-gray-400">
                                            {formatDateTime(entry.created_at)}
                                        </div>
                                    </div>
                                    <span
                                        className={`shrink-0 text-xs font-semibold ${meta.className}`}
                                    >
                                        {meta.label}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-1 text-sm">
                                    <span className="truncate font-medium text-gray-600">
                                        {entry.item_name}
                                    </span>
                                    <span
                                        className={`shrink-0 font-semibold ${positive
                                            ? 'text-emerald-600'
                                            : 'text-rose-600'
                                            }`}
                                    >
                                        {positive ? '+' : ''}
                                        {formatNumber(entry.quantity_change)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs font-medium text-gray-400">
                                    <span>Stock after</span>
                                    <span className="font-semibold text-gray-700">
                                        {formatNumber(entry.balance_after)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={SearchX}
                            title="No ledger entries found"
                            message="Try adjusting your search or filter."
                        />
                    )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50">
                    <Pagination
                        showing={filtered.length}
                        total={entries.length}
                        label="ledgers"
                    />
                </div>
            </div>

            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                title="Add Stock Adjustment"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit}>Save Adjustment</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <FormSelect
                        label="Item"
                        name="item_id"
                        required
                        value={itemId}
                        onChange={(event) => setItemId(event.target.value)}
                        error={errors.item_id}
                    >
                        <option value="">Select an item</option>
                        {items.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name} (current: {item.stock})
                            </option>
                        ))}
                    </FormSelect>

                    <div>
                        <FormInput
                            label="Quantity Change"
                            name="quantity_change"
                            type="number"
                            step="1"
                            required
                            placeholder="e.g. -5 for damaged stock, 10 for a recount correction"
                            value={quantityChange}
                            onChange={(event) =>
                                setQuantityChange(event.target.value)
                            }
                            error={errors.quantity_change}
                        />
                        <p className="mt-1 text-xs font-medium text-slate-400">
                            Use a positive number to add stock, negative to
                            remove it.
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                            Resulting Stock
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                            {resultingStock === null
                                ? '\u2014'
                                : formatNumber(resultingStock)}
                        </span>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
