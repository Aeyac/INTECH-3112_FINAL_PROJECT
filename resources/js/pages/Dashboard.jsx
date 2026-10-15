import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import Card from '../Components/Card';
import ToggleTabs from '../Components/ToggleTabs';
import { formatMoney, formatNumber } from '../lib/format';

function ChangeBadge({ pct }) {
    if (pct === null || pct === undefined) {
        return (
            <span className="text-xs font-semibold text-gray-400">New</span>
        );
    }

    const positive = Number(pct) >= 0;
    const Icon = positive ? TrendingUp : TrendingDown;

    return (
        <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'
                }`}
        >
            <Icon className="h-3 w-3" />
            {positive ? '+' : ''}
            {Number(pct).toFixed(1)}%
        </span>
    );
}

export default function Dashboard({ stats, trends, lowStock, bestSelling }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const [bestMode, setBestMode] = useState('quantity');

    useEffect(() => {
        let mounted = true;

        import('chart.js/auto').then(({ default: Chart }) => {
            if (!mounted || !canvasRef.current) return;

            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const totals = trends.months.map(
                (_, index) => trends.spend[index] + trends.sales[index],
            );

            chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: trends.months,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Volume',
                            data: totals,
                            backgroundColor: 'rgba(148, 163, 184, 0.12)',
                            borderRadius: 6,
                            barPercentage: 0.9,
                            categoryPercentage: 0.9,
                            order: 3,
                        },
                        {
                            type: 'line',
                            label: 'Spend',
                            data: trends.spend,
                            borderColor: '#818cf8',
                            backgroundColor: '#818cf8',
                            borderWidth: 2.5,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            order: 1,
                        },
                        {
                            type: 'line',
                            label: 'Sales',
                            data: trends.sales,
                            borderColor: '#111827',
                            backgroundColor: '#111827',
                            borderWidth: 2.5,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            order: 2,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    if (context.dataset.label === 'Volume') {
                                        return null;
                                    }

                                    return `${context.dataset.label}: ${formatMoney(context.parsed.y)}`;
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 11, weight: '600' },
                            },
                        },
                        y: { display: false },
                    },
                },
            });
        });

        return () => {
            mounted = false;
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [trends]);

    const bestItems =
        bestMode === 'quantity'
            ? bestSelling.by_quantity
            : bestSelling.by_revenue;

    const rankStyles = ['text-amber-500', 'text-gray-400', 'text-orange-700'];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {lowStock.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                        {lowStock.length} item(s) at or below their safety stock
                        level. Review your inventory.
                    </span>
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Dashboard
                </h1>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    A quick overview of your inventory movement, spending, and
                    sales performance for this month.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatBlock
                    label="Monthly Spend"
                    value={formatMoney(stats.monthly_spend)}
                    change={stats.monthly_spend_change_pct}
                />
                <StatBlock
                    label="Monthly Revenue"
                    value={formatMoney(stats.monthly_revenue)}
                    change={stats.monthly_revenue_change_pct}
                />
                <StatBlock
                    label="Net Profit"
                    value={formatMoney(stats.net_profit)}
                    change={stats.net_profit_change_pct}
                />
            </div>

            <Card className="sm:p-6">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            Performance Trends
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Monthly Performance: Spend vs Sales
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-indigo-400" />{' '}
                            Spend
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-gray-900" />{' '}
                            Sales
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="relative h-[320px] min-w-[900px]">
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="sm:p-6">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                Low Stock Alerts
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Immediate attention required
                            </p>
                        </div>
                        <Link
                            href="/items"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:text-gray-900"
                        >
                            <span>View Items</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="flex flex-col">
                        {lowStock.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-400">
                                All items are above their safety stock level.
                            </p>
                        ) : (
                            lowStock.map((item) => {
                                const isOut = item.status === 'out';

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {item.name}
                                            </div>
                                            <div className="text-[11px] font-medium text-gray-400">
                                                {item.sku}
                                            </div>
                                        </div>
                                        <span
                                            className={`text-xs font-bold ${isOut
                                                ? 'text-rose-600'
                                                : 'text-amber-600'
                                                }`}
                                        >
                                            {isOut
                                                ? 'Out of Stock'
                                                : `${item.stock} Left`}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                <Card className="sm:p-6">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                Best Selling
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Top performers this month
                            </p>
                        </div>
                        <ToggleTabs
                            value={bestMode}
                            onChange={setBestMode}
                            options={[
                                { label: 'Quantity', value: 'quantity' },
                                { label: 'Revenue', value: 'revenue' },
                            ]}
                        />
                    </div>

                    <div className="flex flex-col">
                        {bestItems.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-400">
                                No sales recorded this month yet.
                            </p>
                        ) : (
                            bestItems.map((item, index) => (
                                <div
                                    key={item.item_id}
                                    className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`w-5 text-sm font-extrabold ${rankStyles[index] ?? 'text-gray-300'}`}
                                        >
                                            {String(index + 1).padStart(
                                                2,
                                                '0',
                                            )}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">
                                        {bestMode === 'quantity'
                                            ? `${formatNumber(item.quantity_sold)} Sold`
                                            : formatMoney(item.revenue)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}

function StatBlock({ label, value, change }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className="mb-2 block text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                {label}
            </span>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">
                    {value}
                </span>
                <ChangeBadge pct={change} />
            </div>
        </div>
    );
}
