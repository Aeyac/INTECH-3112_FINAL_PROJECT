<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockLedger;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Purchases/Index', $this->props($request->user()));
    }

    public function show(Request $request, Purchase $purchase): Response
    {
        $user = $request->user();
        abort_unless((int) $purchase->user_id === (int) $user->workspaceId(), 403);

        $purchase->load(['supplier', 'items.item']);

        return Inertia::render('Purchases/Index', array_merge($this->props($user), [
            'purchase' => $purchase,
        ]));
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'supplier_id' => [
                'required',
                'integer',
                Rule::exists('suppliers', 'id')->where(
                    fn($query) => $query->where('user_id', $user->workspaceId())
                ),
            ],
            'purchase_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => [
                'required',
                'integer',
                Rule::exists('items', 'id')->where(
                    fn($query) => $query->where('user_id', $user->workspaceId())
                ),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
        ], [
            'items.required' => 'At least one item is required.',
            'items.*.item_id.exists' => 'Invalid selected item.',
            'items.*.quantity.min' => 'Quantity must be greater than zero.',
            'items.*.unit_cost.min' => 'Unit cost must be zero or greater.',
        ]);

        DB::transaction(function () use ($user, $validated) {
            $purchase = Purchase::create([
                'user_id' => $user->workspaceId(),
                'supplier_id' => $validated['supplier_id'],
                'purchase_date' => $validated['purchase_date'],
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $line) {
                $item = $this->lockItem($user, (int) $line['item_id']);
                $quantity = (int) $line['quantity'];
                $unitCost = (float) $line['unit_cost'];
                $subtotal = round($quantity * $unitCost, 2);

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'item_id' => $item->id,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'subtotal' => $subtotal,
                ]);

                // stock only ever increases through a real recorded purchase
                $item->increment('stock', $quantity);
                $fresh = $item->fresh();

                StockLedger::create([
                    'item_id' => $fresh->id,
                    'type' => 'purchase',
                    'reference_id' => $purchase->id,
                    'quantity_change' => $quantity,
                    'balance_after' => $fresh->stock,
                ]);

                $total += $subtotal;
            }

            $purchase->update(['total_amount' => round($total, 2)]);
        });

        return back()->with('success', 'Purchase recorded successfully.');
    }

    private function props(User $user): array
    {
        return [
            'purchases' => Purchase::query()
                ->with('supplier')
                ->visibleTo($user)
                ->orderByDesc('purchase_date')
                ->orderByDesc('id')
                ->get(),
            'suppliers' => Supplier::query()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(['id', 'name']),
            'items' => Item::query()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(['id', 'name', 'selling_price']),
            'purchase' => null,
            'can' => [
                'manage' => $user->can('manage-purchases'),
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
