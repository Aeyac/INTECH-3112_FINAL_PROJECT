<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\StockLedger;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockLedgerController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('StockLedger/Index', [
            'entries' => StockLedger::query()
                ->with('item')
                ->visibleTo($user)
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->get(),
            'items' => Item::query()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(['id', 'name', 'stock']),
            'can' => [
                'adjust' => $user->can('adjust-stock'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'item_id' => [
                'required',
                'integer',
                Rule::exists('items', 'id')->where(
                    fn($query) => $query->where('user_id', $user->workspaceId())
                ),
            ],
            'quantity_change' => ['required', 'integer', 'not_in:0'],
        ]);

        DB::transaction(function () use ($user, $validated) {
            $item = $this->lockItem($user, (int) $validated['item_id']);
            $change = (int) $validated['quantity_change'];
            $newBalance = $item->stock + $change;

            if ($newBalance < 0) {
                throw ValidationException::withMessages([
                    'quantity_change' => "Adjustment would drop stock below zero (currently {$item->stock}).",
                ]);
            }

            $item->increment('stock', $change);
            $fresh = $item->fresh();

            StockLedger::create([
                'item_id' => $fresh->id,
                'type' => 'adjustment',
                'reference_id' => null,
                'quantity_change' => $change,
                'balance_after' => $fresh->stock,
            ]);
        });

        return back()->with('success', 'Stock adjustment recorded successfully.');
    }

    private function lockItem(User $user, int $itemId): Item
    {
        return Item::query()
            ->where('user_id', $user->workspaceId())
            ->lockForUpdate()
            ->findOrFail($itemId);
    }
}
