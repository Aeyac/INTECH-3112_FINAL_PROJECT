<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockLedger;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Sales/Index', $this->props($request->user()));
    }

    public function show(Request $request, Sale $sale): Response
    {
        $user = $request->user();
        abort_unless((int) $sale->user_id === (int) $user->workspaceId(), 403);

        $sale->load(['items.item']);

        return Inertia::render('Sales/Index', array_merge($this->props($user), [
            'sale' => $sale,
        ]));
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'sale_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => [
                'required',
                'integer',
                Rule::exists('items', 'id')->where(
                    fn($query) => $query->where('user_id', $user->workspaceId())
                ),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ], [
            'items.required' => 'At least one item is required.',
            'items.*.item_id.exists' => 'Invalid item selected.',
            'items.*.quantity.min' => 'Quantity must be greater than zero.',
        ]);

        DB::transaction(function () use ($user, $validated) {
            $sale = Sale::create([
                'user_id' => $user->workspaceId(),
                'sale_date' => $validated['sale_date'],
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $index => $line) {
                $item = $this->lockItem($user, (int) $line['item_id']);
                $quantity = (int) $line['quantity'];

                // business rule: can't sell more than what's currently in stock
                if ($quantity > $item->stock) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" => "Only {$item->stock} unit(s) of \"{$item->name}\" left in stock.",
                    ]);
                }

                // selling price ALWAYS comes from the item record, never trusted from the client
                $unitPrice = (float) $item->selling_price;
                $subtotal = round($quantity * $unitPrice, 2);

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'item_id' => $item->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                $item->decrement('stock', $quantity);
                $fresh = $item->fresh();

                StockLedger::create([
                    'item_id' => $fresh->id,
                    'type' => 'sale',
                    'reference_id' => $sale->id,
                    'quantity_change' => -$quantity,
                    'balance_after' => $fresh->stock,
                ]);

                $total += $subtotal;
            }

            $sale->update(['total_amount' => round($total, 2)]);
        });

        return back()->with('success', 'Sale recorded successfully.');
    }

    private function props(User $user): array
    {
        return [
            'sales' => Sale::query()
                ->visibleTo($user)
                ->orderByDesc('sale_date')
                ->orderByDesc('id')
                ->get(),
            'items' => Item::query()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(['id', 'name', 'stock', 'selling_price']),
            'sale' => null,
            'can' => [
                'record' => $user->can('record-sales'),
            ],
        ];
    }

    private function lockItem(User $user, int $itemId): Item
    {
        return Item::query()
            ->where('user_id', $user->workspaceId())
            ->lockForUpdate()
            ->findOrFail($itemId);
    }
}
