import { Head, router } from '@inertiajs/react';
import { Eye, Plus, SearchX, X } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import EmptyState from '../../Components/EmptyState';
import FormInput from '../../Components/FormInput';
import FormSelect from '../../Components/FormSelect';
import Modal from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';
import { formatMoney, today } from '../../lib/format';

export default function PurchasesIndex({
    purchases,
    suppliers,
    items,
    purchase,
    can,
}) {
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [supplierId, setSupplierId] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(today());
    const [rows, setRows] = useState([]);
    const counter = useRef(0);

    const term = search.trim().toLowerCase();
    const filtered = purchases.filter(
        (entry) =>
            term === '' ||
            String(entry.id).includes(term) ||
            (entry.supplier_name ?? '').toLowerCase().includes(term) ||
            String(entry.purchase_date).toLowerCase().includes(term),
    );

    const totalAmount = purchases.reduce(
        (sum, entry) => sum + Number(entry.total_amount || 0),
        0,
    );

    const newRow = () => ({
        key: `row-${counter.current++}`,
        item_id: '',
        quantity: '',
        unit_cost: '',
    });

    const openForm = () => {
        setErrors({});
        setSupplierId('');
        setPurchaseDate(today());
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

    const grandTotal = rows.reduce(
        (sum, row) =>
            sum + Number(row.quantity || 0) * Number(row.unit_cost || 0),
        0,
    );

    const submit = (event) => {
        event.preventDefault();
        setErrors({});

        const payload = {
            supplier_id: supplierId,
            purchase_date: purchaseDate,
            items: rows
                .filter(
                    (row) => row.item_id && Number(row.quantity) > 0,
                )
                .map((row) => ({
                    item_id: row.item_id,
                    quantity: Number(row.quantity),
                    unit_cost: Number(row.unit_cost),
                })),
        };

        router.post('/purchases', payload, {
            preserveScroll: true,
            onError: setErrors,
            onSuccess: () => {
                setFormOpen(false);
                setRows([]);
            },
        });
    };

    const openView = (id) => {
        router.get(`/purchases/${id}`, {}, {
            only: ['purchase'],
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setViewOpen(true),
        });
    };

    const viewItems = purchase?.items ?? [];

    return (
        <AppLayout>
            <Head title="Purchases" />

            <PageHeader
                title="Purchases"
                subtitle="Monitor and record your purchase accross multiple suppliers."
            >
                <div className="flex justify-around divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <div className="pr-4 text-center sm:pr-6 sm:text-left">
                        <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Total Purchase
                        </span>
                        <span className="text-base font-bold text-gray-900 sm:text-lg">
                            {formatMoney(totalAmount)}
                        </span>
                    </div>
                </div>

                {can.manage && (
                    <Button onClick={openForm}>
                        <Plus className="h-4 w-4" />
                        <span>Record Purchase</span>
                    </Button>
                )}
            </PageHeader>

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col items-stretch justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search Purchase..."
                    />
                </div>

                <div className="hidden max-h-[500px] overflow-x-auto overflow-y-auto md:block">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none">
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Purchase ID
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Supplier Name
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Total Amount
                                </th>
                                <th className="px-4 py-3.5 text-left sm:px-6">
                                    Purchase Date
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
                                            PO-{entry.id}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {entry.supplier_name ??
                                            `Supplier #${entry.supplier_id}`}
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {formatMoney(entry.total_amount)}
                                    </td>
                                    <td className="px-4 py-3.5 text-left font-medium text-gray-600 sm:px-6">
                                        {String(entry.purchase_date).slice(0, 10)}
                                    </td>
                                    <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-6">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                type="button"
                                                title="View Purchase"
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
                            title="No purchases found"
                            message="Your purchases table looks empty. Try adjusting your search."
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
                                        PO-{entry.id}
                                    </div>
                                    <div className="text-[11px] font-medium text-gray-400">
                                        {String(entry.purchase_date).slice(0, 10)}
                                    </div>
                                </div>
                                <span className="shrink-0 text-sm font-bold text-gray-900">
                                    {formatMoney(entry.total_amount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                <span className="truncate text-xs font-medium text-gray-600 sm:text-sm">
                                    {entry.supplier_name ??
                                        `Supplier #${entry.supplier_id}`}
                                </span>
                                <button
                                    type="button"
                                    title="View Purchase"
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
                            title="No purchases found"
                            message="Your purchases table looks empty. Try adjusting your search."
                        />
                    )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50">
                    <Pagination
                        showing={filtered.length}
                        total={purchases.length}
                        label="purchases"
                    />
                </div>
            </div>

            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                title="Add Purchase"
                maxWidth="max-w-2xl"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit}>Save Purchase</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <FormSelect
                        label="Supplier"
                        name="supplier_id"
                        required
                        value={supplierId}
                        onChange={(event) =>
                            setSupplierId(event.target.value)
                        }
                        error={errors.supplier_id}
                    >
                        <option value="">Select a supplier</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </FormSelect>

                    <FormInput
                        label="Purchase Date"
                        name="purchase_date"
                        type="date"
                        required
                        value={purchaseDate}
                        onChange={(event) =>
                            setPurchaseDate(event.target.value)
                        }
                        error={errors.purchase_date}
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
                                const subtotal =
                                    Number(row.quantity || 0) *
                                    Number(row.unit_cost || 0);

                                return (
                                    <div
                                        key={row.key}
                                        className="grid grid-cols-12 items-center gap-2"
                                    >
                                        <select
                                            value={row.item_id}
                                            onChange={(event) =>
                                                updateRow(
                                                    row.key,
                                                    'item_id',
                                                    event.target.value,
                                                )
                                            }
                                            className="col-span-5 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800"
                                        >
                                            <option value="">Item</option>
                                            {items.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="Qty"
                                            value={row.quantity}
                                            onChange={(event) =>
                                                updateRow(
                                                    row.key,
                                                    'quantity',
                                                    event.target.value,
                                                )
                                            }
                                            className="col-span-2 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Unit Cost"
                                            value={row.unit_cost}
                                            onChange={(event) =>
                                                updateRow(
                                                    row.key,
                                                    'unit_cost',
                                                    event.target.value,
                                                )
                                            }
                                            className="col-span-3 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800"
                                        />
                                        <span className="col-span-1 text-right text-xs font-semibold text-slate-700">
                                            {formatMoney(subtotal)}
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
                title={`Purchase PO-${purchase?.id ?? ''}`}
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
                {purchase && (
                    <div className="flex flex-col gap-3">
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">
                                Supplier:
                            </span>{' '}
                            {purchase.supplier_name ??
                                `Supplier #${purchase.supplier_id}`}
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">
                                Date:
                            </span>{' '}
                            {String(purchase.purchase_date).slice(0, 10)}
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
                                        Unit Cost
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
                                            {formatMoney(line.unit_cost)}
                                        </td>
                                        <td className="px-3 py-2 text-right text-gray-700">
                                            {formatMoney(
                                                Number(line.quantity) *
                                                Number(line.unit_cost),
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
                                {formatMoney(purchase.total_amount)}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
