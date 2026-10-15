<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $now = Carbon::now();
        $year = (int) $now->year;
        $month = (int) $now->month;
        $previous = $now->copy()->subMonthNoOverflow();

        $purchases = Purchase::query()->visibleTo($user);
        $sales = Sale::query()->visibleTo($user);

        $monthlySpend = $this->monthlyTotal($purchases, 'purchase_date', $year, $month);
        $lastMonthSpend = $this->monthlyTotal($purchases, 'purchase_date', (int) $previous->year, (int) $previous->month);
        $monthlyRevenue = $this->monthlyTotal($sales, 'sale_date', $year, $month);
        $lastMonthRevenue = $this->monthlyTotal($sales, 'sale_date', (int) $previous->year, (int) $previous->month);

        $netProfit = $monthlyRevenue - $monthlySpend;
        $lastNetProfit = $lastMonthRevenue - $lastMonthSpend;

        $stats = [
            'monthly_spend' => round($monthlySpend, 2),
            'monthly_spend_change_pct' => $this->roundIfNotNull($this->percentChange($monthlySpend, $lastMonthSpend)),
            'monthly_revenue' => round($monthlyRevenue, 2),
            'monthly_revenue_change_pct' => $this->roundIfNotNull($this->percentChange($monthlyRevenue, $lastMonthRevenue)),
            'net_profit' => round($netProfit, 2),
            'net_profit_change_pct' => $this->roundIfNotNull($this->percentChange($netProfit, $lastNetProfit)),
        ];

        $trends = $this->trends($purchases, $sales, $year);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'trends' => $trends,
            'lowStock' => $this->lowStock($user),
            'bestSelling' => $this->bestSelling($user, $year, $month),
        ]);
    }

    private function trends(Builder $purchases, Builder $sales, int $year): array
    {
        $monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        $spendByMonth = array_fill(1, 12, 0.0);
        $salesByMonth = array_fill(1, 12, 0.0);

        $spendRows = (clone $purchases)
            ->whereYear('purchase_date', $year)
            ->selectRaw('MONTH(purchase_date) as month_number, SUM(total_amount) as total')
            ->groupBy('month_number')
            ->pluck('total', 'month_number');

        foreach ($spendRows as $monthNumber => $total) {
            $spendByMonth[(int) $monthNumber] = round((float) $total, 2);
        }

        $salesRows = (clone $sales)
            ->whereYear('sale_date', $year)
            ->selectRaw('MONTH(sale_date) as month_number, SUM(total_amount) as total')
            ->groupBy('month_number')
            ->pluck('total', 'month_number');

        foreach ($salesRows as $monthNumber => $total) {
            $salesByMonth[(int) $monthNumber] = round((float) $total, 2);
        }

        return [
            'months' => $monthLabels,
            'spend' => array_values($spendByMonth),
            'sales' => array_values($salesByMonth),
        ];
    }

    private function lowStock($user): array
    {
        return Item::query()
            ->visibleTo($user)
            ->whereColumn('stock', '<=', 'safety_stock')
            ->orderBy('stock')
            ->limit(10)
            ->get()
            ->map(fn(Item $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'sku' => 'ITM-' . str_pad((string) $item->id, 2, '0', STR_PAD_LEFT),
                'stock' => $item->stock,
                'safety_stock' => $item->safety_stock,
                'status' => $item->stock === 0 ? 'out' : 'low',
            ])
            ->all();
    }

    private function bestSelling($user, int $year, int $month): array
    {
        $rows = SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->join('items', 'items.id', '=', 'sale_items.item_id')
            ->whereYear('sales.sale_date', $year)
            ->whereMonth('sales.sale_date', $month)
            ->where('items.user_id', $user->workspaceId())
            ->selectRaw('sale_items.item_id as item_id, items.name as name, SUM(sale_items.quantity) as qty, SUM(sale_items.subtotal) as revenue')
            ->groupBy('sale_items.item_id', 'items.name')
            ->get();

        $sellingItems = $rows->map(fn($row) => [
            'item_id' => (int) $row->item_id,
            'name' => $row->name,
            'quantity_sold' => (int) $row->qty,
            'revenue' => round((float) $row->revenue, 2),
        ]);

        return [
            'by_quantity' => $sellingItems->sortByDesc('quantity_sold')->take(5)->values()->all(),
            'by_revenue' => $sellingItems->sortByDesc('revenue')->take(5)->values()->all(),
        ];
    }

    private function monthlyTotal(Builder $query, string $column, int $year, int $month): float
    {
        return (float) (clone $query)
            ->whereYear($column, $year)
            ->whereMonth($column, $month)
            ->sum('total_amount');
    }

    private function percentChange(float $current, float $previous): ?float
    {
        if ($previous == 0.0) {
            return $current == 0.0 ? 0.0 : null;
        }

        return (($current - $previous) / abs($previous)) * 100;
    }

    private function roundIfNotNull(?float $value): ?float
    {
        return $value === null ? null : round($value, 1);
    }
}
