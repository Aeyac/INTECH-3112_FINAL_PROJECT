import { Head, router } from '@inertiajs/react';
import { Eye, Plus, SearchX, X } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import EmptyState from '../../Components/EmptyState';
import FormInput from '../../Components/FormInput';
import Modal from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';
import { formatMoney, today } from '../../lib/format';

export default function SalesIndex({ sales, items, sale, can }) {
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [saleDate, setSaleDate] = useState(today());
    const [rows, setRows] = useState([]);
    const counter = useRef(0);

    const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));

    const term = search.trim().toLowerCase();
    const filtered = sales.filter(
        (entry) =>
            term === '' ||
            String(entry.id).includes(term) ||
            String(entry.sale_date).toLowerCase().includes(term),
    );

    const totalAmount = sales.reduce(
        (sum, entry) => sum + Number(entry.total_amount || 0),
        0,
    );

    const newRow = () => ({
        key: `row-${counter.current++}`,
        item_id: '',
        quantity: '',
    });

    const openForm = () => {
        setErrors({});
        setSaleDate(today());
        setRows([newRow()]);
        setFormOpen(true);
    };

    const updateRow = (key, field, value) => {
        setRows((current) =>
            current.map((row) =>
                row.key === key ? { ...row, [field]: value } : row,
            ),
        );
    };

    const removeRow = (key) => {
        setRows((current) => current.filter((row) => row.key !== key));
    };

    const rowSubtotal = (row) =>
        Number(itemsById[row.item_id]?.selling_price || 0) *
        Number(row.quantity || 0);

    const grandTotal = rows.reduce((sum, row) => sum + rowSubtotal(row), 0);

    const submit = (event) => {
        event.preventDefault();
        setErrors({});

        const payload = {
            sale_date: saleDate,
            items: rows
                .filter((row) => row.item_id && Number(row.quantity) > 0)
                .map((row) => ({
                    item_id: row.item_id,
                    quantity: Number(row.quantity),
                })),
        };

        router.post('/sales', payload, {
            preserveScroll: true,
            onError: setErrors,
            onSuccess: () => {
                setFormOpen(false);
                setRows([]);
            },
        });
    };

    const openView = (id) => {
        router.get(`/sales/${id}`, {}, {
            only: ['sale'],
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setViewOpen(true),
        });
    };

    const viewItems = sale?.items ?? [];

    return (
        <AppLayout>
            <Head title="Sales" />

            <PageHeader
                title="Sales"
                subtitle="Record and review outgoing stock sold to customers"
            >
                <div className="flex justify-around divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <div className="pr-4 text-center sm:pr-6 sm:text-left">
                        <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Total Sales
                        </span>
                        <span className="text-base font-bold text-gray-900 sm:text-lg">
                            {formatMoney(totalAmount)}
                        </span>
                    </div>
                </div>

                {can.record && (
                    <Button onClick={openForm}>
                        <Plus className="h-4 w-4" />
                        <span>Record Sale</span>
                    </Button>
                )}
            </PageHeader>

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col items-stretch justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search Sales..."
                    />
                </div>

                <div className="hidden max-h-[500px] overflow-x-auto overflow-y-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none">
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Sale ID
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Sale Date
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Total Amount
                                </th>
                                <th className="px-4 py-3.5 text-right sm:px-6">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                            {filtered.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className="group transition hover:bg-gray-50/80"
                                >
                                    <td className="px-4 py-3.5 text-left sm:px-6">
                                        <div className="font-bold text-gray-900 transition group-hover:text-blue-600">
                                            SO-{entry.id}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {String(entry.sale_date).slice(0, 10)}
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {formatMoney(entry.total_amount)}
                                    </td>
                                    <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-6">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                type="button"
                                                title="View Sale"
                                                onClick={() => openView(entry.id)}
                                                className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={SearchX}
                            title="No sales found"
                            message="Your sales table looks empty. Try adjusting your search."
                        />
                    )}
                </div>

                <div className="divide-y divide-gray-100 md:hidden">
                    {filtered.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex flex-col gap-2.5 p-4 transition hover:bg-gray-50/80"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate font-bold text-gray-900">
                                        SO-{entry.id}
                                    </div>
                                    <div className="text-[11px] font-medium text-gray-400">
                                        {String(entry.sale_date).slice(0, 10)}
                                    </div>
                                </div>
                                <span className="shrink-0 text-sm font-bold text-gray-900">
                                    {formatMoney(entry.total_amount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-end border-t border-gray-100 pt-2">
                                <button
                                    type="button"
                                    title="View Sale"
                                    onClick={() => openView(entry.id)}
                                    className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={SearchX}
                            title="No sales found"
                            message="Your sales table looks empty. Try adjusting your search."
                        />
                    )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50">
                    <Pagination
                        showing={filtered.length}
                        total={sales.length}
                        label="sales"
                    />
                </div>
            </div>

            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                title="Add Sale"
                maxWidth="max-w-2xl"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit}>Record Sale</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <FormInput
                        label="Sale Date"
                        name="sale_date"
                        type="date"
                        required
                        value={saleDate}
                        onChange={(event) => setSaleDate(event.target.value)}
                        error={errors.sale_date}
                    />

                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                                Items <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    setRows((current) => [...current, newRow()])
                                }
                                className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                                + Add Item
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {rows.map((row) => {
                                const selected = itemsById[row.item_id];
                                const price = Number(
                                    selected?.selling_price || 0,
                                );
                                const stock = Number(selected?.stock || 0);

                                return (
                                    <div
                                        key={row.key}
                                        className="grid grid-cols-12 items-center gap-2"
                                    >
                                        <select
                                            value={row.item_id}
                                            onChange={(event) => {
                                                updateRow(
                                                    row.key,
                                                    'item_id',
                                                    event.target.value,
                                                );
                                                updateRow(row.key, 'quantity', '');
                                            }}
                                            className="col-span-5 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800"
                                        >
                                            <option value="">Item</option>
                                            {items.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name} ({item.stock} in
                                                    stock)
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            max={stock || undefined}
                                            disabled={!row.item_id}
                                            placeholder="Qty"
                                            value={row.quantity}
                                            onChange={(event) =>
                                                updateRow(
                                                    row.key,
                                                    'quantity',
                                                    event.target.value,
                                                )
                                            }
                                            className="col-span-2 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800 disabled:bg-slate-50"
                                        />
                                        <span className="col-span-2 text-right text-xs font-medium text-slate-500">
                                            {formatMoney(price)} / unit
                                        </span>
                                        <span className="col-span-2 text-right text-xs font-semibold text-slate-700">
                                            {formatMoney(rowSubtotal(row))}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(row.key)}
                                            className="col-span-1 cursor-pointer text-gray-400 hover:text-red-600"
                                        >
                                            <X className="mx-auto h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {errors.items && (
                            <p className="mt-1 text-xs font-medium text-rose-500">
                                {errors.items}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                            Grand Total
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                            {formatMoney(grandTotal)}
                        </span>
                    </div>
                </form>
            </Modal>

            <Modal
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                title={`Sale SO-${sale?.id ?? ''}`}
                maxWidth="max-w-2xl"
                footer={
                    <Button
                        variant="secondary"
                        onClick={() => setViewOpen(false)}
                    >
                        Close
                    </Button>
                }
            >
                {sale && (
                    <div className="flex flex-col gap-3">
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">
                                Date:
                            </span>{' '}
                            {String(sale.sale_date).slice(0, 10)}
                        </div>

                        <table className="mt-2 w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    <th className="px-3 py-2 text-left">
                                        Item
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        Qty
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        Unit Price
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewItems.map((line) => (
                                    <tr key={line.id}>
                                        <td className="px-3 py-2 text-left text-gray-700">
                                            {line.item_name ??
                                                `Item #${line.item_id}`}
                                        </td>
                                        <td className="px-3 py-2 text-right text-gray-700">
                                            {line.quantity}
                                        </td>
                                        <td className="px-3 py-2 text-right text-gray-700">
                                            {formatMoney(line.unit_price)}
                                        </td>
                                        <td className="px-3 py-2 text-right text-gray-700">
                                            {formatMoney(
                                                Number(line.quantity) *
                                                Number(line.unit_price),
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                                Total Amount
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                                {formatMoney(sale.total_amount)}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
